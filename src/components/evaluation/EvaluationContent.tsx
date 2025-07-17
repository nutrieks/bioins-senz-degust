
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { EvaluationForm } from "@/components/evaluation/EvaluationForm";
import { CompletionMessage } from "@/components/evaluation/CompletionMessage";
import { SampleRevealScreen } from "@/components/evaluation/SampleRevealScreen";
import { LoadingState } from "@/components/evaluation/LoadingState";
import { useEvaluationFlow } from "@/hooks/useEvaluationFlow";
import { useEvents } from "@/hooks/useEvents";
import { EventStatus } from "@/types";

interface EvaluationContentProps { 
  eventId: string; 
}

export function EvaluationContent({ eventId }: EvaluationContentProps) {
  const navigate = useNavigate();
  const { data: allEvents = [] } = useEvents();
  
  // CRITICAL DEBUG LOGGING
  console.log('[EvaluationContent] === EVALUATION ENTRY POINT ===');
  console.log('[EvaluationContent] Received eventId:', eventId);
  console.log('[EvaluationContent] EventId type:', typeof eventId);
  console.log('[EvaluationContent] All available events:', allEvents.map(e => ({ 
    id: e.id, 
    date: e.date, 
    status: e.status 
  })));
  
  // CRITICAL: Validate eventId exists and is active
  const activeEvents = allEvents.filter(e => e.status === EventStatus.ACTIVE);
  const targetEvent = allEvents.find(e => e.id === eventId);
  const activeTargetEvent = activeEvents.find(e => e.id === eventId);
  
  console.log('[EvaluationContent] Active events:', activeEvents.map(e => e.id));
  console.log('[EvaluationContent] Target event found:', targetEvent);
  console.log('[EvaluationContent] Active target event found:', activeTargetEvent);
  
  // AUTO-REDIRECT to correct active event if eventId is wrong
  useEffect(() => {
    if (allEvents.length > 0 && !activeTargetEvent) {
      console.log('[EvaluationContent] CRITICAL: EventId not found or not active!');
      
      if (activeEvents.length > 0) {
        const correctEventId = activeEvents[0].id;
        console.log('[EvaluationContent] Auto-redirecting to correct active event:', correctEventId);
        navigate(`/evaluator/evaluate/${correctEventId}`, { replace: true });
        return;
      } else {
        console.log('[EvaluationContent] No active events available, redirecting to dashboard');
        navigate('/evaluator', { replace: true });
        return;
      }
    }
  }, [allEvents, activeTargetEvent, activeEvents, eventId, navigate]);
  
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
