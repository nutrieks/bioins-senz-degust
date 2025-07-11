import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNextSample, useCompletedEvaluations, useSubmitEvaluation } from "@/hooks/useEvaluations";
import { useEventDetailQueries } from "@/hooks/useEventDetailQueries";
import { useEvaluationState } from "@/hooks/useEvaluationState";
import { getJARAttributes } from "@/services/dataService";
import { useQuery } from "@tanstack/react-query";
import { HedonicScale, JARRating } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

/**
 * Manages the complete evaluation flow: sample progression, completion detection, and reveal screens
 */
export function useEvaluationFlow(eventId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  // State management hook
  const {
    isEvaluationCompleteForUser,
    isTransitioning,
    canEnterEvaluation,
    canSubmitEvaluation,
    trackSubmission,
    setExtendedTransition,
    invalidateCompletionData
  } = useEvaluationState(eventId);
  
  // Local flow state
  const [showSampleReveal, setShowSampleReveal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [forceFormReset, setForceFormReset] = useState(0);
  const [optimisticCompletedSamples, setOptimisticCompletedSamples] = useState<string[]>([]);

  // Event data
  const { 
    event, 
    productTypes = [], 
    isLoading: isLoadingEvent 
  } = useEventDetailQueries(eventId);

  // Completed evaluations
  const { 
    data: serverCompletedSamples = [], 
    isLoading: isLoadingCompleted,
    refetch: refetchCompleted
  } = useCompletedEvaluations(eventId || "", user?.id);

  // Merge server and optimistic completed samples
  const completedSamples = [...new Set([...serverCompletedSamples.map(e => e.sampleId), ...optimisticCompletedSamples])];

  // Next sample
  const { 
    data: nextSampleData,
    isLoading: isLoadingNextSample,
    refetch: refetchNextSample
  } = useNextSample(
    user?.id || "",
    eventId || "",
    undefined,
    completedSamples
  );

  // Current sample and completion state
  const currentSample = nextSampleData?.sample || null;
  const isComplete = nextSampleData?.isComplete || false;
  const currentProductType = productTypes.find(pt => pt.id === currentSample?.productTypeId) || null;

  // JAR attributes
  const { data: currentJARAttributes = [] } = useQuery({
    queryKey: ['jarAttributes', currentSample?.productTypeId],
    queryFn: () => getJARAttributes(currentSample!.productTypeId),
    enabled: !!currentSample?.productTypeId,
    staleTime: 1000 * 60 * 5,
  });

  // Submit evaluation mutation
  const submitEvaluationMutation = useSubmitEvaluation();

  // Submit evaluation with comprehensive protection
  const submitEvaluation = useCallback(async (data: {
    hedonic: HedonicScale;
    jar: JARRating;
  }) => {
    if (!user || !currentSample || !eventId || !currentProductType) {
      throw new Error("Nedostaju podaci za predaju ocjene.");
    }

    // Pre-submission validation
    if (!canSubmitEvaluation(currentSample.id)) {
      return; // Protection already shows toast
    }

    console.log("=== PROTECTED EVALUATION SUBMISSION ===", {
      sampleId: currentSample.id,
      blindCode: currentSample.blindCode,
      productType: currentProductType.productName
    });

    setIsSubmitting(true);
    setExtendedTransition(500); // Short transition for quick response
    
    const cleanup = trackSubmission(currentSample.id);
    
    // Optimistic update - immediately add current sample to completed list
    setOptimisticCompletedSamples(prev => [...prev, currentSample.id]);
    
    try {
      // Submit with mutation
      await submitEvaluationMutation.mutateAsync({
        userId: user.id,
        sampleId: currentSample.id,
        productTypeId: currentProductType.id,
        eventId: eventId,
        hedonicRatings: data.hedonic,
        jarRatings: data.jar,
      });

      // Check if this completes the current product type
      const { data: currentProductTypeSamples } = await supabase
        .from('samples')
        .select('id')
        .eq('product_type_id', currentProductType.id);
      
      const totalSamplesForProductType = currentProductTypeSamples?.length || 0;
      
      // Count completed samples for this product type (including current submission)
      const completedForThisProductType = serverCompletedSamples.filter(e => 
        e.productTypeId === currentProductType.id
      ).length + 1; // +1 for current submission that just completed
      
      const isProductTypeComplete = completedForThisProductType >= totalSamplesForProductType;
      
      // Refresh all related data
      await Promise.all([
        refetchCompleted(),
        refetchNextSample(),
        invalidateCompletionData()
      ]);

      // Clear optimistic update after successful server sync
      setOptimisticCompletedSamples(prev => prev.filter(id => id !== currentSample.id));

      // Force form reset immediately after submission
      setForceFormReset(prev => prev + 1);

      // Show sample reveal if product type is complete and there are more product types
      if (isProductTypeComplete) {
        const remainingProductTypes = productTypes.filter(pt => pt.id !== currentProductType.id);
        if (remainingProductTypes.length > 0) {
          setShowSampleReveal(true);
        }
      }

      toast({
        title: "Ocjena spremljena",
        description: `Uspješno ste ocijenili uzorak ${currentSample.blindCode}.`
      });

    } catch (error) {
      console.error("Error submitting evaluation:", error);
      // Revert optimistic update on error
      setOptimisticCompletedSamples(prev => prev.filter(id => id !== currentSample.id));
      toast({
        title: "Greška",
        description: "Problem kod spremanja ocjene. Molimo pokušajte ponovno.",
        variant: "destructive"
      });
      throw error;
    } finally {
      cleanup();
      setIsSubmitting(false);
    }
  }, [
    user, currentSample, eventId, currentProductType, productTypes,
    canSubmitEvaluation, setExtendedTransition, trackSubmission,
    refetchCompleted, refetchNextSample, invalidateCompletionData,
    submitEvaluationMutation, toast, serverCompletedSamples
  ]);

  // Continue after sample reveal
  const continueAfterReveal = useCallback(async () => {
    console.log("=== CONTINUING AFTER REVEAL ===");
    setShowSampleReveal(false);
    setExtendedTransition(500);
    
    // Clear any remaining optimistic updates
    setOptimisticCompletedSamples([]);
    
    await refetchNextSample();
  }, [refetchNextSample, setExtendedTransition]);

  // Initialize evaluation flow
  const initializeEvaluation = useCallback(async () => {
    console.log("=== INITIALIZING EVALUATION FLOW ===", { eventId });
    
    if (!user || !eventId) return;
    
    // Reset local state for fresh start
    setShowSampleReveal(false);
    setOptimisticCompletedSamples([]);
    
    // Fetch initial data
    await Promise.all([
      refetchCompleted(),
      refetchNextSample()
    ]);
    
    console.log("✅ Evaluation flow initialized");
  }, [user, eventId, refetchCompleted, refetchNextSample]);

  // Loading states
  const isLoading = isLoadingEvent || isLoadingCompleted || isLoadingNextSample;

  return {
    // Current state
    currentSample,
    currentProductType,
    currentJARAttributes,
    showSampleReveal,
    isComplete,
    isEvaluationCompleteForUser,
    forceFormReset,
    
    // Loading and transition states
    isLoading,
    isSubmitting,
    isTransitioning,
    
    // Actions
    submitEvaluation,
    continueAfterReveal,
    initializeEvaluation,
    
    // Guards
    canEnterEvaluation,
  };
}