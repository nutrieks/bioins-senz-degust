import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEvaluationEngine } from "@/hooks/useEvaluationEngine";
import { useBrowserNavigationGuard } from "@/hooks/useBrowserNavigationGuard";
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

  // Browser navigation protection during active evaluation
  const { clearGuard } = useBrowserNavigationGuard({
    isActive: !!currentTask && !isComplete,
    message: 'Sigurni ste da želite izaći iz ocjenjivanja? Izgubiti ćete trenutni napredak.',
    onBeforeLeave: () => {
      // Store current progress before leaving
      if (currentTask) {
        console.log('💾 Storing progress before navigation');
      }
    }
  });

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

  if (showSampleReveal && samplesForReveal.productName) {
    return (
      <SampleRevealScreen
        productName={samplesForReveal.productName}
        samples={samplesForReveal.samples}
        onContinue={continueAfterReveal}
      />
    );
  }

  if (isComplete) {
    clearGuard(); // Clear navigation guard when complete
    return <CompletionMessage onReturn={() => navigate("/evaluator")} />;
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
  clearGuard(); // Clear navigation guard for fallback
  return <CompletionMessage onReturn={() => navigate("/evaluator")} />;
}