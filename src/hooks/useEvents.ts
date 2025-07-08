
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  getEvents, 
  getEvent, 
  createEvent as createEventAPI,
  updateEventStatus as updateEventStatusAPI,
  deleteEvent as deleteEventAPI 
} from '@/services/events';
import { centralizedEventService } from '@/services/centralizedEventService';
import { Event, EventStatus } from '@/types';

export function useEvents() {
  return useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useEventDetails(eventId: string | undefined) {
  return useQuery({
    queryKey: ['event', eventId],
    queryFn: () => getEvent(eventId!),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Ensure centralized service has access to query client
  centralizedEventService.setQueryClient(queryClient);

  return useMutation({
    mutationFn: (date: string) => createEventAPI(date),
    onSuccess: (newEvent) => {
      console.log('useCreateEvent: Event created successfully:', newEvent);
      
      toast({
        title: "Uspješno",
        description: "Događaj je uspješno kreiran.",
      });
      
      // The centralized service already handles cache updates
      console.log('useCreateEvent: Cache updates handled by centralized service');
    },
    onError: (error) => {
      console.error("Error creating event:", error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom kreiranja događaja.",
        variant: "destructive",
      });
    },
  });
}

export function useUpdateEventStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: ({ eventId, status }: { eventId: string; status: EventStatus }) => 
      updateEventStatusAPI(eventId, status),
    onSuccess: (success, { eventId, status }) => {
      if (success) {
        toast({
          title: "Uspjeh",
          description: `Status događaja promijenjen.`,
        });
        // Invalidate related queries
        queryClient.invalidateQueries({ queryKey: ['event', eventId] });
        queryClient.invalidateQueries({ queryKey: ['events'] });
      } else {
        throw new Error("Failed to update event status");
      }
    },
    onError: (error) => {
      console.error("Error updating event status:", error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom ažuriranja statusa.",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (eventId: string) => deleteEventAPI(eventId),
    onSuccess: (success, eventId) => {
      if (success) {
        toast({
          title: "Uspjeh",
          description: "Događaj je uspješno obrisan.",
        });
        // Remove from cache and invalidate list
        queryClient.removeQueries({ queryKey: ['event', eventId] });
        queryClient.invalidateQueries({ queryKey: ['events'] });
      } else {
        throw new Error("Failed to delete event");
      }
    },
    onError: (error) => {
      console.error("Error deleting event:", error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom brisanja događaja.",
        variant: "destructive",
      });
    },
  });
}
