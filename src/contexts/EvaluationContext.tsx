
import React, { createContext, useContext, useState, useCallback } from "react";
import { Sample, JARAttribute, ProductType, Evaluation } from "../types";
import { getNextSample, getCompletedEvaluations, getProductTypes, submitEvaluation, getJARAttributes } from "../services/dataService";
import { useAuth } from "./AuthContext";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface EvaluationContextType {
  // Stanja
  isLoading: boolean;
  currentSample: Sample | null;
  currentProductType: ProductType | null;
  jarAttributes: JARAttribute[];
  completedSamplesForReveal: Sample[];
  showSampleReveal: boolean;
  isEvaluationFinished: boolean;

  // Akcije
  startEvaluation: (eventId: string) => Promise<void>;
  submitAndLoadNext: (evaluationData: Omit<Evaluation, "id" | "userId" | "sampleId" | "productTypeId" | "eventId" | "timestamp">) => Promise<void>;
  proceedToNextStep: () => void;
}

const EvaluationContext = createContext<EvaluationContextType | undefined>(undefined);

export const EvaluationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(true);
  const [eventId, setEventId] = useState<string | null>(null);

  const [allProductTypes, setAllProductTypes] = useState<ProductType[]>([]);
  const [completedSampleIds, setCompletedSampleIds] = useState<string[]>([]);

  const [currentProductType, setCurrentProductType] = useState<ProductType | null>(null);
  const [currentSample, setCurrentSample] = useState<Sample | null>(null);
  const [jarAttributes, setJarAttributes] = useState<JARAttribute[]>([]);

  const [showSampleReveal, setShowSampleReveal] = useState(false);
  const [completedSamplesForReveal, setCompletedSamplesForReveal] = useState<Sample[]>([]);
  const [isEvaluationFinished, setIsEvaluationFinished] = useState(false);

  const findNextTask = useCallback(() => {
    for (const pt of allProductTypes) {
        for (const sample of pt.samples) {
            if (!completedSampleIds.includes(sample.id)) {
                return { nextProductType: pt, nextSample: sample };
            }
        }
    }
    return { nextProductType: null, nextSample: null };
  }, [allProductTypes, completedSampleIds]);

  const startEvaluation = useCallback(async (eventIdToStart: string) => {
    setEventId(eventIdToStart);
    setIsLoading(true);
    if (!user) return;

    try {
        const productTypes = await getProductTypes(eventIdToStart);
        const evals = await getCompletedEvaluations(eventIdToStart, user.id);
        const initialCompletedIds = evals.map(e => e.sampleId);

        setAllProductTypes(productTypes);
        setCompletedSampleIds(initialCompletedIds);

        // Odmah pronađi prvi zadatak
        let nextTaskProductType = null;
        let nextTaskSample = null;
        for (const pt of productTypes) {
            const sample = pt.samples.find(s => !initialCompletedIds.includes(s.id));
            if (sample) {
                nextTaskProductType = pt;
                nextTaskSample = sample;
                break;
            }
        }

        if (nextTaskSample && nextTaskProductType) {
            setCurrentSample(nextTaskSample);
            setCurrentProductType(nextTaskProductType);
            const attributes = await getJARAttributes(nextTaskProductType.id);
            setJarAttributes(attributes);
        } else {
            setIsEvaluationFinished(true);
        }
    } catch (error) {
        console.error("Initialization Error:", error);
        toast({ title: "Greška", description: "Nije moguće pokrenuti evaluaciju.", variant: "destructive" });
    } finally {
        setIsLoading(false);
    }
  }, [user, toast]);

  const proceedToNextStep = useCallback(async () => {
    setShowSampleReveal(false);
    setIsLoading(true);

    const { nextProductType, nextSample } = findNextTask();

    if (nextSample && nextProductType) {
        setCurrentSample(nextSample);
        if (currentProductType?.id !== nextProductType.id) {
            setCurrentProductType(nextProductType);
            const attributes = await getJARAttributes(nextProductType.id);
            setJarAttributes(attributes);
        }
    } else {
        setIsEvaluationFinished(true);
    }
    setIsLoading(false);
  }, [findNextTask, currentProductType]);

  const submitMutation = useMutation({
    mutationFn: (data: any) => submitEvaluation(data),
    onSuccess: (data, variables) => {
        // Optimistic update
        setCompletedSampleIds(prev => [...prev, variables.sampleId]);
        queryClient.invalidateQueries({ queryKey: ['evaluationStatus', eventId] });
    },
    onError: (err: Error) => {
        toast({ title: "Greška", description: `Spremanje nije uspjelo: ${err.message}`, variant: "destructive" });
    }
  });

  const submitAndLoadNext = async (evaluationData: Omit<Evaluation, "id" | "userId" | "sampleId" | "productTypeId" | "eventId" | "timestamp">) => {
    if (!user || !currentSample || !eventId) return;

    await submitMutation.mutateAsync({
        ...evaluationData,
        userId: user.id,
        sampleId: currentSample.id,
        productTypeId: currentProductType!.id,
        eventId: eventId,
    });

    // Provjera je li trenutni tip proizvoda gotov
    const isProductTypeFinished = currentProductType?.samples.every(s => [...completedSampleIds, currentSample.id].includes(s.id));

    if (isProductTypeFinished) {
        setCompletedSamplesForReveal(currentProductType!.samples);
        setShowSampleReveal(true);
    } else {
        await proceedToNextStep();
    }
  };

  return (
    <EvaluationContext.Provider
      value={{
        isLoading,
        currentSample,
        currentProductType,
        jarAttributes,
        completedSamplesForReveal,
        showSampleReveal,
        isEvaluationFinished,
        startEvaluation,
        submitAndLoadNext,
        proceedToNextStep,
      }}
    >
      {children}
    </EvaluationContext.Provider>
  );
};

export const useEvaluation = () => {
    const context = useContext(EvaluationContext);
    if (context === undefined) throw new Error("useEvaluation must be used within an EvaluationProvider");
    return context;
};
