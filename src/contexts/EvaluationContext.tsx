
import React, { createContext, useContext } from "react";
import { Sample, JARAttribute, ProductType } from "../types";
import { useEvaluationManager } from "@/hooks/useEvaluationManager";

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
  eventId?: string;
}> = ({ children, eventId }) => {
  const evaluationManager = useEvaluationManager(eventId);

  // Map the hook results to the expected interface
  const contextValue: EvaluationContextType = {
    ...evaluationManager,
    // These are now handled by React Query, so they're derived from isLoading
    isFetchingEventData: evaluationManager.isLoading,
    isFetchingNextSample: evaluationManager.isLoading,
    isSubmittingEvaluation: false, // This is handled by the mutation hook
  };

  return (
    <EvaluationContext.Provider value={contextValue}>
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
