import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useEvaluation } from "@/contexts/EvaluationContext";
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
    loadNextSample,
    showSampleReveal,
    setShowSampleReveal,
    currentProductType
  } = useEvaluation();
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  console.log('=== EVALUATION CONTENT RENDER ===');
  console.log('Props:', { eventId, eventName, eventDate, productTypesCount: productTypes.length });
  console.log('User:', user ? { id: user.id, username: user.username, role: user.role } : 'No user');
  console.log('Current sample:', currentSample);
  console.log('Completed samples:', completedSamples.length);
  console.log('Is complete:', isComplete);
  console.log('Show sample reveal:', showSampleReveal);

  // Initial load
  useEffect(() => {
    console.log('=== EVALUATION CONTENT INITIAL EFFECT ===');
    console.log('Dependencies:', { 
      userId: user?.id, 
      eventId, 
      completedSamplesLength: completedSamples.length 
    });

    const initialLoad = async () => {
      if (!user?.id || !eventId) {
        console.log('Missing user or eventId, cannot load');
        setIsLoading(false);
        return;
      }

      try {
        setError(null);
        console.log('Starting initial load of samples...');
        
        // Load the first sample (context will handle which product type)
        await loadNextSample(eventId);
        
      } catch (error) {
        console.error('Error in initial load:', error);
        setError(error instanceof Error ? error.message : 'Neočekivana greška');
      } finally {
        setIsLoading(false);
      }
    };

    // Only load initially if we don't have a current sample and we're not complete
    if (!currentSample && !isComplete) {
      console.log('No current sample and not completed - starting initial load');
      initialLoad();
    } else {
      console.log('Current sample exists or evaluation completed - not loading initially');
      setIsLoading(false);
    }
  }, [user?.id, eventId]);

  const handleSampleSubmitted = () => {
    console.log('=== SAMPLE SUBMITTED ===');
    setShowSampleReveal(true);
  };

  const handleContinue = async () => {
    console.log('=== CONTINUING TO NEXT SAMPLE ===');
    setShowSampleReveal(false);
    setIsLoading(true);
    
    try {
      await loadNextSample(eventId, currentSample?.productTypeId);
    } catch (error) {
      console.error('Error loading next sample:', error);
      setError(error instanceof Error ? error.message : 'Greška prilikom učitavanja sljedećeg uzorka');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReturnToDashboard = () => {
    navigate('/evaluator');
  };

  if (isLoading) {
    return <LoadingState />;
  }

  if (error) {
    return (
      <div className="text-center p-6">
        <h2 className="text-xl font-semibold text-red-600 mb-4">
          Greška prilikom učitavanja
        </h2>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button 
          onClick={() => {
            setError(null);
            setIsLoading(true);
            loadNextSample(eventId).finally(() => setIsLoading(false));
          }}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Pokušaj ponovno
        </button>
      </div>
    );
  }

  if (isComplete) {
    return (
      <CompletionMessage 
        onReturn={handleReturnToDashboard}
      />
    );
  }

  if (showSampleReveal && currentSample) {
    return (
      <SampleRevealScreen
        eventId={eventId}
        productTypeId={currentSample.productTypeId}
        productName={productTypes.find(pt => pt.id === currentSample.productTypeId)?.productName || ''}
        onContinue={handleContinue}
      />
    );
  }

  if (!currentSample) {
    return (
      <div className="text-center p-6">
        <h2 className="text-xl font-semibold mb-4">
          Nema dostupnih uzoraka
        </h2>
        <p className="text-muted-foreground">
          Trenutno nema uzoraka za ocjenjivanje.
        </p>
      </div>
    );
  }

  return (
    <EvaluationForm
      eventId={eventId}
      onComplete={handleSampleSubmitted}
    />
  );
}
