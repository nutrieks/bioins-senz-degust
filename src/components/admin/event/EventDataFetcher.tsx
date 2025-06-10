
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getEvent, getProductTypes } from "@/services/dataService";
import { EvaluationProvider } from "@/contexts/EvaluationContext";
import { JARAttribute, ProductType } from "@/types";
import { EvaluationContent } from "@/components/evaluation/EvaluationContent";
import { LoadingState } from "@/components/evaluation/LoadingState";

interface EventDataFetcherProps {
  jarAttributes: JARAttribute[];
  onProductTypesChange?: (productTypes: ProductType[]) => void;
}

export function EventDataFetcher({ jarAttributes, onProductTypesChange }: EventDataFetcherProps) {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);

  const fetchProductTypes = async () => {
    if (!eventId) return;
    
    console.log('=== ADMIN EventDataFetcher - dohvaćam tipove proizvoda iz Supabase ===');
    console.log('Event ID:', eventId);
    try {
      const types = await getProductTypes(eventId);
      console.log('ADMIN EventDataFetcher - dohvaćeni tipovi iz Supabase:', types.length, types);
      setProductTypes(types);
      onProductTypesChange?.(types);
    } catch (error) {
      console.error("ADMIN EventDataFetcher - error fetching product types from Supabase:", error);
    }
    console.log('=== ADMIN EventDataFetcher - završeno dohvaćanje iz Supabase ===');
  };

  useEffect(() => {
    if (!eventId) {
      navigate("/admin");
      return;
    }

    const fetchEventData = async () => {
      console.log('=== ADMIN EventDataFetcher - početak dohvaćanja event podataka iz Supabase ===');
      try {
        const event = await getEvent(eventId);
        if (!event) {
          navigate("/admin");
          return;
        }

        const date = new Date(event.date);
        setEventDate(date.toLocaleDateString('hr-HR'));
        setEventName(event.date);
        console.log('ADMIN EventDataFetcher - event učitan iz Supabase:', event.id, event.date);

        await fetchProductTypes();
      } catch (error) {
        console.error("ADMIN EventDataFetcher - error fetching event data from Supabase:", error);
      } finally {
        setIsLoading(false);
        console.log('=== ADMIN EventDataFetcher - završeno učitavanje iz Supabase ===');
      }
    };

    fetchEventData();
  }, [eventId, navigate]);

  // Izloži funkciju za refresh tipova proizvoda
  useEffect(() => {
    if (window) {
      (window as any).refreshProductTypes = fetchProductTypes;
    }
  }, [eventId]);

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="container">
      <EvaluationProvider jarAttributes={jarAttributes}>
        <EvaluationContent 
          eventId={eventId || ""} 
          eventName={eventName}
          eventDate={eventDate}
          productTypes={productTypes}
        />
      </EvaluationProvider>
    </div>
  );
}
