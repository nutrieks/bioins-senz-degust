import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useEventDetailQueries } from "@/hooks/useEventDetailQueries";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getJARAttributes } from "@/services/supabase/jarAttributes";
import { useSubmitEvaluation } from "@/hooks/useEvaluations";
import { getCompletedEvaluations } from "@/services/supabase/evaluations";
import { getNextSample as getNextSampleSupabase } from "@/services/supabase/randomization";
import { HedonicScale, JARRating, Sample, ProductType } from "@/types";

export function useSimpleEvaluationFlow(eventId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const submitEvaluationMutation = useSubmitEvaluation();

  // Simple state with useState - vanjski prijedlog implementiran
  const [samples, setSamples] = useState<Sample[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSampleReveal, setShowSampleReveal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data queries
  const { event, productTypes, isLoading: isLoadingQueries, hasError: queriesHaveError } = useEventDetailQueries(eventId);
  
  const { data: jarAttributes = [] } = useQuery({
    queryKey: ['jarAttributes', eventId],
    queryFn: () => getJARAttributes(eventId!),
    enabled: !!eventId,
  });

  const { data: completedEvaluations = [] } = useQuery({
    queryKey: ['completedEvaluations', eventId, user?.id],
    queryFn: () => getCompletedEvaluations(eventId!, user!.id),
    enabled: !!eventId && !!user?.id,
  });

  // Fetch all samples for evaluator - vanjski prijedlog implementiran
  const fetchAllSamples = useCallback(async () => {
    if (!eventId || !user?.id || !user.evaluatorPosition || isLoadingQueries || queriesHaveError) {
      console.log('🔍 Fetch samples skipped:', { 
        eventId: !!eventId, 
        userId: !!user?.id, 
        evaluatorPosition: user?.evaluatorPosition,
        isLoadingQueries,
        queriesHaveError 
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    
    console.log('🚀 SIMPLE FLOW: Fetching all samples for evaluator');

    try {
      const completedSampleIds = completedEvaluations.map(e => e.sampleId);
      console.log('📋 Completed samples:', completedSampleIds);

      // Get all remaining samples for this evaluator
      const allSamples: Sample[] = [];
      let currentCompletedIds = [...completedSampleIds];
      
      // Keep fetching next samples until we get null (no more samples)
      while (true) {
        const nextSampleData = await getNextSampleSupabase(
          user.id, 
          eventId, 
          user.evaluatorPosition.toString(), 
          currentCompletedIds
        );
        
        if (!nextSampleData?.sample) {
          break; // No more samples
        }
        
        allSamples.push(nextSampleData.sample);
        currentCompletedIds.push(nextSampleData.sample.id);
      }

      console.log('✅ SIMPLE FLOW: All samples fetched:', {
        totalSamples: allSamples.length,
        sampleIds: allSamples.map(s => s.id)
      });

      setSamples(allSamples);
      setCurrentIndex(0);
      setIsLoading(false);

    } catch (error) {
      console.error('🚨 SIMPLE FLOW: Error fetching samples:', error);
      setError(error instanceof Error ? error.message : 'Error fetching samples');
      setIsLoading(false);
    }
  }, [eventId, user?.id, user?.evaluatorPosition, completedEvaluations, isLoadingQueries, queriesHaveError]);

  // Initialize on mount or when dependencies change
  useEffect(() => {
    fetchAllSamples();
  }, [fetchAllSamples]);

  // Submit evaluation - vanjski prijedlog implementiran
  const submitEvaluation = useCallback(async (data: { hedonic: HedonicScale; jar: JARRating }) => {
    const currentSample = samples[currentIndex];
    if (!currentSample || !user?.id || !eventId) {
      console.error('🚨 Submit failed: missing required data');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      console.log('📤 SIMPLE FLOW: Submitting evaluation for sample:', currentSample.id);

      // Submit to server
      await submitEvaluationMutation.mutateAsync({
        userId: user.id,
        sampleId: currentSample.id,
        productTypeId: currentSample.productTypeId,
        eventId: eventId,
        hedonicRatings: data.hedonic,
        jarRatings: data.jar,
      });

      console.log('✅ SIMPLE FLOW: Evaluation submitted successfully');

      // Check if next sample is different product type for reveal
      const nextSample = samples[currentIndex + 1];
      const shouldShowReveal = !nextSample || (nextSample && nextSample.productTypeId !== currentSample.productTypeId);

      if (shouldShowReveal) {
        setShowSampleReveal(true);
      } else {
        // Move to next sample directly
        setCurrentIndex(prev => prev + 1);
      }

      // Invalidate completed evaluations query
      await queryClient.invalidateQueries({ queryKey: ['completedEvaluations', eventId, user.id] });

    } catch (error) {
      console.error('🚨 SIMPLE FLOW: Submit error:', error);
      setError(error instanceof Error ? error.message : 'Submit failed');
    } finally {
      setIsSubmitting(false);
    }
  }, [samples, currentIndex, user?.id, eventId, submitEvaluationMutation, queryClient]);

  // Continue after reveal
  const continueAfterReveal = useCallback(() => {
    console.log('🔄 SIMPLE FLOW: Continuing after reveal');
    setShowSampleReveal(false);
    setCurrentIndex(prev => prev + 1);
  }, []);

  // Derived state
  const currentSample = samples[currentIndex] || null;
  const currentProductType = currentSample && productTypes 
    ? productTypes.find(pt => pt.id === currentSample.productTypeId) || null
    : null;
  const isEvaluationComplete = currentIndex >= samples.length && samples.length > 0;

  const canEnterEvaluation = useCallback(() => {
    return !!event && !!user?.evaluatorPosition;
  }, [event, user?.evaluatorPosition]);

  console.log('🔍 SIMPLE FLOW STATE:', {
    samplesCount: samples.length,
    currentIndex,
    currentSampleId: currentSample?.id,
    isLoading,
    isSubmitting,
    showSampleReveal,
    isEvaluationComplete,
    error
  });

  return {
    // State
    isLoading,
    isSubmitting,
    showSampleReveal,
    error,
    isEvaluationComplete,

    // Data
    currentSample,
    currentProductType,
    jarAttributes,
    event,

    // Actions
    submitEvaluation,
    continueAfterReveal,
    canEnterEvaluation,

    // Debug
    debugInfo: {
      samplesCount: samples.length,
      currentIndex,
      allSampleIds: samples.map(s => s.id)
    }
  };
}
