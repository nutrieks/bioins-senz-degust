
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useEvaluation } from "@/contexts/EvaluationContext";
import { getNextSample } from "@/services/supabase/randomization";
import { EvaluationForm } from "./EvaluationForm";
import { CompletionMessage } from "./CompletionMessage";
import { SampleRevealScreen } from "./SampleRevealScreen";
import { LoadingState } from "./LoadingState";
import { ProductType } from "@/types";
import { useNavigate } from "react-router-dom";

interface EvaluationContentProps {
  eventId: string;
  eventName: string;
  eventDate: string;
  productTypes: ProductType[];
}

export function EvaluationContent({ 
  eventId, 
  eventName, 
  eventDate, 
  productTypes 
}: EvaluationContentProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { 
    currentSample, 
    completedSamples,
    isComplete,
    loadNextSample
  } = useEvaluation();
  
  const [isLoading, setIsLoading] = useState(true);
  const [showRevealScreen, setShowRevealScreen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  console.log('=== EVALUATION CONTENT RENDER ===');
  console.log('Props:', { eventId, eventName, eventDate, productTypesCount: productTypes.length });
  console.log('User:', user ? { id: user.id, username: user.username, role: user.role } : 'No user');
  console.log('Current sample:', currentSample);
  console.log('Completed samples:', completedSamples.length);
  console.log('Is complete:', isComplete);

  const fetchNextSample = async () => {
    if (!user?.id || !eventId) {
      console.log('Missing user or eventId, cannot fetch sample');
      setIsLoading(false);
      return;
    }

    console.log('=== FETCHING NEXT SAMPLE ===');
    console.log('User ID:', user.id);
    console.log('Event ID:', eventId);
    console.log('Completed sample IDs:', completedSamples);

    try {
      setError(null);
      // Use the context method instead of direct service call
      await loadNextSample(eventId);
    } catch (error) {
      console.error('Error fetching next sample:', error);
      setError(error instanceof Error ? error.message : 'Neočekivana greška');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log('=== EVALUATION CONTENT EFFECT ===');
    console.log('Dependencies changed:', { 
      userId: user?.id, 
      eventId, 
      completedSamplesLength: completedSamples.length 
    });

    if (!currentSample && !isComplete) {
      console.log('No current sample and not completed - fetching next sample');
      fetchNextSample();
    } else {
      console.log('Current sample exists or evaluation completed - not fetching');
      setIsLoading(false);
    }
  }, [user?.id, eventId, completedSamples.length]);

  const handleSampleSubmitted = () => {
    console.log('=== SAMPLE SUBMITTED ===');
    setShowRevealScreen(true);
    // Context will handle data refresh
  };

  const handleContinue = () => {
    console.log('=== CONTINUING TO NEXT SAMPLE ===');
    setShowRevealScreen(false);
    setIsLoading(true);
    fetchNextSample();
  };

  const handleReturnToDashboard = () => {
    navigate('/evaluator');
  };

  // Debug information display (remove in production)
  const debugInfo = (
    <div className="mb-4 p-4 bg-gray-100 rounded text-xs">
      <strong>Debug Info:</strong><br/>
      User: {user ? `${user.username} (${user.role})` : 'None'}<br/>
      Event: {eventId}<br/>
      Product Types: {productTypes.length}<br/>
      Current Sample: {currentSample ? currentSample.id : 'None'}<br/>
      Completed: {completedSamples.length}<br/>
      Is Completed: {isComplete ? 'Yes' : 'No'}<br/>
      Loading: {isLoading ? 'Yes' : 'No'}<br/>
      Error: {error || 'None'}
    </div>
  );

  if (isLoading) {
    return (
      <div>
        {debugInfo}
        <LoadingState />
      </div>
    );
  }

  if (error) {
    return (
      <div>
        {debugInfo}
        <div className="text-center p-6">
          <h2 className="text-xl font-semibold text-red-600 mb-4">
            Greška prilikom učitavanja
          </h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              setIsLoading(true);
              fetchNextSample();
            }}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Pokušaj ponovno
          </button>
        </div>
      </div>
    );
  }

  if (isComplete || !currentSample) {
    return (
      <div>
        {debugInfo}
        <CompletionMessage 
          onReturn={handleReturnToDashboard}
        />
      </div>
    );
  }

  if (showRevealScreen && currentSample) {
    return (
      <div>
        {debugInfo}
        <SampleRevealScreen
          eventId={eventId}
          productTypeId={currentSample.productTypeId}
          productName={productTypes.find(pt => pt.id === currentSample.productTypeId)?.productName || ''}
          onContinue={handleContinue}
        />
      </div>
    );
  }

  return (
    <div>
      {debugInfo}
      <EvaluationForm
        eventId={eventId}
        onComplete={handleContinue}
      />
    </div>
  );
}
