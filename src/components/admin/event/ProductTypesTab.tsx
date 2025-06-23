
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductType, BaseProductType, RetailerCode } from "@/types";
import { ProductTypesList } from "./ProductTypesList";
import { AddProductTypeForm } from "./AddProductTypeForm";
import { getAllProductTypes, createProductType } from "@/services/supabase/productTypes";
import { createSample } from "@/services/supabase/samples";
import { useToast } from "@/hooks/use-toast";

interface ProductTypesTabProps {
  productTypes: ProductType[];
  refreshEventData: () => Promise<void>;
  eventId: string;
}

export function ProductTypesTab({
  productTypes,
  refreshEventData,
  eventId,
}: ProductTypesTabProps) {
  const { toast } = useToast();
  
  // Form state
  const [isLoadingProductTypes, setIsLoadingProductTypes] = useState(false);
  const [availableProductTypes, setAvailableProductTypes] = useState<BaseProductType[]>([]);
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [selectedProductTypeId, setSelectedProductTypeId] = useState("");
  const [baseCode, setBaseCode] = useState("");
  const [customerCode, setCustomerCode] = useState("");
  const [sampleCount, setSampleCount] = useState(3);
  const [samples, setSamples] = useState<Array<{ brand: string; retailerCode: RetailerCode }>>([
    { brand: "", retailerCode: RetailerCode.LI },
    { brand: "", retailerCode: RetailerCode.KL },
    { brand: "", retailerCode: RetailerCode.KO },
  ]);
  const [isUpdating, setIsUpdating] = useState(false);

  // Load available product types on mount
  useEffect(() => {
    loadAvailableProductTypes();
  }, []);

  // Update samples when sample count changes
  useEffect(() => {
    if (sampleCount !== samples.length) {
      const newSamples = [...samples];
      
      if (sampleCount > samples.length) {
        // Add new samples
        for (let i = samples.length; i < sampleCount; i++) {
          newSamples.push({ brand: "", retailerCode: RetailerCode.LI });
        }
      } else {
        // Remove excess samples
        newSamples.splice(sampleCount);
      }
      
      setSamples(newSamples);
    }
  }, [sampleCount, samples.length]);

  // Set first available product type as selected when types are loaded
  useEffect(() => {
    if (availableProductTypes.length > 0 && !selectedProductTypeId) {
      setSelectedProductTypeId(availableProductTypes[0].id);
    }
  }, [availableProductTypes, selectedProductTypeId]);

  const loadAvailableProductTypes = async () => {
    setIsLoadingProductTypes(true);
    try {
      const allTypes = await getAllProductTypes();
      
      // Filter out types that are already added to this event
      const usedTypeIds = productTypes.map(pt => pt.baseProductTypeId).filter(Boolean);
      const available = allTypes.filter(type => !usedTypeIds.includes(type.id));
      
      setAvailableProductTypes(available);
    } catch (error) {
      console.error('Error loading product types:', error);
      toast({
        title: "Greška",
        description: "Nije moguće učitati tipove proizvoda.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProductTypes(false);
    }
  };

  const handleToggleAddProductForm = () => {
    setShowAddProductForm(!showAddProductForm);
  };

  const handleBrandChange = (index: number, value: string) => {
    const newSamples = [...samples];
    newSamples[index].brand = value;
    setSamples(newSamples);
  };

  const handleRetailerChange = (index: number, value: RetailerCode) => {
    const newSamples = [...samples];
    newSamples[index].retailerCode = value;
    setSamples(newSamples);
  };

  const handleAddSample = () => {
    if (samples.length < 10) {
      setSamples([...samples, { brand: "", retailerCode: RetailerCode.LI }]);
      setSampleCount(samples.length + 1);
    }
  };

  const handleRemoveSample = (index: number) => {
    if (samples.length > 1) {
      const newSamples = samples.filter((_, i) => i !== index);
      setSamples(newSamples);
      setSampleCount(newSamples.length);
    }
  };

  const validateForm = () => {
    if (!selectedProductTypeId) {
      toast({
        title: "Greška",
        description: "Molimo odaberite tip proizvoda.",
        variant: "destructive",
      });
      return false;
    }

    if (!customerCode || customerCode.length !== 4 || !/^\d{4}$/.test(customerCode)) {
      toast({
        title: "Greška",
        description: "Šifra kupca mora biti točno 4 znamenke.",
        variant: "destructive",
      });
      return false;
    }

    if (!baseCode.trim()) {
      toast({
        title: "Greška",
        description: "Molimo unesite šifru uzorka.",
        variant: "destructive",
      });
      return false;
    }

    // Check if base code already exists for this event
    const existingCodes = productTypes.map(pt => pt.baseCode.toUpperCase());
    if (existingCodes.includes(baseCode.toUpperCase())) {
      toast({
        title: "Greška",
        description: "Šifra uzorka već postoji za ovaj događaj.",
        variant: "destructive",
      });
      return false;
    }

    // Validate that all samples have brands
    const emptySamples = samples.filter(sample => !sample.brand.trim());
    if (emptySamples.length > 0) {
      toast({
        title: "Greška",
        description: "Molimo unesite nazive brendova za sve uzorke.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleAddProductType = async () => {
    if (!validateForm()) return;

    setIsUpdating(true);
    try {
      // Create the product type
      const newProductType = await createProductType(
        eventId,
        customerCode,
        selectedProductTypeId,
        baseCode.toUpperCase(),
        productTypes.length + 1 // display order
      );

      // Create samples for the product type
      for (const sample of samples) {
        await createSample(
          newProductType.id,
          sample.brand,
          sample.retailerCode
        );
      }

      // Reset form
      resetForm();
      
      // Refresh data
      await refreshEventData();
      await loadAvailableProductTypes();

      toast({
        title: "Uspjeh",
        description: "Tip proizvoda je uspješno dodan.",
      });

    } catch (error) {
      console.error('Error adding product type:', error);
      toast({
        title: "Greška",
        description: "Došlo je do greške pri dodavanju tipa proizvoda.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const resetForm = () => {
    setSelectedProductTypeId(availableProductTypes.length > 0 ? availableProductTypes[0].id : "");
    setBaseCode("");
    setCustomerCode("");
    setSampleCount(3);
    setSamples([
      { brand: "", retailerCode: RetailerCode.LI },
      { brand: "", retailerCode: RetailerCode.KL },
      { brand: "", retailerCode: RetailerCode.KO },
    ]);
    setShowAddProductForm(false);
  };

  const handleEditProductType = async (productTypeId: string, customerCode: string, baseCode: string): Promise<void> => {
    // This would require implementing edit functionality in the backend
    console.log('Edit product type:', productTypeId, customerCode, baseCode);
    toast({
      title: "Informacija",
      description: "Funkcionalnost uređivanja će biti implementirana u sljedećoj verziji.",
    });
  };

  const handleDeleteProductType = async (productTypeId: string): Promise<void> => {
    // This would require implementing delete functionality in the backend
    console.log('Delete product type:', productTypeId);
    toast({
      title: "Informacija",
      description: "Funkcionalnost brisanja će biti implementirana u sljedećoj verziji.",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tipovi proizvoda</CardTitle>
        <CardDescription>
          Upravljanje tipovima proizvoda i uzorcima za ovaj događaj.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {productTypes.length === 0 ? (
          <div className="text-center p-6 border rounded-lg">
            <p className="text-muted-foreground mb-4">Nema dodanih tipova proizvoda.</p>
            <p className="text-sm text-muted-foreground mb-6">
              Dodajte tipove proizvoda da biste mogli generirati randomizacije.
            </p>
            
            <AddProductTypeForm
              isLoadingProductTypes={isLoadingProductTypes}
              availableProductTypes={availableProductTypes}
              showAddProductForm={showAddProductForm}
              selectedProductTypeId={selectedProductTypeId}
              baseCode={baseCode}
              customerCode={customerCode}
              sampleCount={sampleCount}
              samples={samples}
              isUpdating={isUpdating}
              onSelectedProductTypeIdChange={setSelectedProductTypeId}
              onBaseCodeChange={setBaseCode}
              onCustomerCodeChange={setCustomerCode}
              onSampleCountChange={setSampleCount}
              onBrandChange={handleBrandChange}
              onRetailerChange={handleRetailerChange}
              onAddSample={handleAddSample}
              onRemoveSample={handleRemoveSample}
              onToggleAddProductForm={handleToggleAddProductForm}
              onAddProductType={handleAddProductType}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Dodani tipovi proizvoda</h3>
              <AddProductTypeForm
                isLoadingProductTypes={isLoadingProductTypes}
                availableProductTypes={availableProductTypes}
                showAddProductForm={showAddProductForm}
                selectedProductTypeId={selectedProductTypeId}
                baseCode={baseCode}
                customerCode={customerCode}
                sampleCount={sampleCount}
                samples={samples}
                isUpdating={isUpdating}
                onSelectedProductTypeIdChange={setSelectedProductTypeId}
                onBaseCodeChange={setBaseCode}
                onCustomerCodeChange={setCustomerCode}
                onSampleCountChange={setSampleCount}
                onBrandChange={handleBrandChange}
                onRetailerChange={handleRetailerChange}
                onAddSample={handleAddSample}
                onRemoveSample={handleRemoveSample}
                onToggleAddProductForm={handleToggleAddProductForm}
                onAddProductType={handleAddProductType}
              />
            </div>
            
            <ProductTypesList 
              productTypes={productTypes} 
              onRefresh={refreshEventData}
              onEditProductType={handleEditProductType}
              onDeleteProductType={handleDeleteProductType}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
