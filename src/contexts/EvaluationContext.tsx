
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
  loadNextSample: (eventId: string, productTypeId?: string, forcedCompletedSampleIds?: string[]) => Promise<void>;
  loadNextProductType: (eventId: string) => Promise<boolean>;
  resetEvaluation: () => void;
  setShowSampleReveal: (show: boolean) => void;
  updateCompletedSamples: (sampleIds: string[]) => void;
  isLoading: boolean;
  isFetchingEventData: boolean;
  isFetchingNextSample: boolean;
  isSubmittingEvaluation: boolean;
  loadingMessage: string;
  evaluationError: string | null;
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
  
  // Detailed loading states
  const [isFetchingEventData, setIsFetchingEventData] = useState<boolean>(false);
  const [isFetchingNextSample, setIsFetchingNextSample] = useState<boolean>(false);
  const [isSubmittingEvaluation, setIsSubmittingEvaluation] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>("");
  const [evaluationError, setEvaluationError] = useState<string | null>(null);

  // Combined loading state
  const isLoading = isFetchingEventData || isFetchingNextSample || isSubmittingEvaluation;

  // Cache for event data to avoid repeated fetches
  const [eventDataCache, setEventDataCache] = useState<any>(null);

  // Add function to update completed samples
  const updateCompletedSamples = (sampleIds: string[]) => {
    console.log("Updating completed samples in context:", sampleIds);
    setCompletedSamples(sampleIds);
  };

  // Ensure JAR attributes are loaded correctly when currentSample changes
  useEffect(() => {
    const updateJARAttributes = async () => {
      if (!currentSample || !currentSample.productTypeId) {
        setCurrentJARAttributes([]);
        return;
      }

      console.log('=== UPDATING JAR ATTRIBUTES ===');
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
            setEvaluationError(null);
            return;
          }
        }

        // Fallback to individual fetch if not in cache
        const attributes = await getJARAttributes(currentSample.productTypeId);
        console.log("Fetched JAR attributes:", attributes.length);
        setCurrentJARAttributes(attributes);
        setEvaluationError(null);
      } catch (error) {
        console.error("Error updating JAR attributes:", error);
        setCurrentJARAttributes([]);
        setEvaluationError("Greška pri dohvaćanju JAR atributa");
      } finally {
        setLoadingMessage("");
      }
    };
    
    updateJARAttributes();
  }, [currentSample, eventDataCache]);

  const loadNextSample = async (eventId: string, productTypeId?: string, forcedCompletedSampleIds?: string[]) => {
    if (!user || !user.id) {
      console.log("No user available for loading next sample");
      setEvaluationError("Korisnik nije prijavljen");
      return;
    }

    try {
      console.log("=== CONTEXT LOADING NEXT SAMPLE ===");
      setIsFetchingNextSample(true);
      setEvaluationError(null);
      setLoadingMessage("Dohvaćam podatke o događaju...");

      // Load event data with all related data if not cached
      if (!eventDataCache) {
        setIsFetchingEventData(true);
        const eventData = await getEventWithAllData(eventId);
        if (!eventData) {
          throw new Error("Nije moguće dohvatiti podatke o događaju");
        }
        setEventDataCache(eventData);
        setAllProductTypes(eventData.productTypes);
        setIsFetchingEventData(false);
      }

      setLoadingMessage("Dohvaćam završene ocjene...");
      
      // Use forced completed sample IDs if provided, otherwise fetch fresh data
      const completedSampleIds = forcedCompletedSampleIds ?? await getCompletedEvaluationsOptimized(eventId, user.id);
      console.log("Using completed sample IDs:", completedSampleIds.length);
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
    } catch (error: any) {
      console.error("Error loading next sample:", error);
      setEvaluationError(error.message || "Greška prilikom učitavanja uzorka");
      setLoadingMessage("");
    } finally {
      setIsFetchingNextSample(false);
      setIsFetchingEventData(false);
      setLoadingMessage("");
    }
  };

  const loadNextProductType = async (eventId: string): Promise<boolean> => {
    if (!user || !user.id) {
      setEvaluationError("Korisnik nije prijavljen");
      return false;
    }

    try {
      console.log("=== LOADING NEXT PRODUCT TYPE ===");
      setIsFetchingNextSample(true);
      setEvaluationError(null);
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
    } catch (error: any) {
      console.error("Error loading next product type:", error);
      setEvaluationError(error.message || "Greška prilikom učitavanja sljedećeg tipa proizvoda");
      return false;
    } finally {
      setIsFetchingNextSample(false);
      setLoadingMessage("");
    }
  };

  const resetEvaluation = () => {
    console.log("=== RESETTING EVALUATION ===");
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
    setIsFetchingEventData(false);
    setIsFetchingNextSample(false);
    setIsSubmittingEvaluation(false);
    setLoadingMessage("");
    setEvaluationError(null);
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
        updateCompletedSamples,
        isLoading,
        isFetchingEventData,
        isFetchingNextSample,
        isSubmittingEvaluation,
        loadingMessage,
        evaluationError
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
