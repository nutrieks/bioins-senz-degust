
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEvaluation } from "@/contexts/EvaluationContext";
import { EvaluationForm } from "./EvaluationForm";
import { CompletionMessage } from "./CompletionMessage";
import { SampleRevealScreen } from "./SampleRevealScreen";

interface EvaluationContentProps {
  eventId: string;
}

export function EvaluationContent({ eventId }: EvaluationContentProps) {
  const navigate = useNavigate();
  const { 
    isLoading,
    currentSample,
    currentProductType,
    showSampleReveal,
    isEvaluationFinished,
    startEvaluation,
    proceedToNextStep
  } = useEvaluation();

  console.log('=== EVALUATION CONTENT RENDER ===');
  console.log('Event ID:', eventId);
  console.log('Is loading:', isLoading);
  console.log('Current sample:', currentSample?.blindCode);
  console.log('Current product type:', currentProductType?.productName);
  console.log('Show sample reveal:', showSampleReveal);
  console.log('Is evaluation finished:', isEvaluationFinished);

  // Start evaluation on mount
  useEffect(() => {
    console.log('Starting evaluation for event:', eventId);
    startEvaluation(eventId);
  }, [eventId, startEvaluation]);

  const handleReturnToDashboard = () => {
    navigate('/evaluator');
  };

  const handleContinueAfterReveal = async () => {
    console.log('Continuing after reveal');
    await proceedToNextStep();
  };

  // Show loading
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-lg font-medium">Učitavanje...</p>
        <p className="text-sm text-muted-foreground">Pripravljam ocjenjivanje...</p>
      </div>
    );
  }

  // Show completion message if evaluation is finished
  if (isEvaluationFinished) {
    return (
      <CompletionMessage 
        onReturn={handleReturnToDashboard}
      />
    );
  }

  // Show sample reveal screen
  if (showSampleReveal && currentProductType) {
    return (
      <SampleRevealScreen
        eventId={eventId}
        productTypeId={currentProductType.id}
        productName={currentProductType.productName}
        onContinue={handleContinueAfterReveal}
      />
    );
  }

  // Show evaluation form if we have a current sample
  if (currentSample) {
    return (
      <EvaluationForm
        eventId={eventId}
        onComplete={() => {
          console.log('Sample evaluation completed');
          // The form will handle submission through submitAndLoadNext
        }}
      />
    );
  }

  // No sample available
  return (
    <div className="text-center p-6">
      <h2 className="text-xl font-semibold mb-4">
        Nema dostupnih uzoraka
      </h2>
      <p className="text-muted-foreground mb-4">
        Trenutno nema uzoraka za ocjenjivanje.
      </p>
      <button 
        onClick={handleReturnToDashboard}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Povratak na početnu
      </button>
    </div>
  );
}
