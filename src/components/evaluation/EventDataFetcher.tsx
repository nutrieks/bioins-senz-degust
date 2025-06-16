
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { getEvent } from "@/services/dataService";
import { getEventWithAllData } from "@/services/optimizedDataService";
import { EvaluationProvider } from "@/contexts/EvaluationContext";
import { JARAttribute, ProductType } from "@/types";
import { EvaluationContent } from "./EvaluationContent";
import { LoadingState } from "./LoadingState";

interface EventDataFetcherProps {
  jarAttributes: JARAttribute[];
}

export function EventDataFetcher({ jarAttributes }: EventDataFetcherProps) {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);

  useEffect(() => {
    if (!eventId) {
      navigate("/evaluator");
      return;
    }

    const fetchEventData = async () => {
      console.log('=== OPTIMIZED EventDataFetcher: Starting fast parallel fetch ===');
      try {
        // Use the optimized service to get all data in parallel
        const eventData = await getEventWithAllData(eventId);
        
        if (!eventData) {
          console.error('No event data found');
          navigate("/evaluator");
          return;
        }

        console.log('=== OPTIMIZED EventDataFetcher: Event data loaded ===');
        console.log('Event:', eventData.event.id, eventData.event.date);
        console.log('Product types:', eventData.productTypes.length);
        console.log('Samples:', eventData.allSamples.length);
        console.log('JAR attributes:', eventData.jarAttributes.length);

        // Set event date
        const date = new Date(eventData.event.date);
        setEventDate(date.toLocaleDateString('hr-HR'));
        setEventName(eventData.event.date);

        // Set product types
        setProductTypes(eventData.productTypes);
        
      } catch (error) {
        console.error("OPTIMIZED EventDataFetcher - error:", error);
        navigate("/evaluator");
      } finally {
        setIsLoading(false);
        console.log('=== OPTIMIZED EventDataFetcher: Loading complete ===');
      }
    };

    fetchEventData();
  }, [eventId, navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-lg font-medium">Pripravljam ocjenjivanje...</p>
        <p className="text-sm text-muted-foreground">Dohvaćam podatke o događaju i uzorcima...</p>
      </div>
    );
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
