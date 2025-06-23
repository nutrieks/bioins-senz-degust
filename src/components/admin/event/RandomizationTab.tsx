
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductType } from "@/types";
import { RandomizationProductList } from "./RandomizationProductList";
import { RandomizationTable } from "./RandomizationTable";
import { getRandomization } from "@/services/supabase/randomization";
import { useToast } from "@/hooks/use-toast";

interface RandomizationTabProps {
  productTypes: ProductType[];
  generatingRandomization: { [productTypeId: string]: boolean };
  onGenerateRandomization: (productTypeId: string) => Promise<void>;
}

export function RandomizationTab({
  productTypes,
  generatingRandomization,
  onGenerateRandomization,
}: RandomizationTabProps) {
  const [selectedProductType, setSelectedProductType] = useState<ProductType | null>(null);
  const [randomizationData, setRandomizationData] = useState<any>(null);
  const [isLoadingRandomization, setIsLoadingRandomization] = useState(false);
  const { toast } = useToast();

  const handleViewRandomization = async (productType: ProductType): Promise<void> => {
    setIsLoadingRandomization(true);
    try {
      console.log('Fetching randomization for product type:', productType.id);
      const randomization = await getRandomization(productType.id);
      
      if (randomization && randomization.randomization_table) {
        console.log('Randomization found:', randomization);
        setRandomizationData(randomization.randomization_table);
        setSelectedProductType(productType);
      } else {
        console.log('No randomization found for product type:', productType.id);
        toast({
          title: "Greška",
          description: "Randomizacija nije pronađena za ovaj tip proizvoda.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching randomization:', error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom dohvaćanja randomizacije.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingRandomization(false);
    }
  };

  const handleBackToList = () => {
    setSelectedProductType(null);
    setRandomizationData(null);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // Simple export functionality - could be enhanced
    const dataStr = JSON.stringify(randomizationData, null, 2);
    const dataBlob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `randomization-${selectedProductType?.productName || 'table'}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleNavigateNext = () => {
    if (!selectedProductType) return;
    
    const currentIndex = productTypes.findIndex(pt => pt.id === selectedProductType.id);
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < productTypes.length) {
      const nextProductType = productTypes[nextIndex];
      if (nextProductType.hasRandomization) {
        handleViewRandomization(nextProductType);
      }
    }
  };

  const handleNavigatePrev = () => {
    if (!selectedProductType) return;
    
    const currentIndex = productTypes.findIndex(pt => pt.id === selectedProductType.id);
    const prevIndex = currentIndex - 1;
    
    if (prevIndex >= 0) {
      const prevProductType = productTypes[prevIndex];
      if (prevProductType.hasRandomization) {
        handleViewRandomization(prevProductType);
      }
    }
  };

  if (selectedProductType && randomizationData) {
    const currentIndex = productTypes.findIndex(pt => pt.id === selectedProductType.id);
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Randomizacija</CardTitle>
          <CardDescription>
            Pregled randomizacijske tablice.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RandomizationTable
            selectedProductType={selectedProductType}
            randomizationTable={randomizationData}
            onNavigateNext={handleNavigateNext}
            onNavigatePrev={handleNavigatePrev}
            onPrint={handlePrint}
            onExport={handleExport}
            onBack={handleBackToList}
            productTypeIndex={currentIndex}
            totalProductTypes={productTypes.length}
          />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Randomizacija</CardTitle>
        <CardDescription>
          Generiranje i pregled randomizacije uzoraka.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {productTypes.length === 0 ? (
          <div className="text-center p-6 border rounded-lg">
            <p className="text-muted-foreground">
              Nema dodanih tipova proizvoda za koje bi se mogla generirati randomizacija.
            </p>
          </div>
        ) : (
          <RandomizationProductList 
            productTypes={productTypes}
            generatingRandomization={generatingRandomization}
            onGenerateRandomization={onGenerateRandomization}
            onViewRandomization={handleViewRandomization}
            isLoadingRandomization={isLoadingRandomization}
          />
        )}
      </CardContent>
    </Card>
  );
}
