
import { useState } from "react";
import { useReportsManager } from "@/hooks/useReportsManager";

export function useReportsData(eventId: string) {
  const [selectedProductType, setSelectedProductType] = useState<string | null>(null);
  
  // Use React Query hook for all data management
  const {
    productTypes,
    hedonicReport,
    jarReport,
    eventDate,
    productType,
    isLoading,
  } = useReportsManager(eventId, selectedProductType || undefined);

  // Initialize selected product type when product types load
  useState(() => {
    if (productTypes.length > 0 && !selectedProductType) {
      setSelectedProductType(productTypes[0].id);
    }
  });

  const handleProductTypeChange = (value: string) => {
    console.log('=== useReportsData handleProductTypeChange ===');
    console.log('New product type selected:', value);
    setSelectedProductType(value);
  };

  return {
    productTypes,
    selectedProductType,
    hedonicReport,
    jarReport,
    isLoading,
    eventDate,
    handleProductTypeChange,
    productType
  };
}
