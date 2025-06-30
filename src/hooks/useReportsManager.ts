
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { 
  getProductTypes, 
  getEvent,
  generateHedonicReport,
  generateJARReport
} from '@/services/dataService';
import { ProductType, HedonicReport, JARReport } from '@/types';

export function useReportsManager(eventId: string, selectedProductTypeId?: string) {
  const { toast } = useToast();

  // Fetch event data
  const { 
    data: event,
    isLoading: isLoadingEvent 
  } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => getEvent(eventId),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  // Fetch product types
  const { 
    data: productTypes = [],
    isLoading: isLoadingProductTypes 
  } = useQuery({
    queryKey: ['productTypes', eventId],
    queryFn: () => getProductTypes(eventId),
    enabled: !!eventId,
    staleTime: 1000 * 60 * 1, // 1 minute
  });

  // Fetch hedonic report
  const { 
    data: hedonicReport,
    isLoading: isLoadingHedonic 
  } = useQuery({
    queryKey: ['hedonicReport', selectedProductTypeId],
    queryFn: () => generateHedonicReport(selectedProductTypeId!),
    enabled: !!selectedProductTypeId,
    staleTime: 1000 * 30, // 30 seconds - reports change frequently
  });

  // Fetch JAR report
  const { 
    data: jarReport,
    isLoading: isLoadingJAR 
  } = useQuery({
    queryKey: ['jarReport', selectedProductTypeId],
    queryFn: () => generateJARReport(selectedProductTypeId!),
    enabled: !!selectedProductTypeId,
    staleTime: 1000 * 30, // 30 seconds - reports change frequently
  });

  const isLoading = isLoadingEvent || isLoadingProductTypes || isLoadingHedonic || isLoadingJAR;
  const eventDate = event?.date || "";
  const productType = productTypes.find(pt => pt.id === selectedProductTypeId);

  return {
    // Data
    productTypes,
    hedonicReport,
    jarReport,
    eventDate,
    productType,
    
    // Loading state
    isLoading,
  };
}
