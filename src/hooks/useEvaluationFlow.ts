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

  // Merge server and optimistic completed samples with comprehensive logging
  const completedSamples = (() => {
    const serverIds = serverCompletedSamples.map(e => e.sampleId);
    const merged = [...new Set([...serverIds, ...optimisticCompletedSamples])];
    
    console.log('=== COMPLETED SAMPLES MERGE DEBUG ===');
    console.log('Server completed samples:', serverCompletedSamples.length);
    console.log('Server sample IDs:', serverIds);
    console.log('Optimistic completed samples:', optimisticCompletedSamples);
    console.log('Final merged completed samples:', merged);
    console.log('==========================================');
    
    return merged;
  })();

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

  // Submit evaluation with atomic updates and proper sequencing
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

    console.log("=== ATOMIC EVALUATION SUBMISSION START ===", {
      sampleId: currentSample.id,
      blindCode: currentSample.blindCode,
      productType: currentProductType.productName,
      currentCompletedSamples: completedSamples
    });

    setIsSubmitting(true);
    setExtendedTransition(500); 
    
    const cleanup = trackSubmission(currentSample.id);
    const currentSampleId = currentSample.id;
    
    // STEP 1: Optimistic update - immediately add current sample to completed list
    console.log('STEP 1: Adding optimistic update for sample:', currentSampleId);
    setOptimisticCompletedSamples(prev => {
      const newArray = [...prev, currentSampleId];
      console.log('Optimistic completed samples updated:', newArray);
      return newArray;
    });
    
    try {
      // STEP 2: Submit to server
      console.log('STEP 2: Submitting to server...');
      await submitEvaluationMutation.mutateAsync({
        userId: user.id,
        sampleId: currentSampleId,
        productTypeId: currentProductType.id,
        eventId: eventId,
        hedonicRatings: data.hedonic,
        jarRatings: data.jar,
      });
      console.log('✅ Server submission successful');

      // STEP 3: Refresh server data
      console.log('STEP 3: Refreshing server data...');
      await Promise.all([
        refetchCompleted(),
        invalidateCompletionData()
      ]);
      console.log('✅ Server data refreshed');

      // STEP 4: Clear optimistic update (it should now be in server data)
      console.log('STEP 4: Clearing optimistic update for sample:', currentSampleId);
      setOptimisticCompletedSamples(prev => {
        const filtered = prev.filter(id => id !== currentSampleId);
        console.log('Optimistic updates after clearing:', filtered);
        return filtered;
      });

      // STEP 5: Refresh next sample query with updated completed samples
      console.log('STEP 5: Refreshing next sample query...');
      await refetchNextSample();
      console.log('✅ Next sample query refreshed');

      // STEP 6: Force form reset
      console.log('STEP 6: Forcing form reset...');
      setForceFormReset(prev => prev + 1);

      // STEP 7: Check for product type completion and reveal logic
      console.log('STEP 7: Checking product type completion...');
      const { data: currentProductTypeSamples } = await supabase
        .from('samples')
        .select('id')
        .eq('product_type_id', currentProductType.id);
      
      const totalSamplesForProductType = currentProductTypeSamples?.length || 0;
      
      // We need to refetch to get the latest server data for this check
      const { data: freshServerData } = await refetchCompleted();
      const completedForThisProductType = (freshServerData || []).filter(e => 
        e.productTypeId === currentProductType.id
      ).length;
      
      const isProductTypeComplete = completedForThisProductType >= totalSamplesForProductType;
      
      console.log('Product type completion check:', {
        totalSamples: totalSamplesForProductType,
        completed: completedForThisProductType,
        isComplete: isProductTypeComplete
      });

      // Show sample reveal if product type is complete and there are more product types
      if (isProductTypeComplete) {
        const remainingProductTypes = productTypes.filter(pt => pt.id !== currentProductType.id);
        console.log('Product type completed! Remaining product types:', remainingProductTypes.length);
        if (remainingProductTypes.length > 0) {
          console.log('Setting showSampleReveal to true');
          setShowSampleReveal(true);
        }
      }

      toast({
        title: "Ocjena spremljena",
        description: `Uspješno ste ocijenili uzorak ${currentSample.blindCode}.`
      });

      console.log("=== ATOMIC EVALUATION SUBMISSION COMPLETED ===");

    } catch (error) {
      console.error("ERROR in evaluation submission:", error);
      // Revert optimistic update on error
      console.log('Reverting optimistic update for sample:', currentSampleId);
      setOptimisticCompletedSamples(prev => prev.filter(id => id !== currentSampleId));
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
    submitEvaluationMutation, toast, completedSamples
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