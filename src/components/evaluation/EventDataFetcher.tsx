
import { useParams, useNavigate } from "react-router-dom";
import { EvaluationProvider } from "@/contexts/EvaluationContext";
import { EvaluationContent } from "./EvaluationContent";

interface EventDataFetcherProps {
  jarAttributes?: any[];
}

export function EventDataFetcher({ jarAttributes }: EventDataFetcherProps) {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  if (!eventId) {
    navigate("/evaluator");
    return null;
  }

  return (
    <div className="container">
      <EvaluationProvider>
        <EvaluationContent eventId={eventId} />
      </EvaluationProvider>
    </div>
  );
}
