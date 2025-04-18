
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileDown, Printer } from "lucide-react";
import { generateHedonicReport, generateJARReport, getProductTypes } from "@/services/dataService";
import { HedonicReport, JARReport, ProductType } from "@/types";
import { HedonicReportView } from "@/components/reports/HedonicReportView";
import { JARReportView } from "@/components/reports/JARReportView";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface ReportsTabProps {
  eventId: string;
}

export function ReportsTab({ eventId }: ReportsTabProps) {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [selectedProductType, setSelectedProductType] = useState<string | null>(null);
  const [hedonicReport, setHedonicReport] = useState<HedonicReport | null>(null);
  const [jarReport, setJARReport] = useState<JARReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Fetch product types when component mounts
  useEffect(() => {
    const fetchProductTypes = async () => {
      try {
        const types = await getProductTypes(eventId);
        setProductTypes(types);
        if (types.length > 0) {
          setSelectedProductType(types[0].id);
        }
      } catch (error) {
        console.error("Error fetching product types:", error);
        toast({
          title: "Greška",
          description: "Došlo je do pogreške prilikom dohvaćanja tipova proizvoda.",
          variant: "destructive",
        });
      }
    };

    fetchProductTypes();
  }, [eventId, toast]);

  // Generate reports when product type is selected
  useEffect(() => {
    const generateReports = async () => {
      if (!selectedProductType) return;
      
      setIsLoading(true);
      try {
        const [hedonicData, jarData] = await Promise.all([
          generateHedonicReport(eventId, selectedProductType),
          generateJARReport(eventId, selectedProductType)
        ]);
        
        setHedonicReport(hedonicData);
        setJARReport(jarData);
      } catch (error) {
        console.error("Error generating reports:", error);
        toast({
          title: "Greška",
          description: "Došlo je do pogreške prilikom generiranja izvještaja.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    generateReports();
  }, [selectedProductType, eventId, toast]);

  const handleProductTypeChange = (value: string) => {
    setSelectedProductType(value);
  };

  const handlePrintReport = () => {
    window.print();
  };

  const handleExportReport = () => {
    toast({
      title: "Obavijest",
      description: "Izvoz izvještaja će biti dostupan u budućoj verziji.",
    });
  };

  const productType = productTypes.find(pt => pt.id === selectedProductType);

  return (
    <Card className="print:shadow-none print:border-none">
      <CardHeader className="print:hidden">
        <CardTitle>Izvještaji</CardTitle>
        <CardDescription>
          Pregled i preuzimanje izvještaja o događaju.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 print:hidden">
            <div className="w-full sm:w-64">
              <Select
                value={selectedProductType || ""}
                onValueChange={handleProductTypeChange}
                disabled={productTypes.length === 0}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Odaberite tip proizvoda" />
                </SelectTrigger>
                <SelectContent>
                  {productTypes.map((type) => (
                    <SelectItem key={type.id} value={type.id}>
                      {type.productName} ({type.baseCode})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrintReport}
                className="flex items-center"
                disabled={!hedonicReport || !jarReport}
              >
                <Printer className="mr-2 h-4 w-4" />
                Ispiši
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportReport}
                className="flex items-center"
                disabled={!hedonicReport || !jarReport}
              >
                <FileDown className="mr-2 h-4 w-4" />
                Preuzmi PDF
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center p-4">Učitavanje izvještaja...</div>
          ) : !selectedProductType ? (
            <div className="text-center p-6 border rounded-lg">
              <p className="text-muted-foreground">
                Odaberite tip proizvoda za prikaz izvještaja.
              </p>
            </div>
          ) : (
            <>
              <div className="print:block hidden text-center mb-10">
                <div className="mb-4">
                  <img src="/logo-placeholder.svg" alt="Logo" className="h-12 mx-auto" />
                </div>
                <div className="border-t pt-4">
                  <h1 className="text-2xl font-bold">Potrošačka degustacija</h1>
                  <h2 className="text-xl mt-1 mb-3">
                    {productType?.createdAt ? new Date(productType.createdAt).toLocaleDateString('hr-HR') : ""}
                  </h2>
                  <h3 className="text-lg">
                    {productType?.customerCode} - {productType?.productName}
                  </h3>
                </div>
              </div>

              <Tabs defaultValue="hedonic" className="print:hidden">
                <TabsList className="mb-4">
                  <TabsTrigger value="hedonic">Hedonika</TabsTrigger>
                  <TabsTrigger value="jar">JAR</TabsTrigger>
                </TabsList>
                
                <TabsContent value="hedonic">
                  {hedonicReport && productType ? (
                    <HedonicReportView 
                      report={hedonicReport} 
                      productName={productType.productName}
                    />
                  ) : (
                    <div className="text-center p-6 border rounded-lg">
                      <p className="text-muted-foreground">
                        Nema dostupnih hedoničkih podataka za odabrani tip proizvoda.
                      </p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="jar">
                  {jarReport && productType ? (
                    <JARReportView 
                      report={jarReport} 
                      productName={productType.productName}
                    />
                  ) : (
                    <div className="text-center p-6 border rounded-lg">
                      <p className="text-muted-foreground">
                        Nema dostupnih JAR podataka za odabrani tip proizvoda.
                      </p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              <div className="print:block hidden space-y-10">
                {hedonicReport && productType && (
                  <HedonicReportView 
                    report={hedonicReport} 
                    productName={productType.productName}
                  />
                )}
                
                {jarReport && productType && (
                  <JARReportView 
                    report={jarReport} 
                    productName={productType.productName}
                  />
                )}
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
