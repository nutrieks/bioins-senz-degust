import { useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

/**
 * Centralized evaluation state management hook
 * Handles completion detection, route guards, and anti-duplicate protection
 */
export function useEvaluationState(eventId?: string) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Local state for UI transitions
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [submissionUuids] = useState(new Set<string>());
  
  // Get total samples count in event with retry logic
  const { data: totalSamplesCount = 0, isLoading: isLoadingTotal } = useQuery({
    queryKey: ['totalSamples', eventId],
    queryFn: async () => {
      if (!eventId) return 0;
      
      let retries = 3;
      while (retries > 0) {
        try {
          const { data: productTypesWithSamples, error } = await supabase
            .from('product_types')
            .select(`
              id,
              samples (id)
            `)
            .eq('event_id', eventId);
          
          if (error) throw error;
          
          const total = productTypesWithSamples?.reduce((sum, pt) => {
            return sum + (pt.samples?.length || 0);
          }, 0) || 0;
          
          console.log('Total samples in event:', total);
          return total;
        } catch (error) {
          retries--;
          if (retries === 0) {
            console.error('Error fetching total samples after retries:', error);
            return 0;
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      return 0;
    },
    enabled: !!eventId,
    staleTime: 1000 * 60 * 5,
    retry: 3,
  });

  // Get completed evaluations count
  const { data: completedCount = 0, isLoading: isLoadingCompleted } = useQuery({
    queryKey: ['completedEvaluationsCount', eventId, user?.id],
    queryFn: async () => {
      if (!eventId || !user?.id) return 0;
      
      let retries = 3;
      while (retries > 0) {
        try {
          const { count, error } = await supabase
            .from('evaluations')
            .select('*', { count: 'exact', head: true })
            .eq('event_id', eventId)
            .eq('user_id', user.id);
          
          if (error) throw error;
          
          console.log('Completed evaluations count:', count || 0);
          return count || 0;
        } catch (error) {
          retries--;
          if (retries === 0) {
            console.error('Error fetching completed count after retries:', error);
            return 0;
          }
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      return 0;
    },
    enabled: !!eventId && !!user?.id,
    staleTime: 1000 * 60,
    retry: 3,
  });

  // SERVER-SIDE completion check with debounce protection
  const isEvaluationCompleteForUser = useCallback(() => {
    if (!user || !eventId || totalSamplesCount === 0 || isLoadingTotal || isLoadingCompleted) {
      return false;
    }
    
    const isComplete = completedCount >= totalSamplesCount && totalSamplesCount > 0;
    
    console.log('SERVER-SIDE Completion check:', {
      totalSamplesInEvent: totalSamplesCount,
      userCompletedCount: completedCount,
      isComplete,
      isTransitioning
    });
    
    return isComplete;
  }, [user, eventId, totalSamplesCount, completedCount, isLoadingTotal, isLoadingCompleted]);

  // Route guard - prevents entry into completed evaluations
  const canEnterEvaluation = useCallback(() => {
    const canEnter = !isEvaluationCompleteForUser();
    
    if (!canEnter) {
      console.log('🚫 ROUTE GUARD: Blocking entry to completed evaluation');
      toast({
        title: "Ocjenjivanje završeno",
        description: "Već ste završili ocjenjivanje svih uzoraka za ovaj događaj.",
        variant: "default"
      });
    }
    
    return canEnter;
  }, [isEvaluationCompleteForUser, toast]);

  // Anti-duplicate submission protection
  const canSubmitEvaluation = useCallback((sampleId: string) => {
    const submissionId = `${eventId}-${sampleId}-${user?.id}`;
    
    if (submissionUuids.has(submissionId)) {
      console.log('🚫 DUPLICATE PROTECTION: Submission already in progress');
      toast({
        title: "Predaja u tijeku",
        description: "Ocjena se već predaje, molimo pričekajte.",
        variant: "destructive"
      });
      return false;
    }
    
    if (isEvaluationCompleteForUser()) {
      console.log('🚫 COMPLETION PROTECTION: User has completed all evaluations');
      toast({
        title: "Ocjenjivanje završeno",
        description: "Već ste završili sva ocjenjivanja.",
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  }, [eventId, user?.id, submissionUuids, isEvaluationCompleteForUser, toast]);

  // Track submission in progress
  const trackSubmission = useCallback((sampleId: string) => {
    const submissionId = `${eventId}-${sampleId}-${user?.id}`;
    submissionUuids.add(submissionId);
    
    // Auto-cleanup after 30 seconds (failsafe)
    setTimeout(() => {
      submissionUuids.delete(submissionId);
    }, 30000);
    
    return () => submissionUuids.delete(submissionId);
  }, [eventId, user?.id, submissionUuids]);

  // Extended transition management
  const setExtendedTransition = useCallback((duration = 2000) => {
    setIsTransitioning(true);
    setTimeout(() => setIsTransitioning(false), duration);
  }, []);

  // Invalidate completion data
  const invalidateCompletionData = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['totalSamples', eventId] });
    queryClient.invalidateQueries({ queryKey: ['completedEvaluationsCount', eventId, user?.id] });
  }, [queryClient, eventId, user?.id]);

  return {
    // State
    isEvaluationCompleteForUser: isEvaluationCompleteForUser(),
    isTransitioning,
    totalSamplesCount,
    completedCount,
    isLoadingTotal,
    isLoadingCompleted,
    
    // Guards and protections
    canEnterEvaluation,
    canSubmitEvaluation,
    trackSubmission,
    
    // Actions
    setExtendedTransition,
    invalidateCompletionData,
  };
}