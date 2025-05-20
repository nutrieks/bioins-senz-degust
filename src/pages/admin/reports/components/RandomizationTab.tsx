
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Event, ProductType, Randomization } from "@/types";
import { EventSelector } from "./EventSelector";
import { ProductTypeSelector } from "./ProductTypeSelector";
import { RandomizationTableView } from "./RandomizationTableView";
import { getRandomization } from "@/services/dataService";
import { useToast } from "@/hooks/use-toast";

interface RandomizationTabProps {
  events: Event[];
  isLoading: boolean;
}

export function RandomizationTab({ events, isLoading }: RandomizationTabProps) {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [selectedProductType, setSelectedProductType] = useState<ProductType | null>(null);
  const [randomization, setRandomization] = useState<Randomization | null>(null);
  const [isLoadingRandomization, setIsLoadingRandomization] = useState(false);
  const { toast } = useToast();

  // When event is selected, reset product type selection
  useEffect(() => {
    setSelectedProductType(null);
    setRandomization(null);
  }, [selectedEvent]);

  // When product type is selected, fetch randomization
  useEffect(() => {
    const fetchRandomization = async (productTypeId: string) => {
      try {
        setIsLoadingRandomization(true);
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
        setIsLoadingRandomization(false);
      }
    };

    if (selectedProductType) {
      fetchRandomization(selectedProductType.id);
    }
  }, [selectedProductType, toast]);

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
  };

  const handleProductTypeSelect = (productType: ProductType) => {
    setSelectedProductType(productType);
  };

  // Set initial selected event if available
  useEffect(() => {
    if (events.length > 0 && !selectedEvent) {
      setSelectedEvent(events[0]);
    }
  }, [events, selectedEvent]);

  return (
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
              <EventSelector 
                events={events}
                selectedEvent={selectedEvent}
                onEventSelect={handleEventSelect}
                isLoading={isLoading}
              />
              
              <ProductTypeSelector
                selectedEvent={selectedEvent}
                selectedProductType={selectedProductType}
                onProductTypeSelect={handleProductTypeSelect}
              />
            </div>
            
            {selectedProductType && randomization && (
              <RandomizationTableView
                randomization={randomization}
                selectedProductType={selectedProductType}
              />
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
