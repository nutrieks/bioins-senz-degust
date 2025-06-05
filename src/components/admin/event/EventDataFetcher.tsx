
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getEvent, getProductTypes } from "@/services/dataService";
import { EvaluationProvider } from "@/contexts/EvaluationContext";
import { JARAttribute, ProductType } from "@/types";
import { EvaluationContent } from "./EvaluationContent";
import { LoadingState } from "./LoadingState";

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
    
    console.log('EventDataFetcher - osvježavam tipove proizvoda za event:', eventId);
    try {
      const types = await getProductTypes(eventId);
      console.log('EventDataFetcher - dohvaćeni tipovi:', types.length, types);
      setProductTypes(types);
      onProductTypesChange?.(types);
    } catch (error) {
      console.error("EventDataFetcher - error fetching product types:", error);
    }
  };

  useEffect(() => {
    if (!eventId) {
      navigate("/evaluator");
      return;
    }

    const fetchEventData = async () => {
      try {
        const event = await getEvent(eventId);
        if (!event) {
          navigate("/evaluator");
          return;
        }

        const date = new Date(event.date);
        setEventDate(date.toLocaleDateString('hr-HR'));
        setEventName(event.date);

        await fetchProductTypes();
      } catch (error) {
        console.error("Error fetching event data:", error);
      } finally {
        setIsLoading(false);
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
