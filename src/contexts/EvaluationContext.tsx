import React, { createContext, useContext, useState, useEffect } from "react";
import { Sample, JARAttribute, ProductType } from "../types";
import { getNextSample, getJARAttributes } from "../services/dataService";
import { getEventWithAllData, getCompletedEvaluationsOptimized } from "../services/optimizedDataService";
import { useAuth } from "./AuthContext";

interface EvaluationContextType {
  currentSample: Sample | null;
  currentRound: number;
  currentJARAttributes: JARAttribute[];
  isComplete: boolean;
  completedSamples: string[];
  currentProductType: ProductType | null;
  showSampleReveal: boolean;
  remainingProductTypes: ProductType[];
  loadNextSample: (eventId: string, productTypeId?: string) => Promise<void>;
  loadNextProductType: (eventId: string) => Promise<boolean>;
  resetEvaluation: () => void;
  setShowSampleReveal: (show: boolean) => void;
  isLoading: boolean;
  loadingMessage: string;
}

const EvaluationContext = createContext<EvaluationContextType | undefined>(undefined);

export const EvaluationProvider: React.FC<{
  children: React.ReactNode;
  jarAttributes?: JARAttribute[];
}> = ({ children, jarAttributes = [] }) => {
  const { user } = useAuth();
  const [currentSample, setCurrentSample] = useState<Sample | null>(null);
  const [currentRound, setCurrentRound] = useState<number>(0);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [completedSamples, setCompletedSamples] = useState<string[]>([]);
  const [currentJARAttributes, setCurrentJARAttributes] = useState<JARAttribute[]>([]);
  const [currentProductType, setCurrentProductType] = useState<ProductType | null>(null);
  const [showSampleReveal, setShowSampleReveal] = useState<boolean>(false);
  const [remainingProductTypes, setRemainingProductTypes] = useState<ProductType[]>([]);
  const [allProductTypes, setAllProductTypes] = useState<ProductType[]>([]);
  const [processedProductTypes, setProcessedProductTypes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");

  // Cache for event data to avoid repeated fetches
  const [eventDataCache, setEventDataCache] = useState<any>(null);

  // Ensure JAR attributes are loaded correctly when currentSample changes
  useEffect(() => {
    const updateJARAttributes = async () => {
      if (!currentSample || !currentSample.productTypeId) {
        setCurrentJARAttributes([]);
        return;
      }

      console.log('=== OPTIMIZED: UPDATING JAR ATTRIBUTES ===');
      setLoadingMessage("Učitavam JAR atribute...");
      
      try {
        // First check if we have cached JAR attributes from eventDataCache
        if (eventDataCache?.jarAttributes) {
          const cachedAttributes = eventDataCache.jarAttributes.filter(
            (attr: JARAttribute) => attr.productTypeId === currentSample.productTypeId
          );
          
          if (cachedAttributes.length > 0) {
            console.log("Using cached JAR attributes:", cachedAttributes.length);
            setCurrentJARAttributes(cachedAttributes);
            return;
          }
        }

        // Fallback to individual fetch if not in cache
        const attributes = await getJARAttributes(currentSample.productTypeId);
        console.log("Fetched JAR attributes:", attributes.length);
        setCurrentJARAttributes(attributes);
      } catch (error) {
        console.error("Error updating JAR attributes:", error);
        setCurrentJARAttributes([]);
      } finally {
        setLoadingMessage("");
      }
    };
    
    updateJARAttributes();
  }, [currentSample, eventDataCache]);

  const loadNextSample = async (eventId: string, productTypeId?: string) => {
    if (!user || !user.id) {
      console.log("No user available for loading next sample");
      return;
    }

    try {
      console.log("=== OPTIMIZED: CONTEXT LOADING NEXT SAMPLE ===");
      setIsLoading(true);
      setLoadingMessage("Dohvaćam podatke o događaju...");

      // Load event data with all related data in parallel if not cached
      if (!eventDataCache) {
        const eventData = await getEventWithAllData(eventId);
        if (!eventData) {
          console.error("Could not load event data");
          setIsLoading(false);
          return;
        }
        setEventDataCache(eventData);
        setAllProductTypes(eventData.productTypes);
      }

      setLoadingMessage("Dohvaćam završene ocjene...");
      
      // Clear cache by getting fresh completed evaluations
      const completedSampleIds = await getCompletedEvaluationsOptimized(eventId, user.id);
      console.log("Fresh completed sample IDs:", completedSampleIds);
      setCompletedSamples(completedSampleIds);

      setLoadingMessage("Tražim sljedeći uzorak...");

      // Get next sample with refreshed completion data
      const result = await getNextSample(
        user.id,
        eventId,
        productTypeId,
        completedSampleIds
      );

      console.log("Next sample result:", result);

      // Handle the result structure properly
      if (result && typeof result === 'object' && 'sample' in result) {
        const { sample, round, isComplete: complete } = result;
        setCurrentSample(sample);
        setCurrentRound(round);
        
        if (sample && allProductTypes.length > 0) {
          const productType = allProductTypes.find(pt => pt.id === sample.productTypeId);
          if (productType) {
            setCurrentProductType(productType);
            console.log("Set current product type:", productType.productName);
          }
        }

        if (complete && productTypeId) {
          if (productTypeId && !processedProductTypes.includes(productTypeId)) {
            console.log("Product type completed, adding to processed list:", productTypeId);
            setProcessedProductTypes(prev => [...prev, productTypeId]);
          }
          setIsComplete(false);
          setShowSampleReveal(true);
        } else {
          setIsComplete(complete);
        }
      } else {
        // Handle direct sample result (backward compatibility)
        if (result) {
          // Check if result has the expected Sample interface properties
          if (typeof result === 'object' && 
              'id' in result && 
              'productTypeId' in result && 
              'brand' in result && 
              'retailerCode' in result && 
              'images' in result) {
            // If result is directly a Sample object, use it
            setCurrentSample(result as Sample);
            setCurrentRound(0);
            setIsComplete(false);
          } else {
            // Result doesn't match expected structure
            console.warn("Received unexpected result structure:", result);
            setCurrentSample(null);
            setCurrentRound(0);
            setIsComplete(true);
          }
        } else {
          setCurrentSample(null);
          setCurrentRound(0);
          setIsComplete(true);
        }
      }
    } catch (error) {
      console.error("Error loading next sample:", error);
      setLoadingMessage("Greška prilikom učitavanja uzorka");
      
      // Reset loading state after error
      setTimeout(() => {
        setIsLoading(false);
        setLoadingMessage("");
      }, 2000);
      
      return;
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const loadNextProductType = async (eventId: string): Promise<boolean> => {
    if (!user || !user.id) return false;

    try {
      console.log("=== OPTIMIZED: LOADING NEXT PRODUCT TYPE ===");
      setIsLoading(true);
      setLoadingMessage("Učitavam sljedeći tip proizvoda...");
      
      // Use cached product types if available
      let productTypes = allProductTypes;
      if (productTypes.length === 0 && eventDataCache) {
        productTypes = eventDataCache.productTypes;
        setAllProductTypes(productTypes);
      }

      if (productTypes.length === 0) {
        console.log("No product types available");
        setIsComplete(true);
        return false;
      }

      // Get product types not yet processed
      const availableTypes = productTypes.filter(pt => !processedProductTypes.includes(pt.id));
      console.log("Available product types:", availableTypes.length);
      
      setRemainingProductTypes(availableTypes);
      
      if (availableTypes.length > 0) {
        console.log("Loading next available product type:", availableTypes[0]);
        await loadNextSample(eventId, availableTypes[0].id);
        return true;
      }
      
      console.log("No more product types available, evaluation complete");
      setIsComplete(true);
      return false;
    } catch (error) {
      console.error("Error loading next product type:", error);
      return false;
    } finally {
      setIsLoading(false);
      setLoadingMessage("");
    }
  };

  const resetEvaluation = () => {
    console.log("=== OPTIMIZED: RESETTING EVALUATION ===");
    setCurrentSample(null);
    setCurrentRound(0);
    setIsComplete(false);
    setCompletedSamples([]);
    setCurrentJARAttributes([]);
    setCurrentProductType(null);
    setShowSampleReveal(false);
    setRemainingProductTypes([]);
    setAllProductTypes([]);
    setProcessedProductTypes([]);
    setEventDataCache(null);
    setIsLoading(false);
    setLoadingMessage("");
  };

  return (
    <EvaluationContext.Provider
      value={{
        currentSample,
        currentRound,
        currentJARAttributes,
        isComplete,
        completedSamples,
        currentProductType,
        showSampleReveal,
        remainingProductTypes,
        loadNextSample,
        loadNextProductType,
        resetEvaluation,
        setShowSampleReveal,
        isLoading,
        loadingMessage
      }}
    >
      {children}
    </EvaluationContext.Provider>
  );
};

export const useEvaluation = () => {
  const context = useContext(EvaluationContext);
  if (context === undefined) {
    throw new Error("useEvaluation must be used within an EvaluationProvider");
  }
  return context;
};
