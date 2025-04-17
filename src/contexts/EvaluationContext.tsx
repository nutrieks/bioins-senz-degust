
import React, { createContext, useContext, useState, useEffect } from "react";
import { Sample, JARAttribute, ProductType } from "../types";
import { getNextSample, getCompletedEvaluations, getProductTypes } from "../services/dataService";
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
  jarAttributes: JARAttribute[];
}> = ({ children, jarAttributes }) => {
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

  // Load completed samples on mount or when user changes
  useEffect(() => {
    if (currentSample && jarAttributes.length > 0) {
      const relevantAttributes = jarAttributes.filter(
        (attr) => attr.productTypeId === currentSample.productTypeId
      );
      setCurrentJARAttributes(relevantAttributes);
    }
  }, [currentSample, jarAttributes]);

  // Funkcija za učitavanje sljedećeg uzorka
  const loadNextSample = async (eventId: string, productTypeId?: string) => {
    if (!user || !user.id) return;

    try {
      // Get list of completed samples
      const completed = await getCompletedEvaluations(user.id, eventId, productTypeId);
      setCompletedSamples(completed);

      // Get next sample
      const { sample, round, isComplete: complete } = await getNextSample(
        user.id,
        eventId,
        productTypeId,
        completed
      );

      setCurrentSample(sample);
      setCurrentRound(round);
      
      // Ako imamo uzorak, ažuriraj JAR atribute i postavi trenutni tip proizvoda
      if (sample) {
        const relevantAttributes = jarAttributes.filter(
          (attr) => attr.productTypeId === sample.productTypeId
        );
        setCurrentJARAttributes(relevantAttributes);

        // Pronađi i postavi trenutni tip proizvoda
        if (allProductTypes.length > 0) {
          const productType = allProductTypes.find(pt => pt.id === sample.productTypeId);
          if (productType) {
            setCurrentProductType(productType);
          }
        }
      }

      // Ako su svi uzorci ovog tipa proizvoda ocijenjeni, prikaži otkrivanje
      if (complete && productTypeId) {
        setIsComplete(false); // Ne označavamo kao potpuno završeno, samo ovaj tip proizvoda
        setShowSampleReveal(true);
      } else {
        setIsComplete(complete);
      }
    } catch (error) {
      console.error("Error loading next sample:", error);
    }
  };

  // Funkcija za učitavanje sljedećeg tipa proizvoda za ocjenjivanje
  const loadNextProductType = async (eventId: string): Promise<boolean> => {
    if (!user || !user.id) return false;

    try {
      // Učitaj sve tipove proizvoda za događaj ako još nisu učitani
      if (allProductTypes.length === 0) {
        const types = await getProductTypes(eventId);
        setAllProductTypes(types);
        
        // Filtriraj preostale tipove proizvoda za ocjenjivanje
        const remaining = [...types];
        setRemainingProductTypes(remaining);
        
        if (remaining.length > 0) {
          // Učitaj prvi tip proizvoda
          await loadNextSample(eventId, remaining[0].id);
          return true;
        }
      } else if (remainingProductTypes.length > 0) {
        // Ukloni trenutni tip proizvoda iz preostalih
        const updatedRemaining = remainingProductTypes.filter(
          pt => pt.id !== currentProductType?.id
        );
        setRemainingProductTypes(updatedRemaining);
        
        if (updatedRemaining.length > 0) {
          // Učitaj sljedeći tip proizvoda
          await loadNextSample(eventId, updatedRemaining[0].id);
          return true;
        }
      }
      
      // Nema više tipova proizvoda za ocjenjivanje
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
