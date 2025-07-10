import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useEvaluationFlow } from "@/hooks/useEvaluationFlow";
import { EvaluationForm } from "@/components/evaluation/EvaluationForm";

interface EvaluationFormWrapperProps {
  eventId: string;
}

/**
 * Wrapper that connects EvaluationForm to the new flow management
 */
export function EvaluationFormWrapper({ eventId }: EvaluationFormWrapperProps) {
  const navigate = useNavigate();
  const { submitEvaluation, isEvaluationCompleteForUser } = useEvaluationFlow(eventId);

  const handleComplete = useCallback(() => {
    // Check if all evaluations are now complete
    if (isEvaluationCompleteForUser) {
      navigate("/evaluator");
    }
  }, [isEvaluationCompleteForUser, navigate]);

  return (
    <EvaluationForm 
      eventId={eventId} 
      onComplete={handleComplete}
    />
  );
}