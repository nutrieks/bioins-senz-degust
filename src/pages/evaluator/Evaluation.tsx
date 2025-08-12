
import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EvaluatorLayout } from "@/components/layout/EvaluatorLayout";
import { EvaluationContent } from "@/components/evaluation/EvaluationContent";
import { useEvaluationState } from "@/hooks/useEvaluationState";

export default function Evaluation() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { canEnterEvaluation } = useEvaluationState(eventId);

  useEffect(() => {
    if (eventId && !canEnterEvaluation()) {
      navigate("/evaluator", { replace: true });
    }
  }, [eventId, canEnterEvaluation, navigate]);

  if (!eventId) {
    return (
      <EvaluatorLayout>
        <div className="text-center p-6">
          <h2 className="text-xl font-semibold text-red-600 mb-4">
            Greška
          </h2>
          <p className="text-muted-foreground">
            Nedostaje ID događaja.
          </p>
        </div>
      </EvaluatorLayout>
    );
  }

  return (
    <EvaluatorLayout>
      <EvaluationContent eventId={eventId} />
    </EvaluatorLayout>
  );
}
