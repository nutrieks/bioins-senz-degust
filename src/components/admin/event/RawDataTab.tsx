
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileDown } from "lucide-react";
// Use getRawData as an example service; you must have a matching service method to pull the raw data (add if needed!)
import { getRawData, getProductTypes } from "@/services/dataService";
import { useToast } from "@/hooks/use-toast";
import { ProductType } from "@/types";

interface RawDataTabProps {
  eventId: string;
}

export function RawDataTab({ eventId }: RawDataTabProps) {
  const [rawData, setRawData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    async function fetchProductTypes() {
      try {
        const types = await getProductTypes(eventId);
        setProductTypes(types);
      } catch (error) {
        toast({
          title: "Greška",
          description: "Ne mogu dohvatiti tipove proizvoda za eksport sirovih podataka.",
          variant: "destructive",
        });
      }
    }
    fetchProductTypes();
  }, [eventId]);

  const handleExport = async () => {
    setIsLoading(true);
    try {
      // You must define the `getRawData` service method.
      const data = await getRawData(eventId);
      setRawData(data);

      let csvContent = "data:text/csv;charset=utf-8,";
      if (!Array.isArray(data) || data.length === 0) {
        toast({
          title: "Obavijest",
          description: "Nema dostupnih sirovih podataka za eksport.",
        });
        setIsLoading(false);
        return;
      }
      // Compose header row from keys
      csvContent += Object.keys(data[0]).join(",") + "\n";
      // Add data rows
      data.forEach(entry => {
        csvContent += Object.values(entry).map(val => 
          typeof val === "string" ? `"${val.replaceAll('"', '""')}"` : val
        ).join(",") + "\n";
      });

      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `sirovi_podaci_${eventId}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "Uspjeh",
        description: "CSV eksport je uspješno generiran.",
      });
    } catch (error) {
      toast({
        title: "Greška",
        description: "Eksport sirovih podataka nije uspio.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sirovi podaci</CardTitle>
        <CardDescription>
          Preuzimanje originalnih odgovora ocjenjitelja za sve uzorke ovog događaja. Izvoz podataka u CSV formatu služi kao dokaz o provedenom ispitivanju.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          variant="outline" 
          onClick={handleExport} 
          className="flex items-center"
          disabled={isLoading}
        >
          <FileDown className="mr-2 h-4 w-4" />
          Preuzmi CSV ({isLoading ? 'Generiram...' : 'Export'})
        </Button>
      </CardContent>
    </Card>
  );
}

