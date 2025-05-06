
import React, { createContext, useContext, useState, useEffect } from "react";
import { Sample, JARAttribute, ProductType } from "../types";
import { getNextSample, getCompletedEvaluations, getProductTypes, getJARAttributes, getBaseProductType } from "../services/dataService";
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

  // Ensure JAR attributes are loaded correctly when currentSample changes
  useEffect(() => {
    const updateJARAttributes = async () => {
      if (currentSample && currentSample.productTypeId) {
        try {
          // First try to get the attributes from the product type directly
          const attributes = await getJARAttributes(currentSample.productTypeId);
          console.log("Fetched JAR attributes for product type:", currentSample.productTypeId, attributes);
          
          if (attributes && attributes.length > 0) {
            setCurrentJARAttributes(attributes);
          } else {
            // If no attributes found directly, try to get them from the base product type
            if (currentProductType && currentProductType.baseProductTypeId) {
              const baseProductType = await getBaseProductType(currentProductType.baseProductTypeId);
              if (baseProductType && baseProductType.jarAttributes.length > 0) {
                console.log("Using JAR attributes from base product type:", baseProductType.jarAttributes);
                setCurrentJARAttributes(baseProductType.jarAttributes);
              } else {
                setCurrentJARAttributes([]);
                console.error("No JAR attributes found for product type or base product type");
              }
            } else {
              setCurrentJARAttributes([]);
              console.error("No base product type ID available to fetch JAR attributes");
            }
          }
        } catch (error) {
          console.error("Error updating JAR attributes:", error);
          setCurrentJARAttributes([]);
        }
      }
    };
    
    updateJARAttributes();
  }, [currentSample, currentProductType]);

  const loadNextSample = async (eventId: string, productTypeId?: string) => {
    if (!user || !user.id) return;

    try {
      const completed = await getCompletedEvaluations(user.id, eventId, productTypeId);
      setCompletedSamples(completed);

      const { sample, round, isComplete: complete } = await getNextSample(
        user.id,
        eventId,
        productTypeId,
        completed
      );

      setCurrentSample(sample);
      setCurrentRound(round);
      
      if (sample) {
        if (allProductTypes.length > 0) {
          const productType = allProductTypes.find(pt => pt.id === sample.productTypeId);
          if (productType) {
            setCurrentProductType(productType);
          }
        } else if (productTypeId) {
          const types = await getProductTypes(eventId);
          const productType = types.find(pt => pt.id === productTypeId);
          if (productType) {
            setCurrentProductType(productType);
            setAllProductTypes(types);
          }
        }
      }

      if (complete && productTypeId) {
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
      if (allProductTypes.length === 0) {
        const types = await getProductTypes(eventId);
        console.log("Loading product types:", types);
        setAllProductTypes(types);
        
        const remaining = [...types];
        setRemainingProductTypes(remaining);
        
        if (remaining.length > 0) {
          await loadNextSample(eventId, remaining[0].id);
          return true;
        }
      } else if (remainingProductTypes.length > 0) {
        // Make a copy of remaining product types
        const updatedRemaining = [...remainingProductTypes];
        
        // Remove current product type if it exists
        if (currentProductType) {
          const index = updatedRemaining.findIndex(pt => pt.id === currentProductType.id);
          if (index !== -1) {
            updatedRemaining.splice(index, 1);
          }
        }
        
        console.log("Remaining product types after filter:", updatedRemaining);
        setRemainingProductTypes(updatedRemaining);
        
        if (updatedRemaining.length > 0) {
          console.log("Loading next product type:", updatedRemaining[0]);
          await loadNextSample(eventId, updatedRemaining[0].id);
          return true;
        }
      }
      
      // Only set isComplete to true if there are no more product types
      setIsComplete(true);
      return false;
    } catch (error) {
      console.error("Error loading next product type:", error);
      return false;
    }
  };

  const resetEvaluation = () => {
    setCurrentSample(null);
    setCurrentRound(0);
    setIsComplete(false);
    setCompletedSamples([]);
    setCurrentJARAttributes([]);
    setCurrentProductType(null);
    setShowSampleReveal(false);
    setRemainingProductTypes([]);
    setAllProductTypes([]);
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
