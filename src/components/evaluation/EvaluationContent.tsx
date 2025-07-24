import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { EvaluationForm } from "@/components/evaluation/EvaluationForm";
import { CompletionMessage } from "@/components/evaluation/CompletionMessage";
import { SampleRevealScreen } from "@/components/evaluation/SampleRevealScreen";
import { LoadingState } from "@/components/evaluation/LoadingState";
import { useSimpleEvaluationFlow } from "@/hooks/useSimpleEvaluationFlow";
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
  
  // Use simple evaluation flow hook - vanjski prijedlog implementiran
  const {
    isLoading,
    isSubmitting,
    showSampleReveal,
    error,
    isEvaluationComplete,
    currentSample,
    currentProductType,
    jarAttributes,
    event,
    submitEvaluation,
    continueAfterReveal,
    canEnterEvaluation,
    debugInfo
  } = useSimpleEvaluationFlow(eventId);

  // Handle restart functionality - simplified
  const handleRestart = useCallback(() => {
    console.log('🔄 EvaluationContent: Restarting evaluation');
    window.location.reload(); // Simple restart
  }, []);

  // Route guard - redirect if user can't enter evaluation
  useEffect(() => {
    if (!isLoading && !canEnterEvaluation()) {
      console.log('🚨 EvaluationContent: User cannot enter evaluation, redirecting to dashboard');
      navigate('/evaluator');
      return;
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

  // Loading state
  if (isLoading) {
    return <LoadingState message="Priprema evaluacije..." />;
  }

  // Evaluation complete
  if (isEvaluationComplete) {
    return <CompletionMessage onReturn={() => navigate('/evaluator')} />;
  }

  // Sample reveal screen
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