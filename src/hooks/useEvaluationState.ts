
import { useState } from "react";
import { Sample, JARAttribute, ProductType } from "@/types";

interface EvaluationState {
  currentSample: Sample | null;
  currentRound: number;
  currentJARAttributes: JARAttribute[];
  isComplete: boolean;
  completedSamples: string[];
  currentProductType: ProductType | null;
  showSampleReveal: boolean;
  remainingProductTypes: ProductType[];
  processedProductTypes: string[];
}

export function useEvaluationState() {
  const [state, setState] = useState<EvaluationState>({
    currentSample: null,
    currentRound: 0,
    currentJARAttributes: [],
    isComplete: false,
    completedSamples: [],
    currentProductType: null,
    showSampleReveal: false,
    remainingProductTypes: [],
    processedProductTypes: [],
  });

  const updateState = (updates: Partial<EvaluationState>) => {
    setState(prev => ({ ...prev, ...updates }));
  };

  const resetState = () => {
    setState({
      currentSample: null,
      currentRound: 0,
      currentJARAttributes: [],
      isComplete: false,
      completedSamples: [],
      currentProductType: null,
      showSampleReveal: false,
      remainingProductTypes: [],
      processedProductTypes: [],
    });
  };

  return {
    state,
    updateState,
    resetState,
  };
}
