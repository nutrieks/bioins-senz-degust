
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  getEvent, 
  updateEventStatus, 
  getAllProductTypes, 
  createProductType, 
  createRandomization,
  createSample,
  getRandomization
} from "@/services/dataService";
import { Event, EventStatus, BaseProductType, ProductType, RetailerCode } from "@/types";
import { 
  ArrowLeft, 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  FileDown, 
  Printer,
  Shuffle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

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

  const retailerOptions = [
    { value: RetailerCode.LI, label: "Lidl (LI)" },
    { value: RetailerCode.KL, label: "Kaufland (KL)" },
    { value: RetailerCode.KO, label: "Konzum (KO)" },
    { value: RetailerCode.IS, label: "Interspar (IS)" },
    { value: RetailerCode.PL, label: "Plodine (PL)" },
    { value: RetailerCode.ES, label: "Eurospin (ES)" },
    { value: RetailerCode.M, label: "Marka \"M\"" },
  ];

  const fetchEvent = async () => {
    if (!eventId) return;
    try {
      setIsLoading(true);
      const eventData = await getEvent(eventId);
      setEvent(eventData);
    } catch (error) {
      console.error("Error fetching event:", error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom dohvaćanja podataka o događaju.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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

  const getStatusLabel = (status: EventStatus) => {
    switch (status) {
      case EventStatus.PREPARATION:
        return "Priprema";
      case EventStatus.ACTIVE:
        return "Aktivan";
      case EventStatus.COMPLETED:
        return "Završen";
      case EventStatus.ARCHIVED:
        return "Arhiviran";
      default:
        return "Nepoznat";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("hr-HR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
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
      setIsUpdating(true);
      // Create the product type
      const displayOrder = event?.productTypes.length || 0;
      
      const newProductType = await createProductType(
        eventId,
        customerCode,
        selectedProductTypeId,
        baseCode,
        displayOrder + 1
      );

      // Add samples to the product type - FIXED: now properly adding samples
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
      
      // Refresh event data
      fetchEvent();
    } catch (error) {
      console.error("Error adding product type:", error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom dodavanja tipa proizvoda.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleGenerateRandomization = async (productTypeId: string) => {
    if (!productTypeId) return;
    
    try {
      const randomization = await createRandomization(productTypeId);
      if (randomization) {
        setRandomizationTable(randomization.table);
        // Also update the selected product type to show the randomization properly
        const productType = event?.productTypes.find(pt => pt.id === productTypeId) || null;
        setSelectedProductType(productType);
        setRandomizationView(true);
        
        // Refresh event data to update randomization status
        fetchEvent();
        
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
      // Get the randomization data for this product type
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
    
    // Create CSV content
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += `${selectedProductType.productName} - ${selectedProductType.baseCode}\n\n`;
    csvContent += "Mjesto,";
    
    // Headers for rounds
    const roundCount = Math.max(...Object.keys(randomizationTable).map(pos => 
      Object.keys(randomizationTable[pos] || {}).length
    ));
    
    for (let i = 1; i <= roundCount; i++) {
      csvContent += `Dijeljenje ${i},`;
    }
    csvContent += "\n";
    
    // Data rows
    for (let position = 1; position <= 12; position++) {
      csvContent += `${position},`;
      for (let round = 1; round <= roundCount; round++) {
        csvContent += `${randomizationTable[position]?.[round] || ""},`;
      }
      csvContent += "\n";
    }
    
    // Create download link
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `randomizacija_${selectedProductType.baseCode}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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

        <Card>
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Informacije o događaju</CardTitle>
                <CardDescription>Osnovna svojstva događaja i upravljanje statusom</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium">Status:</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  event.status === EventStatus.ACTIVE 
                    ? "bg-green-100 text-green-800" 
                    : event.status === EventStatus.PREPARATION 
                    ? "bg-blue-100 text-blue-800"
                    : event.status === EventStatus.COMPLETED
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-gray-100 text-gray-800"
                }`}>
                  {getStatusLabel(event.status)}
                </span>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Datum događaja</p>
                  <p className="flex items-center mt-1">
                    <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                    {formatDate(event.date)}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Randomizacija</p>
                  <p className="flex items-center mt-1">
                    {event.randomizationComplete ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                        Dovršena
                      </>
                    ) : (
                      <>
                        <XCircle className="mr-2 h-4 w-4 text-red-500" />
                        Nije dovršena
                      </>
                    )}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2 mt-6">
                {event.status === EventStatus.PREPARATION && (
                  <Button 
                    onClick={() => handleUpdateStatus(EventStatus.ACTIVE)}
                    disabled={isUpdating || !event.randomizationComplete}
                  >
                    Aktiviraj događaj
                  </Button>
                )}
                
                {event.status === EventStatus.ACTIVE && (
                  <Button 
                    onClick={() => handleUpdateStatus(EventStatus.COMPLETED)}
                    disabled={isUpdating}
                  >
                    Završi događaj
                  </Button>
                )}
                
                {(event.status === EventStatus.COMPLETED || event.status === EventStatus.ACTIVE) && (
                  <Button 
                    variant="outline"
                    onClick={() => handleUpdateStatus(EventStatus.ARCHIVED)}
                    disabled={isUpdating}
                  >
                    Arhiviraj
                  </Button>
                )}
                
                {event.status === EventStatus.ARCHIVED && (
                  <Button 
                    variant="outline"
                    onClick={() => handleUpdateStatus(EventStatus.COMPLETED)}
                    disabled={isUpdating}
                  >
                    Vrati iz arhive
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="products">
          <TabsList className="mb-4">
            <TabsTrigger value="products">Tipovi proizvoda</TabsTrigger>
            <TabsTrigger value="randomization">Randomizacija</TabsTrigger>
            <TabsTrigger value="reports">Izvještaji</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Tipovi proizvoda</CardTitle>
                <CardDescription>
                  Upravljanje tipovima proizvoda i uzorcima za ovaj događaj.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {event.productTypes.length === 0 ? (
                  <div className="text-center p-6 border rounded-lg">
                    <p className="text-muted-foreground mb-4">Nema dodanih tipova proizvoda.</p>
                    
                    {/* Inline form toggle button */}
                    <Button 
                      onClick={handleToggleAddProductForm}
                      className="flex items-center"
                    >
                      {showAddProductForm ? (
                        <>
                          <ChevronUp className="mr-2 h-4 w-4" />
                          Sakrij formu
                        </>
                      ) : (
                        <>
                          <Plus className="mr-2 h-4 w-4" />
                          Dodaj tip proizvoda
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* List of product types would go here */}
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium">Dodani tipovi proizvoda</h3>
                      <Button 
                        onClick={handleToggleAddProductForm}
                        variant="outline"
                        className="flex items-center"
                      >
                        {showAddProductForm ? (
                          <>
                            <ChevronUp className="mr-2 h-4 w-4" />
                            Sakrij formu
                          </>
                        ) : (
                          <>
                            <Plus className="mr-2 h-4 w-4" />
                            Dodaj tip proizvoda
                          </>
                        )}
                      </Button>
                    </div>
                    
                    {/* Display added product types */}
                    <div className="space-y-2">
                      {event.productTypes.map((productType) => (
                        <div 
                          key={productType.id} 
                          className="flex justify-between items-center p-3 border rounded-md"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{productType.productName}</span>
                            <span className="text-sm text-muted-foreground">
                              Šifra: {productType.baseCode} | Uzorci: {productType.samples.length}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewRandomization(productType)}
                              className="flex items-center"
                            >
                              <Shuffle className="mr-1 h-4 w-4" />
                              Randomizacija
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                {showAddProductForm && (
                  <div className="mt-6 border rounded-md p-4 space-y-4 bg-muted/30">
                    <h3 className="text-lg font-semibold">Dodaj novi tip proizvoda</h3>
                    
                    {isLoadingProductTypes ? (
                      <div className="text-center p-4">Učitavanje tipova proizvoda...</div>
                    ) : availableProductTypes.length === 0 ? (
                      <div>
                        <p className="mb-4">Nema dostupnih tipova proizvoda za dodavanje.</p>
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button variant="outline">Kreiraj novi tip proizvoda</Button>
                          </SheetTrigger>
                          <SheetContent side="right" className="sm:max-w-md">
                            <SheetHeader>
                              <SheetTitle>Novi tip proizvoda</SheetTitle>
                              <SheetDescription>
                                Kreirajte novi tip proizvoda koji će biti dostupan za sve događaje.
                              </SheetDescription>
                            </SheetHeader>
                            <div className="mt-6">
                              <p>Ovdje bi bila forma za kreiranje novog tipa proizvoda...</p>
                              <div className="mt-4">
                                <Button onClick={() => navigate("/admin/products/new")} className="w-full">
                                  Otvori punu formu za dodavanje
                                </Button>
                              </div>
                            </div>
                          </SheetContent>
                        </Sheet>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="productType">Odaberite tip proizvoda</Label>
                            <select
                              id="productType"
                              className="w-full px-3 py-2 border rounded-md"
                              value={selectedProductTypeId}
                              onChange={(e) => setSelectedProductTypeId(e.target.value)}
                            >
                              {availableProductTypes.map((type) => (
                                <option key={type.id} value={type.id}>
                                  {type.productName}
                                </option>
                              ))}
                            </select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="customerCode">Šifra kupca (4 znamenke)</Label>
                            <Input
                              id="customerCode"
                              value={customerCode}
                              onChange={(e) => setCustomerCode(e.target.value)}
                              placeholder="npr. 4581"
                              maxLength={4}
                            />
                          </div>
                        
                          <div className="space-y-2">
                            <Label htmlFor="baseCode">Šifra uzorka</Label>
                            <Input
                              id="baseCode"
                              value={baseCode}
                              onChange={(e) => setBaseCode(e.target.value.toUpperCase())}
                              placeholder="npr. A, B, C, AA, AB..."
                              className="uppercase"
                            />
                            <p className="text-xs text-muted-foreground">
                              Možete koristiti slova poput A, B, C ili kombinacije AA, AB, itd.
                            </p>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="sampleCount">Broj uzoraka</Label>
                            <Input
                              id="sampleCount"
                              type="number"
                              min={1}
                              max={10}
                              value={sampleCount}
                              onChange={(e) => handleSampleCountChange(parseInt(e.target.value))}
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <Label>Uzorci</Label>
                          {samples.map((sample, index) => (
                            <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                              <div className="md:col-span-3">
                                <Label htmlFor={`brand-${index}`} className="text-sm">
                                  Naziv brenda/proizvođača
                                </Label>
                                <Input
                                  id={`brand-${index}`}
                                  value={sample.brand}
                                  onChange={(e) => handleBrandChange(index, e.target.value)}
                                  placeholder="npr. Gavrilović"
                                />
                              </div>
                              <div className="md:col-span-1">
                                <Label htmlFor={`retailer-${index}`} className="text-sm">
                                  Trgovina
                                </Label>
                                <select
                                  id={`retailer-${index}`}
                                  className="w-full px-3 py-2 border rounded-md"
                                  value={sample.retailerCode}
                                  onChange={(e) => handleRetailerChange(index, e.target.value as RetailerCode)}
                                >
                                  {retailerOptions.map((option) => (
                                    <option key={option.value} value={option.value}>
                                      {option.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="md:col-span-1">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() => handleRemoveSample(index)}
                                  disabled={samples.length <= 1}
                                >
                                  <XCircle className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                          
                          {samples.length < 10 && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleAddSample}
                              className="mt-2"
                            >
                              <Plus className="mr-2 h-4 w-4" />
                              Dodaj uzorak
                            </Button>
                          )}
                        </div>
                        
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline"
                            onClick={() => setShowAddProductForm(false)}
                          >
                            Odustani
                          </Button>
                          <Button 
                            onClick={handleAddProductType}
                            disabled={isUpdating}
                          >
                            Dodaj
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="randomization">
            <Card>
              <CardHeader>
                <CardTitle>Randomizacija</CardTitle>
                <CardDescription>
                  Generiranje i pregled randomizacije uzoraka.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {event.productTypes.length === 0 ? (
                  <div className="text-center p-6 border rounded-lg">
                    <p className="text-muted-foreground">
                      Nema dodanih tipova proizvoda za koje bi se mogla generirati randomizacija.
                    </p>
                  </div>
                ) : randomizationView && selectedProductType ? (
                  <div className="space-y-4 print:space-y-2">
                    <div className="flex justify-between items-center print:hidden">
                      <div className="flex items-center">
                        <h3 className="text-lg font-medium">
                          Tablica randomizacije: {selectedProductType.productName}
                          <span className="ml-2 text-sm text-muted-foreground">
                            (Šifra: {selectedProductType.baseCode})
                          </span>
                        </h3>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handlePrintRandomizationTable}
                          className="flex items-center"
                        >
                          <Printer className="mr-2 h-4 w-4" />
                          Ispiši
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleExportRandomizationTable}
                          className="flex items-center"
                        >
                          <FileDown className="mr-2 h-4 w-4" />
                          Preuzmi CSV
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setRandomizationView(false)}
                        >
                          Natrag
                        </Button>
                      </div>
                    </div>
                    
                    {event.productTypes.length > 1 && (
                      <div className="flex justify-between items-center p-2 border rounded mb-4 print:hidden">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={navigateToPrevProductType}
                          disabled={event.productTypes.indexOf(selectedProductType) === 0}
                          className="flex items-center"
                        >
                          <ChevronLeft className="mr-1 h-4 w-4" />
                          Prethodni proizvod
                        </Button>
                        
                        <div className="px-4 py-2 bg-muted rounded text-sm">
                          {event.productTypes.indexOf(selectedProductType) + 1} / {event.productTypes.length}
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={navigateToNextProductType}
                          disabled={event.productTypes.indexOf(selectedProductType) === event.productTypes.length - 1}
                          className="flex items-center"
                        >
                          Sljedeći proizvod
                          <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    
                    <div className="print:text-black">
                      <h1 className="text-xl font-bold mb-2 text-center hidden print:block">
                        {selectedProductType.productName} - {selectedProductType.baseCode}
                      </h1>
                      
                      <div className="overflow-x-auto">
                        <Table>
                          <TableCaption>
                            Randomizacija za {selectedProductType.productName}
                          </TableCaption>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-24">Mjesto</TableHead>
                              {selectedProductType.samples.map((_, index) => (
                                <TableHead key={index}>Dijeljenje {index + 1}</TableHead>
                              ))}
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {Array.from({ length: 12 }, (_, i) => i + 1).map((position) => (
                              <TableRow key={position}>
                                <TableCell className="font-medium">{position}</TableCell>
                                {selectedProductType.samples.map((_, round) => (
                                  <TableCell key={round}>
                                    {randomizationTable?.[position]?.[round + 1] || "-"}
                                  </TableCell>
                                ))}
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                      
                      <div className="mt-4 text-sm text-muted-foreground print:text-black">
                        <p>Legenda:</p>
                        <ul className="list-disc pl-5 mt-1">
                          {selectedProductType.samples.map((sample, index) => (
                            <li key={index}>
                              {sample.blindCode}: {sample.brand} ({sample.retailerCode})
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p>Odaberite tip proizvoda za koji želite generirati ili pregledati randomizaciju:</p>
                    <div className="space-y-2">
                      {event.productTypes.map((productType) => (
                        <div 
                          key={productType.id} 
                          className="flex justify-between items-center p-3 border rounded-md"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium">{productType.productName}</span>
                            <span className="text-sm text-muted-foreground">
                              Šifra: {productType.baseCode} | Uzorci: {productType.samples.length}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2">
                            {productType.randomizationGenerated ? (
                              <Button 
                                onClick={() => handleViewRandomization(productType)}
                                className="flex items-center"
                              >
                                <Shuffle className="mr-1 h-4 w-4" />
                                Pregled randomizacije
                              </Button>
                            ) : (
                              <Button 
                                onClick={() => handleGenerateRandomization(productType.id)}
                                disabled={productType.samples.length === 0}
                                className="flex items-center"
                              >
                                <Shuffle className="mr-1 h-4 w-4" />
                                Generiraj randomizaciju
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Izvještaji</CardTitle>
                <CardDescription>
                  Pregled i preuzimanje izvještaja o događaju.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center p-6 border rounded-lg">
                  <p className="text-muted-foreground">
                    Ova funkcionalnost će biti dostupna uskoro.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
