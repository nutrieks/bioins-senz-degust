
import { useEffect, useState, useRef } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEvents, getRandomization } from "@/services/dataService";
import { Event, EventStatus, ProductType, Randomization } from "@/types";
import { FileDown, Printer, Calendar } from "lucide-react";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { toPng } from "html-to-image";

export default function ReportsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedProductType, setSelectedProductType] = useState<ProductType | null>(null);
  const [randomization, setRandomization] = useState<Randomization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const tableRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Fetch all events
  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const fetchedEvents = await getEvents();
      // Filter only completed or archived events
      const filteredEvents = fetchedEvents.filter(
        event => event.status === EventStatus.COMPLETED || event.status === EventStatus.ARCHIVED
      );
      setEvents(filteredEvents);
      
      if (filteredEvents.length > 0) {
        setSelectedEvent(filteredEvents[0]);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom dohvaćanja podataka o događajima.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch randomization data when product type is selected
  const fetchRandomization = async (productTypeId: string) => {
    try {
      setIsLoading(true);
      const randomizationData = await getRandomization(productTypeId);
      setRandomization(randomizationData);
    } catch (error) {
      console.error("Error fetching randomization:", error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom dohvaćanja podataka o randomizaciji.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // When event is selected, reset product type selection
  useEffect(() => {
    setSelectedProductType(null);
    setRandomization(null);
  }, [selectedEvent]);

  // When product type is selected, fetch randomization
  useEffect(() => {
    if (selectedProductType) {
      fetchRandomization(selectedProductType.id);
    }
  }, [selectedProductType]);

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleProductTypeSelect = (productType: ProductType) => {
    setSelectedProductType(productType);
  };

  const handlePrintRandomizationTable = () => {
    window.print();
  };

  const handleExportRandomizationTable = async () => {
    if (!randomization || !selectedProductType || !tableRef.current) return;
    
    try {
      const dataUrl = await toPng(tableRef.current, {
        backgroundColor: "#fff",
        pixelRatio: 4,
        cacheBust: true
      });
      
      const link = document.createElement('a');
      link.download = `randomizacija_${selectedProductType.baseCode}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom generiranja slike tablice.",
        variant: "destructive",
      });
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

  // Create an array of position numbers (1-12)
  const positions = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // Determine how many rounds/distributions we have if randomization exists
  const rounds = selectedProductType?.samples.length || 0;
  
  // Create an array of round numbers (1 to rounds)
  const roundNumbers = Array.from({ length: rounds }, (_, i) => i + 1);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Izvještaji</h1>
        
        <Tabs defaultValue="randomization">
          <TabsList className="mb-4">
            <TabsTrigger value="randomization">Randomizacija</TabsTrigger>
            <TabsTrigger value="hedonic">Hedonika</TabsTrigger>
            <TabsTrigger value="jar">JAR</TabsTrigger>
          </TabsList>
          
          <TabsContent value="randomization">
            <Card>
              <CardHeader>
                <CardTitle>Tablice randomizacije</CardTitle>
                <CardDescription>
                  Pregled i izvoz tablica randomizacije za sve događaje.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="text-center p-4">Učitavanje...</div>
                ) : events.length === 0 ? (
                  <div className="text-center p-6 border rounded-lg">
                    <p className="text-muted-foreground">
                      Nema završenih događaja za koje bi se mogli prikazati izvještaji.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="w-full sm:w-64 p-4 border rounded-md">
                        <h3 className="text-lg font-medium mb-3">Događaji</h3>
                        <div className="space-y-2">
                          {events.map((event) => (
                            <button
                              key={event.id}
                              onClick={() => handleEventSelect(event)}
                              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                                selectedEvent?.id === event.id 
                                  ? "bg-primary text-primary-foreground" 
                                  : "hover:bg-muted"
                              }`}
                            >
                              <div className="flex items-center">
                                <Calendar className="mr-2 h-4 w-4" />
                                {formatDate(event.date)}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {selectedEvent && (
                        <div className="flex-1 p-4 border rounded-md">
                          <h3 className="text-lg font-medium mb-3">Tipovi proizvoda</h3>
                          {selectedEvent.productTypes.length === 0 ? (
                            <p className="text-muted-foreground">
                              Ovaj događaj nema tipova proizvoda.
                            </p>
                          ) : (
                            <div className="space-y-2">
                              {selectedEvent.productTypes.map((productType) => (
                                <button
                                  key={productType.id}
                                  onClick={() => handleProductTypeSelect(productType)}
                                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                                    selectedProductType?.id === productType.id 
                                      ? "bg-primary text-primary-foreground" 
                                      : "hover:bg-muted"
                                  }`}
                                >
                                  <div className="flex justify-between items-center">
                                    <span>{productType.productName}</span>
                                    <span className="text-sm">
                                      Šifra: {productType.baseCode}
                                    </span>
                                  </div>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {selectedProductType && randomization && (
                      <div className="space-y-4 print:space-y-2">
                        <div className="flex justify-between items-center print:hidden">
                          <h3 className="text-lg font-medium">
                            Tablica randomizacije: {selectedProductType.productName}
                          </h3>
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
                              Preuzmi sliku
                            </Button>
                          </div>
                        </div>
                        
                        <div 
                          ref={tableRef} 
                          className="bg-white p-5 rounded-lg print:text-black"
                        >
                          <h1 className="text-xl font-bold mb-4 text-center">
                            {selectedProductType.productName} - {selectedProductType.baseCode}
                          </h1>
                          
                          <div className="overflow-x-auto">
                            <Table>
                              <TableCaption>
                                Randomizacija za {selectedProductType.productName}
                              </TableCaption>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-24">Dijeljenje / Mjesto</TableHead>
                                  {/* Column headers are now positions (1-12) */}
                                  {positions.map((position) => (
                                    <TableHead key={position} className="text-center">Mjesto {position}</TableHead>
                                  ))}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {/* Now rows are rounds and columns are positions */}
                                {roundNumbers.map((round) => (
                                  <TableRow key={round}>
                                    <TableCell className="font-medium">Dijeljenje {round}</TableCell>
                                    {positions.map((position) => (
                                      <TableCell key={position} className="text-center">
                                        {randomization.table[position]?.[round] || "-"}
                                      </TableCell>
                                    ))}
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                          
                          <div className="mt-6 text-sm">
                            <p className="font-medium">Legenda:</p>
                            <ul className="list-disc pl-5 mt-2">
                              {selectedProductType.samples.map((sample, index) => (
                                <li key={index} className="mt-1">
                                  {sample.blindCode}: {sample.brand} ({sample.retailerCode})
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="hedonic">
            <Card>
              <CardHeader>
                <CardTitle>Hedonički izvještaji</CardTitle>
                <CardDescription>
                  Pregled hedoničkih izvještaja za sve događaje.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Hedonički izvještaji će biti dostupni u budućoj verziji.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="jar">
            <Card>
              <CardHeader>
                <CardTitle>JAR izvještaji</CardTitle>
                <CardDescription>
                  Pregled JAR (Just About Right) izvještaja za sve događaje.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  JAR izvještaji će biti dostupni u budućoj verziji.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
