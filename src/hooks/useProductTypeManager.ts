
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  getBaseProductType, 
  updateBaseProductType,
  getSamples,
  createSample
} from '@/services/dataService';
import { JARAttribute, RetailerCode } from '@/types';

export function useProductTypeManager(productTypeId?: string) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch product type data
  const { 
    data: productType, 
    isLoading: isLoadingProductType,
    error: productTypeError 
  } = useQuery({
    queryKey: ['baseProductType', productTypeId],
    queryFn: () => getBaseProductType(productTypeId!),
    enabled: !!productTypeId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch samples data
  const { 
    data: samples = [], 
    isLoading: isLoadingSamples,
    refetch: refetchSamples
  } = useQuery({
    queryKey: ['samples', productTypeId],
    queryFn: () => getSamples(productTypeId!),
    enabled: !!productTypeId,
    staleTime: 1000 * 60 * 1, // 1 minute
  });

  // Update product type mutation
  const updateMutation = useMutation({
    mutationFn: (params: {
      productTypeId: string;
      productName: string;
      jarAttributes: JARAttribute[];
    }) => updateBaseProductType(
      params.productTypeId,
      params.productName,
      params.jarAttributes
    ),
    onSuccess: () => {
      toast({
        title: "Uspješno",
        description: "Tip proizvoda je uspješno ažuriran.",
      });
      queryClient.invalidateQueries({ queryKey: ['baseProductType', productTypeId] });
    },
    onError: (error) => {
      console.error("Error updating product type:", error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom ažuriranja tipa proizvoda.",
        variant: "destructive",
      });
    },
  });

  // Create sample mutation
  const createSampleMutation = useMutation({
    mutationFn: (params: {
      productTypeId: string;
      brand: string;
      retailerCode: RetailerCode;
    }) => createSample(
      params.productTypeId,
      params.brand,
      params.retailerCode
    ),
    onSuccess: () => {
      toast({
        title: "Uspješno",
        description: "Uzorak je uspješno dodan.",
      });
      queryClient.invalidateQueries({ queryKey: ['samples', productTypeId] });
    },
    onError: (error) => {
      console.error("Error adding sample:", error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom dodavanja uzorka.",
        variant: "destructive",
      });
    },
  });

  const isLoading = isLoadingProductType || isLoadingSamples;
  const hasError = !!productTypeError;

  return {
    // Data
    productType,
    samples,
    
    // Loading states
    isLoading,
    hasError,
    isUpdating: updateMutation.isPending,
    isCreatingSample: createSampleMutation.isPending,
    
    // Actions
    updateProductType: updateMutation.mutateAsync,
    createSample: createSampleMutation.mutateAsync,
    refetchSamples,
  };
}
