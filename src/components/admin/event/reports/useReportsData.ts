
import { useState, useEffect } from "react";
import { ProductType, HedonicReport, JARReport } from "@/types";
import { generateHedonicReport, generateJARReport, getProductTypes, getEvent } from "@/services/dataService";
import { useToast } from "@/hooks/use-toast";

export function useReportsData(eventId: string) {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [selectedProductType, setSelectedProductType] = useState<string | null>(null);
  const [hedonicReport, setHedonicReport] = useState<HedonicReport | null>(null);
  const [jarReport, setJARReport] = useState<JARReport | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [eventDate, setEventDate] = useState<string>("");
  const { toast } = useToast();

  // Fetch event data
  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const eventData = await getEvent(eventId);
        if (eventData) {
          setEventDate(eventData.date);
        }
      } catch (error) {
        console.error("Error fetching event data:", error);
      }
    };

    fetchEventData();
  }, [eventId]);

  // Fetch product types
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
          generateHedonicReport(selectedProductType),
          generateJARReport(selectedProductType)
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

  return {
    productTypes,
    selectedProductType,
    hedonicReport,
    jarReport,
    isLoading,
    eventDate,
    handleProductTypeChange,
    productType: productTypes.find(pt => pt.id === selectedProductType)
  };
}
