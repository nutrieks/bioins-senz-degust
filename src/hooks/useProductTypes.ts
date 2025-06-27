
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  getProductTypes, 
  getAllProductTypes,
  createProductType as createProductTypeAPI,
  deleteProductType as deleteProductTypeAPI
} from '@/services/dataService';

export function useEventProductTypes(eventId: string | undefined) {
  return useQuery({
    queryKey: ['productTypes', eventId],
    queryFn: async () => {
      const types = await getProductTypes(eventId!);
      // Add randomization info
      const updatedProductTypes = await Promise.all(
        types.map(async (pt) => {
          try {
            const { getRandomization } = await import('@/services/supabase/randomization');
            const randomizationData = await getRandomization(pt.id);
            return {
              ...pt,
              hasRandomization: !!randomizationData
            };
          } catch (error) {
            console.error('Error checking randomization:', error);
            return {
              ...pt,
              hasRandomization: false
            };
          }
        })
      );
      return updatedProductTypes;
    },
    enabled: !!eventId,
    staleTime: 1000 * 60 * 1, // 1 minute
  });
}

export function useAllProductTypes() {
  return useQuery({
    queryKey: ['allProductTypes'],
    queryFn: getAllProductTypes,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

export function useCreateProductType() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (params: {
      eventId: string;
      customerCode: string;
      baseProductTypeId: string;
      baseCode: string;
      displayOrder: number;
    }) => createProductTypeAPI(
      params.eventId,
      params.customerCode,
      params.baseProductTypeId,
      params.baseCode,
      params.displayOrder
    ),
    onSuccess: () => {
      toast({
        title: "Uspješno",
        description: "Tip proizvoda je uspješno kreiran.",
      });
      queryClient.invalidateQueries({ queryKey: ['allProductTypes'] });
    },
    onError: (error) => {
      console.error("Error creating product type:", error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom kreiranja tipa proizvoda.",
        variant: "destructive",
      });
    },
  });
}

export function useDeleteProductType() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: (productTypeId: string) => deleteProductTypeAPI(productTypeId),
    onSuccess: () => {
      toast({
        title: "Uspješno",
        description: "Tip proizvoda je uspješno obrisan.",
      });
      queryClient.invalidateQueries({ queryKey: ['allProductTypes'] });
    },
    onError: (error) => {
      console.error("Error deleting product type:", error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom brisanja tipa proizvoda.",
        variant: "destructive",
      });
    },
  });
}
