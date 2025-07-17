
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
    error,
    dispatch,
  } = useEvaluationFlow(eventId);

  const handleRestart = () => {
    dispatch({ type: 'RESET_STATE' });
    setTimeout(() => {
      initializeEvaluation();
    }, 100);
  };

  useEffect(() => {
    initializeEvaluation();
  }, [eventId, initializeEvaluation]);

  // Route guard - redirect if user can't enter evaluation
  useEffect(() => {
    if (!isLoading && !canEnterEvaluation()) {
      navigate("/evaluator");
    }
  }, [isLoading, canEnterEvaluation, navigate]);

  // Show error state if there's an error
  if (error) {
    return (
      <LoadingState 
        isError={true} 
        error={error} 
        onRestart={handleRestart}
      />
    );
  }

  if (isLoading || isTransitioning) {
    return <LoadingState message="Pripremanje ocjenjivanja..." />;
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

  // Show loading if no current sample and not finished (with restart option)
  if (!currentSample) {
    return (
      <LoadingState 
        message="Traženje sljedećeg uzorka..."
        isError={true}
        error="Nema dostupnih uzoraka za ocjenjivanje"
        onRestart={handleRestart}
      />
    );
  }

  return <EvaluationForm eventId={eventId} />;
}
