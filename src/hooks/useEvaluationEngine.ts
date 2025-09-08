import { useState, useEffect, useCallback, useRef } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getProductTypes } from '@/services/supabase/productTypes';
import { getCompletedEvaluations, submitEvaluation as submitEvaluationAPI } from '@/services/supabase/evaluations';
import { getRandomization } from '@/services/supabase/randomization/core';
import { getJARAttributes } from '@/services/supabase/jarAttributes';
import { Sample, ProductType, HedonicScale, JARRating, EvaluationSubmission } from '@/types';
import { useToast } from '@/hooks/use-toast';

// Struktura koja predstavlja jedan zadatak (ocjenjivanje jednog uzorka)
interface EvaluationTask {
  sample: Sample;
  productType: ProductType;
  jarAttributes: any[];
}

export function useEvaluationEngine(eventId: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tasks, setTasks] = useState<EvaluationTask[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showSampleReveal, setShowSampleReveal] = useState(false);
  const [samplesForReveal, setSamplesForReveal] = useState<{productName: string, samples: Sample[]}>({ productName: '', samples: [] });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submissionTracker = useRef(new Set<string>());

  // 1. Centralizirano dohvaćanje SVIH podataka na početku
  const { data, isLoading, isError, error, refetch } = useQuery({
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
    staleTime: 1000 * 30, // Refresh data every 30 seconds to catch updates
    refetchOnWindowFocus: true, // Refresh when window gets focus (user comes back)
  });

  // 2. Inicijalizacija stanja s recovery logikom
  useEffect(() => {
    if (data) {
      console.log('🎯 EvaluationEngine: Setting tasks');
      setTasks(data.tasks);
      
      // Try to recover progress from session storage
      const storedProgress = sessionStorage.getItem('evaluation_progress');
      if (storedProgress) {
        try {
          const progress = JSON.parse(storedProgress);
          if (progress.eventId === eventId && 
              progress.currentIndex < data.tasks.length &&
              Date.now() - progress.timestamp < 1000 * 60 * 30) { // 30 min limit
            console.log('🔄 Recovering progress from session:', progress.currentIndex);
            setCurrentIndex(progress.currentIndex);
            return;
          }
        } catch (e) {
          console.warn('Failed to parse stored progress:', e);
        }
      }
      
      // Default to start
      setCurrentIndex(0);
    }
  }, [data, eventId]);

  // Browser navigation guard
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (tasks.length > 0 && currentIndex < tasks.length) {
        e.preventDefault();
        e.returnValue = 'Sigurni ste da želite izaći? Izgubiti ćete trenutni napredak u ocjenjivanju.';
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && tasks.length > 0) {
        console.log('🔄 Page became visible, refreshing data');
        refetch();
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [tasks.length, currentIndex, refetch]);

  // 3. Enhanced submission logic with duplicate protection
  const submitEvaluation = useCallback(async (formData: { hedonic: HedonicScale; jar: JARRating }) => {
    const currentTask = tasks[currentIndex];
    if (!currentTask || !user) return;

    // Create unique submission ID for duplicate protection
    const submissionId = `${user.id}-${currentTask.sample.id}-${eventId}`;
    
    // Check if submission is already in progress
    if (submissionTracker.current.has(submissionId)) {
      console.log('🚫 Duplicate submission blocked:', submissionId);
      toast({
        title: "Ocjena se već predaje",
        description: "Molimo pričekajte da se završi trenutna predaja.",
        variant: "destructive"
      });
      return;
    }

    console.log('🎯 EvaluationEngine: Submitting evaluation for', currentTask.sample.id);
    setIsSubmitting(true);
    submissionTracker.current.add(submissionId);

    try {
      const submissionData: EvaluationSubmission = {
        userId: user.id,
        eventId: eventId,
        sampleId: currentTask.sample.id,
        productTypeId: currentTask.productType.id,
        hedonicRatings: formData.hedonic,
        jarRatings: formData.jar,
      };

      await submitEvaluationAPI(submissionData);
      console.log('🎯 EvaluationEngine: Evaluation submitted successfully');

      // Refresh evaluation data to get updated completed evaluations
      await queryClient.invalidateQueries({ 
        queryKey: ['evaluationEngine', eventId, user.id] 
      });

      // Store current progress in session storage for recovery
      sessionStorage.setItem('evaluation_progress', JSON.stringify({
        eventId,
        currentIndex: currentIndex + 1,
        timestamp: Date.now()
      }));

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

      // Success toast
      toast({
        title: "Ocjena spremljena",
        description: `Uspješno ste ocijenili uzorak ${currentTask.sample.blindCode}.`
      });

    } catch (error: any) {
      console.error('🚨 EvaluationEngine: Submission failed', error);
      
      // Handle duplicate constraint violation gracefully
      if (error?.message?.includes('unique_user_sample_evaluation') || 
          error?.message?.includes('duplicate key value')) {
        console.log('🚫 Duplicate evaluation detected, refreshing data');
        toast({
          title: "Uzorak već ocijenjen",
          description: "Ovaj uzorak je već ocijenjen. Prebacujem na sljedeći uzorak.",
          variant: "default"
        });
        
        // Refresh data to get current state
        await refetch();
      } else {
        toast({
          title: "Greška pri spremanju",
          description: error?.message || "Molimo pokušajte ponovno.",
          variant: "destructive"
        });
        throw error;
      }
    } finally {
      setIsSubmitting(false);
      submissionTracker.current.delete(submissionId);
    }
  }, [currentIndex, tasks, user, eventId, queryClient, refetch, toast]);

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