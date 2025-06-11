import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  getEvent, 
  updateEventStatus, 
  getAllProductTypes, 
  createProductType, 
  createRandomization,
  createSample,
  getRandomization,
  getProductTypes,
  deleteEventProductType,
  updateEventProductType,
  deleteEvent
} from "@/services/dataService";
import { Event, EventStatus, BaseProductType, ProductType, RetailerCode } from "@/types";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/utils/dateUtils";
import { getStatusLabel } from "@/utils/eventUtils";
import { EventInfoCard } from "@/components/admin/event/EventInfoCard";
import { ProductTypesTab } from "@/components/admin/event/ProductTypesTab";
import { RandomizationTab } from "@/components/admin/event/RandomizationTab";
import { ReportsTab } from "@/components/admin/event/ReportsTab";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { RawDataTab } from "@/components/admin/event/RawDataTab";

export default function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showAddProductForm, setShowAddProductForm] = useState(false);
  const [availableProductTypes, setAvailableProductTypes] = useState<BaseProductType[]>([]);
  const [selectedProductTypeId, setSelectedProductTypeId] = useState<string>("");
  const [isLoadingProductTypes, setIsLoadingProductTypes] = useState(false);
  const [baseCode, setBaseCode] = useState<string>("");
  const [customerCode, setCustomerCode] = useState<string>("");
  const [sampleCount, setSampleCount] = useState<number>(3);
  const [samples, setSamples] = useState<Array<{brand: string, retailerCode: RetailerCode}>>([
    { brand: "", retailerCode: RetailerCode.LI }
  ]);
  const [randomizationView, setRandomizationView] = useState<boolean>(false);
  const [randomizationTable, setRandomizationTable] = useState<any>(null);
  const [selectedProductType, setSelectedProductType] = useState<ProductType | null>(null);
  
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchEvent = async () => {
    if (!eventId) return;
    try {
      console.log('=== EventDetail fetchEvent POČETAK ===');
      console.log('Event ID:', eventId);
      setIsLoading(true);
      
      const eventData = await getEvent(eventId);
      console.log('EventDetail - eventData dobiven:', eventData);
      
      if (!eventData) {
        console.error('EventDetail - event nije pronađen');
        navigate("/admin");
        return;
      }
      
      // Eksplicitno dohvati najnovije tipove proizvoda
      console.log('EventDetail - dohvaćam tipove proizvoda eksplicitno...');
      const latestProductTypes = await getProductTypes(eventId);
      console.log('EventDetail - najnoviji tipovi proizvoda:', latestProductTypes.length, latestProductTypes);
      
      const updatedProductTypes = latestProductTypes.map((pt: ProductType) => ({
        ...pt,
        hasRandomization: !!pt.hasRandomization
      }));
      
      const updatedEvent = {
        ...eventData,
        productTypes: updatedProductTypes
      };
      
      console.log('EventDetail - postavljam event s tipovima:', updatedEvent.productTypes.length);
      setEvent(updatedEvent);
      
    } catch (error) {
      console.error("EventDetail - Error fetching event:", error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom dohvaćanja podataka o događaju.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      console.log('=== EventDetail fetchEvent ZAVRŠETAK ===');
    }
  };

  const fetchAvailableProductTypes = async () => {
    try {
      setIsLoadingProductTypes(true);
      const types = await getAllProductTypes();
      setAvailableProductTypes(types);
      if (types.length > 0) {
        setSelectedProductTypeId(types[0].id);
      }
    } catch (error) {
      console.error("Error fetching product types:", error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom dohvaćanja tipova proizvoda.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingProductTypes(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const handleUpdateStatus = async (status: EventStatus) => {
    if (!eventId) return;
    setIsUpdating(true);
    try {
      await updateEventStatus(eventId, status);
      await fetchEvent();
      toast({
        title: "Uspješno",
        description: `Status događaja je promijenjen na "${getStatusLabel(status)}".`,
      });
    } catch (error) {
      console.error("Error updating event status:", error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom ažuriranja statusa događaja.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleAddProductForm = () => {
    if (!showAddProductForm && availableProductTypes.length === 0) {
      fetchAvailableProductTypes();
    }
    setShowAddProductForm(!showAddProductForm);
  };

  const handleRetailerChange = (index: number, value: RetailerCode) => {
    const updatedSamples = [...samples];
    updatedSamples[index].retailerCode = value;
    setSamples(updatedSamples);
  };

  const handleBrandChange = (index: number, value: string) => {
    const updatedSamples = [...samples];
    updatedSamples[index].brand = value;
    setSamples(updatedSamples);
  };

  const handleAddSample = () => {
    setSamples([...samples, { brand: "", retailerCode: RetailerCode.LI }]);
  };

  const handleRemoveSample = (index: number) => {
    if (samples.length > 1) {
      const updatedSamples = samples.filter((_, i) => i !== index);
      setSamples(updatedSamples);
    }
  };

  const handleSampleCountChange = (count: number) => {
    setSampleCount(count);
    const currentCount = samples.length;
    if (count > currentCount) {
      const newSamples = [...samples];
      for (let i = currentCount; i < count; i++) {
        newSamples.push({ brand: "", retailerCode: RetailerCode.LI });
      }
      setSamples(newSamples);
    } else if (count < currentCount) {
      setSamples(samples.slice(0, count));
    }
  };

  const validateProductTypeForm = () => {
    if (!selectedProductTypeId) {
      toast({
        title: "Greška",
        description: "Morate odabrati tip proizvoda.",
        variant: "destructive",
      });
      return false;
    }

    if (!baseCode || baseCode.trim() === "") {
      toast({
        title: "Greška",
        description: "Šifra uzorka ne može biti prazna.",
        variant: "destructive",
      });
      return false;
    }

    if (!customerCode || customerCode.length !== 4 || !/^\d{4}$/.test(customerCode)) {
      toast({
        title: "Greška",
        description: "Šifra kupca mora biti četveroznamenkasti broj.",
        variant: "destructive",
      });
      return false;
    }

    const validSamples = samples.every(sample => sample.brand.trim() !== "");
    if (!validSamples) {
      toast({
        title: "Greška",
        description: "Svi uzorci moraju imati definiran naziv brenda.",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  const handleAddProductType = async () => {
    if (!eventId || !validateProductTypeForm()) return;

    try {
      console.log('=== EventDetail handleAddProductType POČETAK ===');
      setIsUpdating(true);
      const displayOrder = event?.productTypes.length || 0;
      
      const newProductType = await createProductType(
        eventId,
        customerCode,
        selectedProductTypeId,
        baseCode,
        displayOrder + 1
      );

      console.log('EventDetail - product type kreiran, dodajem uzorke...');
      for (const sample of samples) {
        await createSample(
          newProductType.id,
          sample.brand,
          sample.retailerCode
        );
      }

      toast({
        title: "Uspješno",
        description: "Tip proizvoda je uspješno dodan događaju.",
      });

      // Reset form
      setShowAddProductForm(false);
      setBaseCode("");
      setCustomerCode("");
      setSampleCount(3);
      setSamples([{ brand: "", retailerCode: RetailerCode.LI }]);
      
      console.log('EventDetail - pozivam fetchEvent za osvježavanje UI...');
      // Eksplicitno osvježi podatke
      await fetchEvent();
      console.log('=== EventDetail handleAddProductType ZAVRŠETAK ===');
      
    } catch (error) {
      console.error("EventDetail - Error adding product type:", error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom dodavanja tipa proizvoda.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditProductType = async (productTypeId: string, customerCode: string, baseCode: string) => {
    try {
      console.log('=== EventDetail handleEditProductType ===');
      console.log('Product Type ID:', productTypeId);
      console.log('Customer Code:', customerCode);
      console.log('Base Code:', baseCode);
      
      setIsUpdating(true);
      
      const success = await updateEventProductType(productTypeId, customerCode, baseCode);
      
      if (success) {
        toast({
          title: "Uspješno",
          description: "Tip proizvoda je uspješno ažuriran.",
        });
        
        // Osvježi podatke
        await fetchEvent();
      } else {
        toast({
          title: "Greška",
          description: "Došlo je do pogreške prilikom ažuriranja tipa proizvoda.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("EventDetail - Error editing product type:", error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom ažuriranja tipa proizvoda.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteProductType = async (productTypeId: string) => {
    try {
      console.log('=== EventDetail handleDeleteProductType ===');
      console.log('Product Type ID:', productTypeId);
      
      setIsUpdating(true);
      
      const success = await deleteEventProductType(productTypeId);
      
      if (success) {
        toast({
          title: "Uspješno",
          description: "Tip proizvoda je uspješno obrisan.",
        });
        
        // Osvježi podatke
        await fetchEvent();
      } else {
        toast({
          title: "Greška",
          description: "Došlo je do pogreške prilikom brisanja tipa proizvoda.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("EventDetail - Error deleting product type:", error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom brisanja tipa proizvoda.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGenerateRandomization = async (productTypeId: string) => {
    if (!productTypeId) return;
    
    try {
      console.log('=== EventDetail handleGenerateRandomization ===');
      console.log('Product Type ID:', productTypeId);
      
      const randomization = await createRandomization(productTypeId);
      if (randomization) {
        setRandomizationTable(randomization.table);
        const productType = event?.productTypes.find(pt => pt.id === productTypeId) || null;
        setSelectedProductType(productType);
        setRandomizationView(true);
        
        // Osvježi event podatke da se ažurira hasRandomization flag
        await fetchEvent();
        
        toast({
          title: "Uspješno",
          description: "Randomizacija je uspješno generirana.",
        });
      } else {
        toast({
          title: "Greška",
          description: "Nije moguće generirati randomizaciju. Provjerite jesu li dodani uzorci.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error generating randomization:", error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom generiranja randomizacije.",
        variant: "destructive",
      });
    }
  };

  const handleViewRandomization = async (productType: ProductType) => {
    setSelectedProductType(productType);
    
    try {
      console.log('=== EventDetail handleViewRandomization ===');
      console.log('Product Type ID:', productType.id);
      
      const randomization = await getRandomization(productType.id);
      if (randomization) {
        setRandomizationTable(randomization.table);
        setRandomizationView(true);
      } else {
        toast({
          title: "Nema randomizacije",
          description: "Za ovaj tip proizvoda još nije generirana randomizacija.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error viewing randomization:", error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom dohvaćanja randomizacije.",
        variant: "destructive",
      });
    }
  };

  const navigateToNextProductType = () => {
    if (!event || !selectedProductType) return;
    
    const currentIndex = event.productTypes.findIndex(pt => pt.id === selectedProductType.id);
    if (currentIndex < event.productTypes.length - 1) {
      handleViewRandomization(event.productTypes[currentIndex + 1]);
    }
  };

  const navigateToPrevProductType = () => {
    if (!event || !selectedProductType) return;
    
    const currentIndex = event.productTypes.findIndex(pt => pt.id === selectedProductType.id);
    if (currentIndex > 0) {
      handleViewRandomization(event.productTypes[currentIndex - 1]);
    }
  };

  const handlePrintRandomizationTable = () => {
    window.print();
  };

  const handleExportRandomizationTable = () => {
    if (!randomizationTable || !selectedProductType) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `${selectedProductType.productName} - ${selectedProductType.baseCode}\n\n`;
    
    // Header row with round numbers
    csvContent += "Mjesto / Dijeljenje,";
    for (let round = 1; round <= selectedProductType.samples.length; round++) {
      csvContent += `Dijeljenje ${round},`;
    }
    csvContent += "\n";
    
    // Data rows for each position
    for (let position = 1; position <= 12; position++) {
      csvContent += `Mjesto ${position},`;
      for (let round = 1; round <= selectedProductType.samples.length; round++) {
        csvContent += `${randomizationTable[position]?.[round] || ""},`;
      }
      csvContent += "\n";
    }
    
    csvContent += "\nLegenda:\n";
    selectedProductType.samples.forEach((sample) => {
      csvContent += `${sample.blindCode}: ${sample.brand} (${sample.retailerCode})\n`;
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `randomizacija_${selectedProductType.baseCode}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteEvent = async () => {
    if (!eventId) return;
    
    try {
      console.log('=== EventDetail handleDeleteEvent ===');
      console.log('Event ID:', eventId);
      
      setIsUpdating(true);
      
      const success = await deleteEvent(eventId);
      
      if (success) {
        toast({
          title: "Uspješno",
          description: "Događaj je uspješno obrisan.",
        });
        
        // Navigate back to events page
        navigate("/admin");
      } else {
        toast({
          title: "Greška",
          description: "Došlo je do pogreške prilikom brisanja događaja.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("EventDetail - Error deleting event:", error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom brisanja događaja.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="text-center p-8">Učitavanje...</div>
      </AdminLayout>
    );
  }

  if (!event) {
    return (
      <AdminLayout>
        <div className="text-center p-8">
          <h2 className="text-xl font-bold mb-2">Događaj nije pronađen</h2>
          <p className="text-muted-foreground mb-4">Traženi događaj ne postoji ili je uklonjen.</p>
          <Button onClick={() => navigate("/admin")}>Povratak na početnu</Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Događaj: {formatDate(event.date)}</h1>
        </div>

        <EventInfoCard 
          event={event}
          isUpdating={isUpdating}
          onUpdateStatus={handleUpdateStatus}
          onDeleteEvent={handleDeleteEvent}
          formatDate={formatDate}
          getStatusLabel={getStatusLabel}
        />

        <Tabs defaultValue="products">
          <TabsList className="mb-4">
            <TabsTrigger value="products">Tipovi proizvoda</TabsTrigger>
            <TabsTrigger value="randomization">Randomizacija</TabsTrigger>
            <TabsTrigger value="reports">Izvještaji</TabsTrigger>
            <TabsTrigger value="rawdata">Sirovi podaci</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products">
            <ProductTypesTab 
              productTypes={event.productTypes}
              showAddProductForm={showAddProductForm}
              isLoadingProductTypes={isLoadingProductTypes}
              availableProductTypes={availableProductTypes}
              selectedProductTypeId={selectedProductTypeId}
              baseCode={baseCode}
              customerCode={customerCode}
              sampleCount={sampleCount}
              samples={samples}
              isUpdating={isUpdating}
              onViewRandomization={handleViewRandomization}
              onGenerateRandomization={handleGenerateRandomization}
              onToggleAddProductForm={handleToggleAddProductForm}
              onSelectedProductTypeIdChange={setSelectedProductTypeId}
              onBaseCodeChange={setBaseCode}
              onCustomerCodeChange={setCustomerCode}
              onSampleCountChange={handleSampleCountChange}
              onBrandChange={handleBrandChange}
              onRetailerChange={handleRetailerChange}
              onAddSample={handleAddSample}
              onRemoveSample={handleRemoveSample}
              onAddProductType={handleAddProductType}
              onEditProductType={handleEditProductType}
              onDeleteProductType={handleDeleteProductType}
            />
          </TabsContent>
          
          <TabsContent value="randomization">
            <RandomizationTab 
              productTypes={event.productTypes}
              randomizationView={randomizationView}
              selectedProductType={selectedProductType}
              randomizationTable={randomizationTable}
              onViewRandomization={handleViewRandomization}
              onGenerateRandomization={handleGenerateRandomization}
              onPrintRandomizationTable={handlePrintRandomizationTable}
              onExportRandomizationTable={handleExportRandomizationTable}
              onBackFromRandomization={() => setRandomizationView(false)}
              onNavigateToNextProductType={navigateToNextProductType}
              onNavigateToPrevProductType={navigateToPrevProductType}
            />
          </TabsContent>
          
          <TabsContent value="reports">
            <ReportsTab eventId={eventId || ''} />
          </TabsContent>

          <TabsContent value="rawdata">
            <RawDataTab eventId={eventId || ''} />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
