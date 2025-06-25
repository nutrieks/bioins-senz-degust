
import { useQuery } from "@tanstack/react-query";
import { getEvent } from "@/services/supabase/events";
import { getProductTypes } from "@/services/supabase/productTypes";
import { getRandomization } from "@/services/supabase/randomization";

export function useEventDetailQueries(eventId: string | undefined) {
  const { data: event, isLoading: isLoadingEvent, isError: eventError, error: eventErrorMessage } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => getEvent(eventId!),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 2,
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  const { data: productTypes = [], isLoading: isLoadingProductTypes, isError: productTypesError, error: productTypesErrorMessage } = useQuery({
    queryKey: ['productTypes', eventId],
    queryFn: async () => {
      const types = await getProductTypes(eventId!);
      const updatedProductTypes = await Promise.all(
        types.map(async (pt) => {
          const randomizationData = await getRandomization(pt.id);
          return {
            ...pt,
            hasRandomization: !!randomizationData
          };
        })
      );
      return updatedProductTypes;
    },
    enabled: !!eventId,
    staleTime: 1000 * 60 * 1,
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
