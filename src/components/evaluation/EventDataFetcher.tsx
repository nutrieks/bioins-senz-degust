
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEventDetailQueries } from "@/hooks/useEventDetailQueries";
import { EvaluationProvider } from "@/contexts/EvaluationContext";
import { JARAttribute } from "@/types";
import { EvaluationContent } from "./EvaluationContent";

interface EventDataFetcherProps {
  jarAttributes: JARAttribute[];
}

export function EventDataFetcher({ jarAttributes }: EventDataFetcherProps) {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  // Use React Query hook for event data
  const { 
    event, 
    productTypes, 
    isLoading, 
    hasError, 
    eventError, 
    productTypesError 
  } = useEventDetailQueries(eventId);

  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");

  useEffect(() => {
    if (!eventId) {
      navigate("/evaluator");
      return;
    }
  }, [eventId, navigate]);

  useEffect(() => {
    if (event) {
      const date = new Date(event.date);
      setEventDate(date.toLocaleDateString('hr-HR'));
      setEventName(event.date);
    }
  }, [event]);

  useEffect(() => {
    if (hasError) {
      console.error("EventDataFetcher - error:", { eventError, productTypesError });
      navigate("/evaluator");
    }
  }, [hasError, eventError, productTypesError, navigate]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-lg font-medium">Pripravljam ocjenjivanje...</p>
        <p className="text-sm text-muted-foreground">Dohvaćam podatke o događaju i uzorcima...</p>
      </div>
    );
  }

  if (!event || hasError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <h2 className="text-xl font-semibold text-red-600">Greška pri učitavanju</h2>
        <p className="text-muted-foreground">Dogodila se greška prilikom dohvaćanja podataka.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <EvaluationProvider jarAttributes={jarAttributes} eventId={eventId}>
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
