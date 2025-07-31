import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEvaluationEngine } from "@/hooks/useEvaluationEngine";
import { LoadingState } from "@/components/evaluation/LoadingState";
import { EvaluationForm } from "@/components/evaluation/EvaluationForm";
import { SampleRevealScreen } from "@/components/evaluation/SampleRevealScreen";
import { CompletionMessage } from "@/components/evaluation/CompletionMessage";

interface EvaluationContentProps {
  eventId: string;
}

export function EvaluationContent({ eventId }: EvaluationContentProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    isLoading,
    isError,
    error,
    currentTask,
    isComplete,
    showSampleReveal,
    samplesForReveal,
    submitEvaluation,
    continueAfterReveal,
    isSubmitting,
  } = useEvaluationEngine(eventId);

  if (isLoading) {
    return <LoadingState message="Priprema ocjenjivanja..." />;
  }

  if (isError) {
    return (
      <LoadingState
        isError={true}
        error={error instanceof Error ? error.message : "Došlo je do greške."}
        onRestart={() => window.location.reload()}
      />
    );
  }

  if (isComplete) {
    return <CompletionMessage onReturn={() => navigate("/evaluator")} />;
  }

  if (showSampleReveal && currentTask) {
    return (
      <SampleRevealScreen
        eventId={eventId}
        productTypeId={currentTask.productType.id}
        productName={currentTask.productType.productName}
        onContinue={continueAfterReveal}
      />
    );
  }

  if (currentTask && user) {
    return (
      <EvaluationForm
        key={currentTask.sample.id} // Ključ osigurava resetiranje forme
        user={user}
        eventDate={new Date().toLocaleDateString('hr-HR')}
        sample={currentTask.sample}
        productType={currentTask.productType}
        jarAttributes={currentTask.jarAttributes}
        onSubmit={submitEvaluation}
        isSubmitting={isSubmitting}
      />
    );
  }

  // Fallback ako nema zadataka, a nije gotovo (npr. sve je već ocijenjeno)
  return <CompletionMessage onReturn={() => navigate("/evaluator")} />;
}