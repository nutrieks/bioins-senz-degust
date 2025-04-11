
import React, { createContext, useContext, useState, useEffect } from "react";
import { Sample, JARAttribute } from "../types";
import { getNextSample, getCompletedEvaluations } from "../services/dataService";
import { useAuth } from "./AuthContext";

interface EvaluationContextType {
  currentSample: Sample | null;
  currentRound: number;
  currentJARAttributes: JARAttribute[];
  isComplete: boolean;
  completedSamples: string[];
  loadNextSample: (eventId: string, productTypeId?: string) => Promise<void>;
  resetEvaluation: () => void;
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

  // Load completed samples on mount or when user changes
  useEffect(() => {
    if (currentSample && jarAttributes.length > 0) {
      const relevantAttributes = jarAttributes.filter(
        (attr) => attr.productTypeId === currentSample.productTypeId
      );
      setCurrentJARAttributes(relevantAttributes);
    }
  }, [currentSample, jarAttributes]);

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
      setIsComplete(complete);

      // Update JAR attributes if we have a sample
      if (sample) {
        const relevantAttributes = jarAttributes.filter(
          (attr) => attr.productTypeId === sample.productTypeId
        );
        setCurrentJARAttributes(relevantAttributes);
      }
    } catch (error) {
      console.error("Error loading next sample:", error);
    }
  };

  const resetEvaluation = () => {
    setCurrentSample(null);
    setCurrentRound(0);
    setIsComplete(false);
    setCompletedSamples([]);
    setCurrentJARAttributes([]);
  };

  return (
    <EvaluationContext.Provider
      value={{
        currentSample,
        currentRound,
        currentJARAttributes,
        isComplete,
        completedSamples,
        loadNextSample,
        resetEvaluation,
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
