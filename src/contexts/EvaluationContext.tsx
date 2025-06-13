
import React, { createContext, useContext, useState, useEffect } from "react";
import { Sample, JARAttribute, ProductType } from "../types";
import { getNextSample, getCompletedEvaluations, getProductTypes, getJARAttributes } from "../services/dataService";
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

  // Ensure JAR attributes are loaded correctly when currentSample or currentProductType changes
  useEffect(() => {
    const updateJARAttributes = async () => {
      console.log('=== UPDATING JAR ATTRIBUTES ===');
      console.log('Current sample:', currentSample?.id);
      console.log('Current product type:', currentProductType?.id);
      
      if (currentSample && currentSample.productTypeId) {
        try {
          console.log('Fetching JAR attributes for product type:', currentSample.productTypeId);
          
          // Use the improved getJARAttributes function that handles fallback to base product type
          const attributes = await getJARAttributes(currentSample.productTypeId);
          console.log("Fetched JAR attributes:", attributes.length, attributes);
          
          if (attributes && attributes.length > 0) {
            setCurrentJARAttributes(attributes);
            console.log("JAR attributes set successfully:", attributes.length);
          } else {
            console.warn("No JAR attributes found for product type:", currentSample.productTypeId);
            setCurrentJARAttributes([]);
          }
        } catch (error) {
          console.error("Error updating JAR attributes:", error);
          setCurrentJARAttributes([]);
        }
      } else {
        console.log("No current sample or product type ID available");
        setCurrentJARAttributes([]);
      }
    };
    
    updateJARAttributes();
  }, [currentSample, currentProductType]);

  const loadNextSample = async (eventId: string, productTypeId?: string) => {
    if (!user || !user.id) {
      console.log("No user available for loading next sample");
      return;
    }

    try {
      console.log("=== CONTEXT LOADING NEXT SAMPLE ===");
      console.log("Event ID:", eventId);
      console.log("Product Type ID:", productTypeId);
      console.log("User ID:", user.id);

      // Always refresh completed evaluations from database first
      console.log("Fetching fresh completed evaluations from database...");
      const completed = await getCompletedEvaluations(eventId, user.id);
      const completedSampleIds = completed.map(e => e.sampleId);
      console.log("Fresh completed sample IDs:", completedSampleIds);
      setCompletedSamples(completedSampleIds);

      // Get next sample with refreshed completion data - now expecting correct structure
      console.log("Getting next sample with fresh completion data...");
      const result = await getNextSample(
        user.id,
        eventId,
        productTypeId,
        completedSampleIds
      );

      console.log("Next sample result:", result);

      // Destructure the correct structure
      const { sample, round, isComplete: complete } = result;

      setCurrentSample(sample);
      setCurrentRound(round);
      
      if (sample) {
        if (allProductTypes.length > 0) {
          const productType = allProductTypes.find(pt => pt.id === sample.productTypeId);
          if (productType) {
            setCurrentProductType(productType);
            console.log("Set current product type:", productType.productName);
          }
        } else if (productTypeId) {
          const types = await getProductTypes(eventId);
          const productType = types.find(pt => pt.id === productTypeId);
          if (productType) {
            setCurrentProductType(productType);
            setAllProductTypes(types);
            console.log("Loaded product types and set current:", productType.productName);
          }
        }
      }

      if (complete && productTypeId) {
        // Current product type is complete, add to processed list
        if (productTypeId && !processedProductTypes.includes(productTypeId)) {
          console.log("Product type completed, adding to processed list:", productTypeId);
          setProcessedProductTypes(prev => [...prev, productTypeId]);
        }
        setIsComplete(false);
        setShowSampleReveal(true);
      } else {
        setIsComplete(complete);
      }
    } catch (error) {
      console.error("Error loading next sample:", error);
    }
  };

  const loadNextProductType = async (eventId: string): Promise<boolean> => {
    if (!user || !user.id) return false;

    try {
      console.log("=== LOADING NEXT PRODUCT TYPE ===");
      
      // Load all product types if not already loaded
      if (allProductTypes.length === 0) {
        const types = await getProductTypes(eventId);
        console.log("Loading all product types:", types);
        setAllProductTypes(types);
        
        // Filter out any types that have already been processed
        const availableTypes = types.filter(pt => !processedProductTypes.includes(pt.id));
        console.log("Available product types:", availableTypes);
        setRemainingProductTypes(availableTypes);
        
        if (availableTypes.length > 0) {
          console.log("Loading first available product type:", availableTypes[0]);
          await loadNextSample(eventId, availableTypes[0].id);
          return true;
        }
      } else {
        // Get product types not yet processed
        const availableTypes = allProductTypes.filter(pt => !processedProductTypes.includes(pt.id));
        console.log("Current product type:", currentProductType?.id);
        console.log("Processed product types:", processedProductTypes);
        console.log("Available product types:", availableTypes);
        
        setRemainingProductTypes(availableTypes);
        
        if (availableTypes.length > 0) {
          console.log("Loading next available product type:", availableTypes[0]);
          await loadNextSample(eventId, availableTypes[0].id);
          return true;
        }
      }
      
      // Only set isComplete to true if there are no more product types
      console.log("No more product types available, evaluation complete");
      setIsComplete(true);
      return false;
    } catch (error) {
      console.error("Error loading next product type:", error);
      return false;
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
        setShowSampleReveal
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
