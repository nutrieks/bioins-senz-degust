
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EvaluationForm } from "@/components/evaluation/EvaluationForm";
import { CompletionMessage } from "@/components/evaluation/CompletionMessage";
import { SampleRevealScreen } from "@/components/evaluation/SampleRevealScreen";
import { LoadingState } from "@/components/evaluation/LoadingState";
import { useEvaluation } from "@/contexts/EvaluationContext";

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
    samplesForReveal,
    startEvaluation,
    loadNextTask,
  } = useEvaluation();

  useEffect(() => {
    startEvaluation(eventId);
  }, [eventId, startEvaluation]);

  if (isLoading) {
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

  return <EvaluationForm onComplete={() => navigate("/evaluator")} />;
}
