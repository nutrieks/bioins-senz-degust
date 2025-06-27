
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  getCompletedEvaluations,
  submitEvaluation as submitEvaluationAPI,
  getEvaluationsStatus
} from '@/services/dataService';
import { EvaluationSubmission } from '@/types';

export function useCompletedEvaluations(eventId: string, userId?: string) {
  return useQuery({
    queryKey: ['evaluations', eventId, userId],
    queryFn: () => getCompletedEvaluations(eventId, userId),
    enabled: !!eventId,
    staleTime: 1000 * 30, // 30 seconds - evaluations change frequently
  });
}

export function useEvaluationsStatus(eventId: string) {
  return useQuery({
    queryKey: ['evaluationsStatus', eventId],
    queryFn: () => getEvaluationsStatus(eventId),
    enabled: !!eventId,
    staleTime: 1000 * 60, // 1 minute
    refetchInterval: 1000 * 30, // Auto-refresh every 30 seconds
  });
}

export function useSubmitEvaluation() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (evaluation: EvaluationSubmission) => submitEvaluationAPI(evaluation),
    onSuccess: (success, evaluation) => {
      if (success) {
        toast({
          title: "Ocjena spremljena",
          description: "Uspješno ste ocijenili uzorak.",
        });
        // Invalidate relevant queries
        queryClient.invalidateQueries({ 
          queryKey: ['evaluations', evaluation.eventId, evaluation.userId] 
        });
        queryClient.invalidateQueries({ 
          queryKey: ['evaluationsStatus', evaluation.eventId] 
        });
      }
    },
    onError: (error) => {
      console.error("Error submitting evaluation:", error);
      toast({
        title: "Greška",
        description: "Problem kod spremanja ocjene. Pokušajte ponovno.",
        variant: "destructive",
      });
    },
  });
}
