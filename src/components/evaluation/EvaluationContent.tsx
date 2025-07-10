
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EvaluationForm } from "@/components/evaluation/EvaluationForm";
import { CompletionMessage } from "@/components/evaluation/CompletionMessage";
import { SampleRevealScreen } from "@/components/evaluation/SampleRevealScreen";
import { LoadingState } from "@/components/evaluation/LoadingState";
import { useEvaluationManager } from "@/hooks/useEvaluationManager";

interface EvaluationContentProps { 
  eventId: string; 
}

export function EvaluationContent({ eventId }: EvaluationContentProps) {
  const navigate = useNavigate();
  const {
    isLoading,
    isEvaluationFinished,
    showSampleReveal,
    currentProductType,
    isTransitioning,
    currentSample,
    startEvaluation,
    loadNextTask,
  } = useEvaluationManager(eventId);

  useEffect(() => {
    startEvaluation(eventId);
  }, [eventId, startEvaluation]);

  if (isLoading || isTransitioning) {
    return <LoadingState />;
  }

  if (isEvaluationFinished) {
    return <CompletionMessage onReturn={() => navigate("/evaluator")} />;
  }

  if (showSampleReveal && currentProductType) {
    return (
      <SampleRevealScreen
        eventId={eventId}
        productTypeId={currentProductType.id}
        productName={currentProductType.productName}
        onContinue={loadNextTask}
      />
    );
  }

  // If no current sample but not finished or transitioning, show loading
  if (!currentSample && !isEvaluationFinished && !isTransitioning) {
    return <LoadingState />;
  }

  return <EvaluationForm eventId={eventId} onComplete={() => navigate("/evaluator")} />;
}
