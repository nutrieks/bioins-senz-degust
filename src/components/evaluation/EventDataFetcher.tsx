
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
      try {
        const event = await getEvent(eventId);
        if (!event) {
          navigate("/evaluator");
          return;
        }

        // Set event date
        const date = new Date(event.date);
        setEventDate(date.toLocaleDateString('hr-HR'));
        setEventName(event.date); // Store the full date string for display

        // Dohvati sve tipove proizvoda za događaj
        const types = await getProductTypes(eventId);
        setProductTypes(types);
        console.log("Fetched product types for event:", types.length, types);
      } catch (error) {
        console.error("Error fetching event data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [eventId, navigate]);

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
