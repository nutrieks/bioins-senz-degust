
import React, { createContext, useContext, useState, useCallback } from "react";
import { Sample, JARAttribute, ProductType } from "../types";
import { getNextSample, getCompletedEvaluations, getProductTypes, submitEvaluation } from "../services/dataService";
import { useAuth } from "./AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface EvaluationContextType {
  // States
  isLoading: boolean;
  currentSample: Sample | null;
  currentProductType: ProductType | null;
  completedSamplesForProductType: Sample[];
  showSampleReveal: boolean;
  isEvaluationFinished: boolean;
  currentJARAttributes: JARAttribute[];

  // Actions
  startEvaluation: (eventId: string) => Promise<void>;
  submitAndLoadNext: (evaluationData: any) => Promise<void>;
  proceedToNextStep: () => Promise<void>;
}

const EvaluationContext = createContext<EvaluationContextType | undefined>(undefined);

export const EvaluationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(true);
  const [eventId, setEventId] = useState<string | null>(null);
  const [allProductTypes, setAllProductTypes] = useState<ProductType[]>([]);
  const [currentProductType, setCurrentProductType] = useState<ProductType | null>(null);
  const [currentSample, setCurrentSample] = useState<Sample | null>(null);
  const [completedSamples, setCompletedSamples] = useState<string[]>([]);
  const [completedSamplesForProductType, setCompletedSamplesForProductType] = useState<Sample[]>([]);
  const [showSampleReveal, setShowSampleReveal] = useState(false);
  const [isEvaluationFinished, setIsEvaluationFinished] = useState(false);
  const [currentJARAttributes, setCurrentJARAttributes] = useState<JARAttribute[]>([]);

  const findNextProductType = useCallback((): ProductType | null => {
    if (!currentProductType) {
      // If no current, return first that has unrated samples
      return allProductTypes.find(pt => pt.samples && pt.samples.some(s => !completedSamples.includes(s.id))) || null;
    }

    // Find current index and look for next
    const currentIndex = allProductTypes.findIndex(pt => pt.id === currentProductType.id);
    return allProductTypes.find((pt, index) => 
      index > currentIndex && 
      pt.samples && 
      pt.samples.some(s => !completedSamples.includes(s.id))
    ) || null;
  }, [allProductTypes, completedSamples, currentProductType]);

  const loadNext = useCallback(async (currentEventId: string) => {
    if (!user) return;
    setIsLoading(true);

    try {
      console.log('=== LOADING NEXT SAMPLE ===');
      console.log('Current product type:', currentProductType?.id);
      console.log('Completed samples:', completedSamples.length);

      // Get next sample for current product type
      const nextSampleResult = await getNextSample(user.id, currentEventId, currentProductType?.id, completedSamples);
      console.log('Next sample result:', nextSampleResult);

      if (nextSampleResult && nextSampleResult.sample) {
        console.log('Found next sample:', nextSampleResult.sample.blindCode);
        setCurrentSample(nextSampleResult.sample);
      } else {
        console.log('No more samples for current product type - showing reveal');
        // No more samples in current product type
        const samplesForReveal = currentProductType?.samples || [];
        setCompletedSamplesForProductType(samplesForReveal);
        setShowSampleReveal(true);
        setCurrentSample(null);
      }
    } catch (error) {
      console.error('Error loading next sample:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user, currentProductType, completedSamples]);

  const startEvaluation = useCallback(async (eventIdToStart: string) => {
    console.log('=== STARTING EVALUATION ===');
    console.log('Event ID:', eventIdToStart);
    
    setEventId(eventIdToStart);
    setIsLoading(true);
    
    if (!user) {
      console.log('No user found');
      setIsLoading(false);
      return;
    }

    try {
      // Fetch product types and completed evaluations
      const productTypes = await getProductTypes(eventIdToStart);
      const evaluations = await getCompletedEvaluations(eventIdToStart, user.id);
      const completedIds = evaluations.map(e => e.sampleId);

      console.log('Product types loaded:', productTypes.length);
      console.log('Completed evaluations:', completedIds.length);

      setAllProductTypes(productTypes);
      setCompletedSamples(completedIds);

      // Find first product type with unrated samples
      const firstProductType = productTypes.find(pt => 
        pt.samples && pt.samples.some(s => !completedIds.includes(s.id))
      ) || null;

      console.log('First product type to evaluate:', firstProductType?.productName);
      setCurrentProductType(firstProductType);

      if (!firstProductType) {
        console.log('No product types to evaluate - evaluation finished');
        setIsEvaluationFinished(true);
        setIsLoading(false);
        return;
      }

      // Get first sample
      const nextSampleResult = await getNextSample(user.id, eventIdToStart, firstProductType.id, completedIds);
      
      if (nextSampleResult && nextSampleResult.sample) {
        console.log('First sample loaded:', nextSampleResult.sample.blindCode);
        setCurrentSample(nextSampleResult.sample);
      } else {
        console.log('No samples available - evaluation finished');
        setIsEvaluationFinished(true);
      }

    } catch (error) {
      console.error('Error starting evaluation:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const submitMutation = useMutation({
    mutationFn: (evaluationData: any) => submitEvaluation(evaluationData),
    onSuccess: (data, variables) => {
      console.log('Evaluation submitted successfully');
      const newCompleted = [...completedSamples, variables.sampleId];
      setCompletedSamples(newCompleted);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['evaluations', eventId] });
      queryClient.invalidateQueries({ queryKey: ['evaluationsStatus', eventId] });
    },
    onError: (error) => {
      console.error('Error submitting evaluation:', error);
    }
  });

  const submitAndLoadNext = useCallback(async (evaluationData: any) => {
    if (!currentSample || !eventId) {
      console.log('Cannot submit - missing sample or event ID');
      return;
    }

    console.log('=== SUBMITTING AND LOADING NEXT ===');
    console.log('Current sample:', currentSample.blindCode);

    const submissionData = {
      ...evaluationData,
      userId: user!.id,
      sampleId: currentSample.id,
      productTypeId: currentSample.productTypeId,
      eventId: eventId,
    };

    try {
      await submitMutation.mutateAsync(submissionData);
      await loadNext(eventId);
    } catch (error) {
      console.error('Error in submitAndLoadNext:', error);
    }
  }, [currentSample, eventId, user, submitMutation, loadNext]);

  const proceedToNextStep = useCallback(async () => {
    console.log('=== PROCEEDING TO NEXT STEP ===');
    
    setShowSampleReveal(false);
    setIsLoading(true);

    try {
      const nextProductType = findNextProductType();
      console.log('Next product type:', nextProductType?.productName);
      
      setCurrentProductType(nextProductType);

      if (nextProductType && eventId) {
        await loadNext(eventId);
      } else {
        console.log('No more product types - evaluation finished');
        setIsEvaluationFinished(true);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error proceeding to next step:', error);
      setIsLoading(false);
    }
  }, [findNextProductType, eventId, loadNext]);

  return (
    <EvaluationContext.Provider
      value={{
        isLoading,
        currentSample,
        currentProductType,
        completedSamplesForProductType,
        showSampleReveal,
        isEvaluationFinished,
        currentJARAttributes,
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
  if (!context) {
    throw new Error("useEvaluation must be used within an EvaluationProvider");
  }
  return context;
};
