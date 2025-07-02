import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Sample, JARAttribute, ProductType, Evaluation } from "../types";
import { useAuth } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useEvaluationManager } from "@/hooks/useEvaluationManager";
import { useSubmitEvaluation } from "@/hooks/useEvaluations";

interface EvaluationContextType {
  // Stanja
  isLoading: boolean;
  currentSample: Sample | null;
  currentProductType: ProductType | null;
  jarAttributes: JARAttribute[];
  completedSamplesForReveal: Sample[];
  showSampleReveal: boolean;
  isEvaluationFinished: boolean;

  // Akcije
  startEvaluation: (eventId: string) => Promise<void>;
  submitAndLoadNext: (evaluationData: Omit<Evaluation, "id" | "userId" | "sampleId" | "productTypeId" | "eventId" | "timestamp">) => Promise<void>;
  proceedToNextStep: () => void;
}

const EvaluationContext = createContext<EvaluationContextType | undefined>(undefined);

export const EvaluationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [eventId, setEventId] = useState<string | null>(null);
  
  // Use the centralized evaluation manager
  const {
    currentSample,
    currentJARAttributes,
    isComplete,
    currentProductType,
    showSampleReveal,
    isLoading,
    loadNextSample,
    loadNextProductType,
    resetEvaluation,
    setShowSampleReveal,
    markProductTypeComplete,
  } = useEvaluationManager(eventId || undefined);

  const submitMutation = useSubmitEvaluation();

  const [completedSamplesForReveal, setCompletedSamplesForReveal] = useState<Sample[]>([]);

  const startEvaluation = useCallback(async (eventIdToStart: string) => {
    console.log('=== STARTING EVALUATION ===', eventIdToStart);
    setEventId(eventIdToStart);
    resetEvaluation();
    
    if (!user) {
      console.error('No user found for evaluation');
      return;
    }

    try {
      // Load first sample automatically
      await loadNextSample(eventIdToStart);
    } catch (error) {
      console.error("Error starting evaluation:", error);
      toast({ 
        title: "Greška", 
        description: "Nije moguće pokrenuti evaluaciju.", 
        variant: "destructive" 
      });
    }
  }, [user, toast, resetEvaluation, loadNextSample]);

  const proceedToNextStep = useCallback(async () => {
    console.log('=== PROCEEDING TO NEXT STEP ===');
    setShowSampleReveal(false);
    setCompletedSamplesForReveal([]);
    
    if (!eventId) return;
    
    // Load next sample
    await loadNextSample(eventId);
  }, [eventId, loadNextSample, setShowSampleReveal]);

  const submitAndLoadNext = useCallback(async (evaluationData: Omit<Evaluation, "id" | "userId" | "sampleId" | "productTypeId" | "eventId" | "timestamp">) => {
    if (!user || !currentSample || !eventId || !currentProductType) {
      console.error('Missing required data for submission');
      return;
    }

    console.log('=== SUBMITTING EVALUATION ===');
    console.log('Sample:', currentSample.id);
    console.log('Product Type:', currentProductType.id);

    try {
      // Submit evaluation with correct property names
      await submitMutation.mutateAsync({
        userId: user.id,
        sampleId: currentSample.id,
        productTypeId: currentProductType.id,
        eventId: eventId,
        hedonicRatings: evaluationData.hedonic,
        jarRatings: evaluationData.jar,
      });

      // Check if current product type is finished
      // For now, we'll show reveal after each sample submission
      // This can be optimized later to check if all samples in product type are done
      setCompletedSamplesForReveal([currentSample]);
      setShowSampleReveal(true);
      
    } catch (error) {
      console.error("Error submitting evaluation:", error);
      toast({ 
        title: "Greška", 
        description: "Problem kod spremanja ocjene. Pokušajte ponovno.", 
        variant: "destructive" 
      });
    }
  }, [user, currentSample, currentProductType, eventId, submitMutation, toast]);

  return (
    <EvaluationContext.Provider
      value={{
        isLoading,
        currentSample,
        currentProductType,
        jarAttributes: currentJARAttributes,
        completedSamplesForReveal,
        showSampleReveal,
        isEvaluationFinished: isComplete,
        startEvaluation,
        submitAndLoadNext,
        proceedToNextStep,
      }}
    >
      {children}
    </EvaluationContext.Provider>
  );
};

export const useEvaluation = () => {
  const context = useContext(EvaluationContext);
  if (context === undefined) {
    throw new Error("useEvaluation must be used within an EvaluationProvider");
  }
  return context;
};