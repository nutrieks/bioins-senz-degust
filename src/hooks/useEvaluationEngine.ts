import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getProductTypes } from '@/services/supabase/productTypes';
import { getCompletedEvaluations, submitEvaluation as submitEvaluationAPI } from '@/services/supabase/evaluations';
import { getRandomization } from '@/services/supabase/randomization/core';
import { getJARAttributes } from '@/services/supabase/jarAttributes';
import { Sample, ProductType, HedonicScale, JARRating, EvaluationSubmission } from '@/types';

// Struktura koja predstavlja jedan zadatak (ocjenjivanje jednog uzorka)
interface EvaluationTask {
  sample: Sample;
  productType: ProductType;
  jarAttributes: any[];
}

export function useEvaluationEngine(eventId: string) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<EvaluationTask[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSampleReveal, setShowSampleReveal] = useState(false);
  const [samplesForReveal, setSamplesForReveal] = useState<{productName: string, samples: Sample[]}>({ productName: '', samples: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 1. Centralizirano dohvaćanje SVIH podataka na početku
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['evaluationEngine', eventId, user?.id],
    queryFn: async () => {
      if (!user?.id || !user.evaluatorPosition) {
        throw new Error("Korisnik nije valjan ocjenjivač.");
      }

      console.log('🎯 EvaluationEngine: Starting data fetch for', { eventId, userId: user.id, evaluatorPosition: user.evaluatorPosition });

      // Dohvati sve potrebne podatke paralelno
      const [productTypes, completedEvaluations] = await Promise.all([
        getProductTypes(eventId),
        getCompletedEvaluations(eventId, user.id),
      ]);

      console.log('🎯 EvaluationEngine: Fetched data', { 
        productTypesCount: productTypes?.length || 0, 
        completedCount: completedEvaluations?.length || 0 
      });

      if (!productTypes || productTypes.length === 0) {
        throw new Error("Nema definiranih proizvoda za ovaj događaj.");
      }

      const completedSampleIds = new Set(completedEvaluations.map(e => e.sampleId));
      const evaluationTasks: EvaluationTask[] = [];

      // Sortiraj tipove proizvoda po definiranom redoslijedu
      productTypes.sort((a, b) => a.displayOrder - b.displayOrder);

      for (const pt of productTypes) {
        console.log('🎯 EvaluationEngine: Processing product type', pt.productName);
        
        const randomization = await getRandomization(pt.id);
        if (!randomization?.randomization_table) {
          console.warn(`Nedostaje randomizacija za proizvod: ${pt.productName}`);
          continue;
        }

        const evaluatorAssignment = randomization.randomization_table.evaluators?.find(
          (e: any) => e.evaluatorPosition === user.evaluatorPosition
        );

        if (!evaluatorAssignment?.sampleOrder) {
          console.warn(`Nema dodjele za evaluatora ${user.evaluatorPosition} u proizvodu ${pt.productName}`);
          continue;
        }

        const jarAttributes = await getJARAttributes(pt.id);

        for (const sampleOrder of evaluatorAssignment.sampleOrder) {
          const sampleDetails = pt.samples.find(s => s.id === sampleOrder.sampleId);
          if (sampleDetails && !completedSampleIds.has(sampleDetails.id)) {
            evaluationTasks.push({
              sample: { ...sampleDetails, blindCode: sampleOrder.blindCode },
              productType: pt,
              jarAttributes: jarAttributes,
            });
            console.log('🎯 EvaluationEngine: Added task', { 
              sampleId: sampleDetails.id, 
              blindCode: sampleOrder.blindCode,
              productType: pt.productName 
            });
          }
        }
      }

      console.log('🎯 EvaluationEngine: Created', evaluationTasks.length, 'evaluation tasks');
      return { tasks: evaluationTasks, allProductTypes: productTypes };
    },
    enabled: !!eventId && !!user?.id,
    staleTime: Infinity, // Podatke dohvaćamo samo jednom
    refetchOnWindowFocus: false,
  });

  // 2. Inicijalizacija stanja nakon dohvaćanja podataka
  useEffect(() => {
    if (data) {
      console.log('🎯 EvaluationEngine: Setting tasks and resetting index');
      setTasks(data.tasks);
      setCurrentIndex(0);
    }
  }, [data]);

  // 3. Logika za predaju ocjene
  const submitEvaluation = useCallback(async (formData: { hedonic: HedonicScale; jar: JARRating }) => {
    const currentTask = tasks[currentIndex];
    if (!currentTask || !user) return;

    console.log('🎯 EvaluationEngine: Submitting evaluation for', currentTask.sample.id);
    setIsSubmitting(true);

    try {
      const submissionData: EvaluationSubmission = {
        userId: user.id,
        eventId: eventId,
        sampleId: currentTask.sample.id,
        productTypeId: currentTask.productType.id,
        hedonicRatings: formData.hedonic,
        jarRatings: formData.jar,
      };

      await submitEvaluationAPI(submissionData); // Pozivamo API za spremanje
      console.log('🎯 EvaluationEngine: Evaluation submitted successfully');

      // Provjeri treba li prikazati otkrivanje uzoraka
      const nextTask = tasks[currentIndex + 1];
      if (!nextTask || nextTask.productType.id !== currentTask.productType.id) {
        console.log('🎯 EvaluationEngine: Showing sample reveal');
        setSamplesForReveal({ 
          productName: currentTask.productType.productName,
          samples: currentTask.productType.samples 
        });
        setShowSampleReveal(true);
      } else {
        console.log('🎯 EvaluationEngine: Moving to next task');
        setCurrentIndex(prev => prev + 1);
      }
    } catch (error) {
      console.error('🚨 EvaluationEngine: Submission failed', error);
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  }, [currentIndex, tasks, user, eventId]);

  // 4. Nastavak nakon otkrivanja uzoraka
  const continueAfterReveal = useCallback(() => {
    console.log('🎯 EvaluationEngine: Continuing after reveal');
    setShowSampleReveal(false);
    setCurrentIndex(prev => prev + 1);
  }, []);

  const currentTask = tasks[currentIndex];
  const isComplete = !isLoading && !!data && currentIndex >= tasks.length;

  console.log('🎯 EvaluationEngine: Current state', {
    isLoading,
    isError,
    tasksCount: tasks.length,
    currentIndex,
    isComplete,
    showSampleReveal,
    currentTaskId: currentTask?.sample.id,
    isSubmitting
  });

  return {
    isLoading,
    isError,
    error,
    currentTask,
    isComplete,
    showSampleReveal,
    samplesForReveal,
    submitEvaluation,
    continueAfterReveal,
    isSubmitting,
  };
}