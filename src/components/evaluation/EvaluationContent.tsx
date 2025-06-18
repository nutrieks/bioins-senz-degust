
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
    currentProductType,
    loadNextProductType,
    isLoading,
    loadingMessage
  } = useEvaluation();
  
  const [error, setError] = useState<string | null>(null);

  console.log('=== OPTIMIZED EVALUATION CONTENT RENDER ===');
  console.log('Props:', { eventId, eventName, eventDate, productTypesCount: productTypes.length });
  console.log('User:', user ? { id: user.id, username: user.username, role: user.role } : 'No user');
  console.log('Current sample:', currentSample);
  console.log('Completed samples:', completedSamples.length);
  console.log('Is complete:', isComplete);
  console.log('Show sample reveal:', showSampleReveal);
  console.log('Is loading:', isLoading, 'Message:', loadingMessage);

  // Initial load - optimized to run only once
  useEffect(() => {
    console.log('=== OPTIMIZED EVALUATION CONTENT INITIAL EFFECT ===');
    
    const initialLoad = async () => {
      if (!user?.id || !eventId) {
        console.log('Missing user or eventId, cannot load');
        return;
      }

      try {
        setError(null);
        console.log('Starting optimized initial load of samples...');
        
        // Load the first sample (context will handle optimization)
        await loadNextSample(eventId);
        
      } catch (error) {
        console.error('Error in optimized initial load:', error);
        setError(error instanceof Error ? error.message : 'Neočekivana greška');
      }
    };

    // Only load initially if we don't have a current sample and we're not complete
    if (!currentSample && !isComplete && !isLoading) {
      console.log('No current sample and not completed - starting optimized initial load');
      initialLoad();
    } else {
      console.log('Current sample exists, evaluation completed, or already loading - not loading initially');
    }
  }, [user?.id, eventId]); // Removed other dependencies to prevent unnecessary re-runs

  const handleSampleSubmitted = () => {
    console.log('=== SAMPLE SUBMITTED ===');
    setShowSampleReveal(true);
  };

  const handleContinueAfterReveal = async () => {
    console.log('=== CONTINUING AFTER REVEAL ===');
    setShowSampleReveal(false);
    
    try {
      const hasMore = await loadNextProductType(eventId);
      if (!hasMore) {
        console.log('No more product types available');
      }
    } catch (error) {
      console.error('Error loading next product type:', error);
      setError(error instanceof Error ? error.message : 'Greška prilikom učitavanja sljedećeg tipa proizvoda');
    }
  };

  const handleReturnToDashboard = () => {
    navigate('/evaluator');
  };

  // Show enhanced loading state with specific messages
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="text-lg font-medium">{loadingMessage || "Učitavanje..."}</p>
        <p className="text-sm text-muted-foreground">Molimo pričekajte...</p>
      </div>
    );
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
            loadNextSample(eventId);
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
