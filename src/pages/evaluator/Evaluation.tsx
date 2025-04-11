
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { EvaluatorLayout } from "@/components/layout/EvaluatorLayout";
import { EvaluationForm } from "@/components/evaluation/EvaluationForm";
import { CompletionMessage } from "@/components/evaluation/CompletionMessage";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useEvaluation } from "@/contexts/EvaluationContext";
import { getEvent, getJARAttributes } from "@/services/dataService";
import { EvaluationProvider } from "@/contexts/EvaluationContext";
import { JARAttribute } from "@/types";

export default function Evaluation() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [eventName, setEventName] = useState("");
  const [jarAttributes, setJarAttributes] = useState<JARAttribute[]>([]);

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

        // Set event name (date)
        setEventName(new Date(event.date).toLocaleDateString());

        // Fetch JAR attributes for the first product type
        if (event.productTypes.length > 0) {
          const attributes = await getJARAttributes(event.productTypes[0].id);
          setJarAttributes(attributes);
        }
      } catch (error) {
        console.error("Error fetching event data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [eventId, navigate]);

  if (isLoading) {
    return (
      <EvaluatorLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <p>Učitavanje...</p>
        </div>
      </EvaluatorLayout>
    );
  }

  return (
    <EvaluatorLayout>
      <div className="container">
        <EvaluationProvider jarAttributes={jarAttributes}>
          <EvaluationContent 
            eventId={eventId || ""} 
            eventName={eventName} 
          />
        </EvaluationProvider>
      </div>
    </EvaluatorLayout>
  );
}

function EvaluationContent({ eventId, eventName }: { eventId: string; eventName: string }) {
  const navigate = useNavigate();
  const { isComplete, loadNextSample } = useEvaluation();
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const initializeEvaluation = async () => {
      await loadNextSample(eventId);
      setInitialized(true);
    };

    if (!initialized) {
      initializeEvaluation();
    }
  }, [eventId, loadNextSample, initialized]);

  const handleReturn = () => {
    navigate("/evaluator");
  };

  if (!initialized) {
    return (
      <Card className="my-8">
        <CardContent className="p-6 text-center">
          <p>Priprema evaluacije...</p>
        </CardContent>
      </Card>
    );
  }

  if (isComplete) {
    return <CompletionMessage onReturn={handleReturn} />;
  }

  return <EvaluationForm eventId={eventId} onComplete={handleReturn} />;
}
