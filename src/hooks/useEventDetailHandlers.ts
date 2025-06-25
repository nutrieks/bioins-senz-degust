
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { EventStatus, ProductType } from "@/types";
import {
  updateEventStatus,
  deleteEvent as deleteEventAPI,
} from "@/services/supabase/events";
import { createRandomization } from "@/services/supabase/randomization";
import { checkAllRandomizationsGenerated, formatRandomizationErrorMessage } from "@/utils/randomizationUtils";

export function useEventDetailHandlers(eventId: string | undefined) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const updateStatusMutation = useMutation({
    mutationFn: (status: EventStatus) => updateEventStatus(eventId!, status),
    onSuccess: (success, status) => {
      if (success) {
        toast({
          title: "Uspjeh",
          description: `Status događaja promijenjen u ${getStatusLabel(status)}.`,
        });
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
        description: "Došlo je do pogreške prilikom ažuriranja statusa događaja.",
        variant: "destructive",
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: () => deleteEventAPI(eventId!),
    onSuccess: (success) => {
      if (success) {
        toast({
          title: "Uspjeh",
          description: "Događaj je uspješno obrisan.",
        });
        navigate("/admin/events");
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

  const generateRandomizationMutation = useMutation({
    mutationFn: (productTypeId: string) => createRandomization(productTypeId),
    onSuccess: () => {
      toast({
        title: "Uspjeh",
        description: "Randomizacija je uspješno generirana.",
      });
      queryClient.invalidateQueries({ queryKey: ['productTypes', eventId] });
    },
    onError: (error) => {
      console.error('Error generating randomization:', error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom generiranja randomizacije.",
        variant: "destructive",
      });
    },
  });

  const handleUpdateStatus = async (status: EventStatus, productTypes: ProductType[]) => {
    if (!eventId) return;

    if (status === EventStatus.ACTIVE) {
      const { allGenerated, missingProductTypes } = checkAllRandomizationsGenerated(productTypes);
      
      if (!allGenerated) {
        const errorMessage = formatRandomizationErrorMessage(missingProductTypes);
        toast({
          title: "Nemožete aktivirati događaj",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }
    }

    updateStatusMutation.mutate(status);
  };

  const handleDeleteEvent = async (): Promise<void> => {
    if (!eventId) return;
    deleteEventMutation.mutate();
  };

  const handleGenerateRandomization = async (productTypeId: string): Promise<void> => {
    generateRandomizationMutation.mutate(productTypeId);
  };

  const refreshEventData = async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    await queryClient.invalidateQueries({ queryKey: ['productTypes', eventId] });
  };

  const getStatusLabel = (status: EventStatus) => {
    switch (status) {
      case EventStatus.PREPARATION:
        return "Priprema";
      case EventStatus.ACTIVE:
        return "Aktivan";
      case EventStatus.COMPLETED:
        return "Završen";
      case EventStatus.ARCHIVED:
        return "Arhiviran";
      default:
        return "Nepoznat";
    }
  };

  return {
    updateStatusMutation,
    deleteEventMutation,
    generateRandomizationMutation,
    handleUpdateStatus,
    handleDeleteEvent,
    handleGenerateRandomization,
    refreshEventData,
    getStatusLabel,
  };
}
