
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EvaluationForm } from "@/components/evaluation/EvaluationForm";
import { CompletionMessage } from "@/components/evaluation/CompletionMessage";
import { SampleRevealScreen } from "@/components/evaluation/SampleRevealScreen";
import { LoadingState } from "@/components/evaluation/LoadingState";
import { useEvaluationFlow } from "@/hooks/useEvaluationFlow";

interface EvaluationContentProps { 
  eventId: string; 
}

export function EvaluationContent({ eventId }: EvaluationContentProps) {
  const navigate = useNavigate();
  const {
    isLoading,
    isEvaluationCompleteForUser,
    showSampleReveal,
    currentProductType,
    isTransitioning,
    currentSample,
    initializeEvaluation,
    continueAfterReveal,
    canEnterEvaluation,
  } = useEvaluationFlow(eventId);

  useEffect(() => {
    initializeEvaluation();
  }, [eventId, initializeEvaluation]);

  // Route guard - redirect if user can't enter evaluation
  useEffect(() => {
    if (!isLoading && !canEnterEvaluation()) {
      navigate("/evaluator");
    }
  }, [isLoading, canEnterEvaluation, navigate]);

  if (isLoading || isTransitioning) {
    return <LoadingState />;
  }

  if (isEvaluationCompleteForUser) {
    return <CompletionMessage onReturn={() => navigate("/evaluator")} />;
  }

  if (showSampleReveal && currentProductType) {
    return (
      <SampleRevealScreen
        eventId={eventId}
        productTypeId={currentProductType.id}
        productName={currentProductType.productName}
        onContinue={continueAfterReveal}
      />
    );
  }

  // Always show loading if no current sample and not finished
  if (!currentSample) {
    return <LoadingState />;
  }

  return <EvaluationForm eventId={eventId} />;
}
