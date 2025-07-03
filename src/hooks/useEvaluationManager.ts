
import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNextSample, useCompletedEvaluations } from "@/hooks/useEvaluations";
import { useEventDetailQueries } from "@/hooks/useEventDetailQueries";
import { getJARAttributes } from "@/services/dataService";
import { useQuery } from "@tanstack/react-query";
import { Sample, JARAttribute, ProductType } from "@/types";

export function useEvaluationManager(eventId?: string) {
  const { user } = useAuth();
  
  // Local UI state only (not server state)
  const [currentRound, setCurrentRound] = useState(0);
  const [showSampleReveal, setShowSampleReveal] = useState(false);
  const [processedProductTypes, setProcessedProductTypes] = useState<string[]>([]);
  const [currentProductTypeId, setCurrentProductTypeId] = useState<string>();
  const [forcedCompletedSampleIds, setForcedCompletedSampleIds] = useState<string[]>();

  // React Query for event data
  const { 
    event, 
    productTypes = [], 
    isLoading: isLoadingEvent 
  } = useEventDetailQueries(eventId);

  // React Query for completed evaluations
  const { 
    data: completedSamples = [], 
    isLoading: isLoadingCompleted 
  } = useCompletedEvaluations(eventId || "", user?.id);

  // React Query for next sample
  const { 
    data: nextSampleData,
    isLoading: isLoadingNextSample,
    refetch: refetchNextSample
  } = useNextSample(
    user?.id || "",
    eventId || "",
    currentProductTypeId,
    forcedCompletedSampleIds || completedSamples
  );

  console.log('useEvaluationManager - nextSampleData:', nextSampleData);

  // Derive current sample from next sample data
  const currentSample = nextSampleData?.sample || null;
  const isComplete = nextSampleData?.isComplete || false;

  console.log('useEvaluationManager - current sample and completion:', {
    sample: currentSample?.blindCode,
    productType: currentSample?.productTypeName,
    isComplete
  });

  // Find current product type
  const currentProductType = productTypes.find(pt => pt.id === currentSample?.productTypeId) || null;

  // React Query for JAR attributes
  const { data: currentJARAttributes = [] } = useQuery({
    queryKey: ['jarAttributes', currentSample?.productTypeId],
    queryFn: () => getJARAttributes(currentSample!.productTypeId),
    enabled: !!currentSample?.productTypeId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  console.log('useEvaluationManager - JAR attributes:', {
    productTypeId: currentSample?.productTypeId,
    jarAttributes: currentJARAttributes,
    count: currentJARAttributes?.length || 0
  });

  // Calculate remaining product types
  const remainingProductTypes = productTypes.filter(pt => !processedProductTypes.includes(pt.id));

  // Loading states
  const isLoading = isLoadingEvent || isLoadingCompleted || isLoadingNextSample;
  const loadingMessage = isLoadingEvent 
    ? "Dohvaćam podatke o događaju..." 
    : isLoadingCompleted 
    ? "Dohvaćam završene ocjene..." 
    : isLoadingNextSample 
    ? "Tražim sljedeći uzorak..." 
    : "";

  // Load next sample function
  const loadNextSample = useCallback(async (
    eventId: string, 
    productTypeId?: string, 
    forcedCompletedSampleIds?: string[]
  ) => {
    console.log("=== LOAD NEXT SAMPLE ===", { eventId, productTypeId, forcedCompletedSampleIds });
    
    if (productTypeId) {
      setCurrentProductTypeId(productTypeId);
    }
    
    if (forcedCompletedSampleIds) {
      setForcedCompletedSampleIds(forcedCompletedSampleIds);
    }
    
    await refetchNextSample();
  }, [refetchNextSample]);

  // Load next product type function
  const loadNextProductType = useCallback(async (eventId: string): Promise<boolean> => {
    console.log("=== LOADING NEXT PRODUCT TYPE ===");
    
    const availableTypes = productTypes.filter(pt => !processedProductTypes.includes(pt.id));
    
    if (availableTypes.length > 0) {
      console.log("Loading next available product type:", availableTypes[0]);
      await loadNextSample(eventId, availableTypes[0].id);
      return true;
    }
    
    console.log("No more product types available, evaluation complete");
    return false;
  }, [productTypes, processedProductTypes, loadNextSample]);

  // Update completed samples function
  const updateCompletedSamples = useCallback((sampleIds: string[]) => {
    console.log("Updating completed samples:", sampleIds);
    setForcedCompletedSampleIds(sampleIds);
  }, []);

  // Reset evaluation function
  const resetEvaluation = useCallback(() => {
    console.log("=== RESETTING EVALUATION ===");
    setCurrentRound(0);
    setShowSampleReveal(false);
    setProcessedProductTypes([]);
    setCurrentProductTypeId(undefined);
    setForcedCompletedSampleIds(undefined);
  }, []);

  // Handle product type completion
  const markProductTypeComplete = useCallback((productTypeId: string) => {
    if (!processedProductTypes.includes(productTypeId)) {
      console.log("Product type completed, adding to processed list:", productTypeId);
      setProcessedProductTypes(prev => [...prev, productTypeId]);
    }
  }, [processedProductTypes]);

  return {
    // Current state
    currentSample,
    currentRound,
    currentJARAttributes,
    isComplete,
    completedSamples,
    currentProductType,
    showSampleReveal,
    remainingProductTypes,
    
    // Loading states
    isLoading,
    loadingMessage,
    evaluationError: null, // React Query handles errors internally
    
    // Actions
    loadNextSample,
    loadNextProductType,
    resetEvaluation,
    setShowSampleReveal,
    updateCompletedSamples,
    markProductTypeComplete,
    setCurrentRound,
  };
}
