
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getEvent } from "@/services/events";
import { centralizedEventService } from "@/services/centralizedEventService";
import { getProductTypes } from "@/services/supabase/productTypes";
import { getRandomization } from "@/services/supabase/randomization";

export function useEventDetailQueries(eventId: string | undefined) {
  const queryClient = useQueryClient();

  // Ensure centralized service has access to query client
  if (eventId) {
    centralizedEventService.setQueryClient(queryClient);
  }

  const { data: event, isLoading: isLoadingEvent, isError: eventError, error: eventErrorMessage } = useQuery({
    queryKey: ['event', eventId],
    queryFn: async () => {
      console.log('[useEventDetailQueries] Fetching event with ID:', eventId);
      console.log('[useEventDetailQueries] EventId type:', typeof eventId);
      const result = await getEvent(eventId!);
      console.log('[useEventDetailQueries] Event result:', result);
      return result;
    },
    enabled: !!eventId,
    staleTime: 1000 * 60 * 2,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const { data: productTypes = [], isLoading: isLoadingProductTypes, isError: productTypesError, error: productTypesErrorMessage } = useQuery({
    queryKey: ['productTypes', eventId],
    queryFn: async () => {
      console.log('[useEventDetailQueries] Fetching product types for eventId:', eventId);
      console.log('[useEventDetailQueries] EventId type:', typeof eventId);
      
      const types = await getProductTypes(eventId!);
      console.log('[useEventDetailQueries] Product types received:', types);
      
      if (!types || types.length === 0) {
        console.warn('[useEventDetailQueries] No product types found, returning empty array');
        return [];
      }
      
      const updatedProductTypes = await Promise.all(
        types.map(async (pt) => {
          try {
            const randomizationData = await getRandomization(pt.id);
            return {
              ...pt,
              hasRandomization: !!randomizationData
            };
          } catch (error) {
            console.error('Error checking randomization for product type:', pt.id, error);
            return {
              ...pt,
              hasRandomization: false
            };
          }
        })
      );
      
      console.log('[useEventDetailQueries] Final product types with randomization:', updatedProductTypes);
      return updatedProductTypes;
    },
    enabled: !!eventId,
    staleTime: 1000 * 60 * 1,
    retry: 2,
    retryDelay: 1000,
  });

  const isLoading = isLoadingEvent || isLoadingProductTypes;
  const hasError = eventError || productTypesError;

  return {
    event,
    productTypes,
    isLoading,
    hasError,
    eventError,
    productTypesError,
    eventErrorMessage,
    productTypesErrorMessage,
  };
}
