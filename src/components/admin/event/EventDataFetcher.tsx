
import { useParams, useNavigate } from "react-router-dom";
import { EvaluationProvider } from "@/contexts/EvaluationContext";
import { EvaluationContent } from "@/components/evaluation/EvaluationContent";

export function EventDataFetcher() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();

  if (!eventId) {
    navigate("/admin");
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
