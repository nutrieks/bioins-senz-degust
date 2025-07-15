import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { Sample, JARAttribute, ProductType, Evaluation } from "../types";
import { getProductTypes, getCompletedEvaluations, getJARAttributes, submitEvaluation as submitEvaluationAPI } from "../services/dataService";
import { getNextSample } from "../services/supabase/randomization";
import { useAuth } from "./AuthContext";
import { useToast } from "@/hooks/use-toast";

// Definicija onoga što kontekst pruža
interface EvaluationContextType {
  isLoading: boolean;
  currentSample: Sample | null;
  currentProductType: ProductType | null;
  jarAttributes: JARAttribute[];
  isEvaluationFinished: boolean;
  showSampleReveal: boolean;
  samplesForReveal: Sample[];
  startEvaluation: (eventId: string) => Promise<void>;
  submitEvaluation: (evaluationData: Omit<Evaluation, 'id' | 'userId' | 'sampleId' | 'productTypeId' | 'eventId' | 'timestamp'>) => Promise<void>;
  loadNextTask: () => Promise<void>;
}

const EvaluationContext = createContext<EvaluationContextType | undefined>(undefined);

export const EvaluationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [eventId, setEventId] = useState<string | null>(null);
  const [allProductTypes, setAllProductTypes] = useState<ProductType[]>([]);
  const [completedSampleIds, setCompletedSampleIds] = useState<string[]>([]);

  const [currentSample, setCurrentSample] = useState<Sample | null>(null);
  const [currentProductType, setCurrentProductType] = useState<ProductType | null>(null);
  const [jarAttributes, setJarAttributes] = useState<JARAttribute[]>([]);

  const [showSampleReveal, setShowSampleReveal] = useState(false);
  const [samplesForReveal, setSamplesForReveal] = useState<Sample[]>([]);
  const [isEvaluationFinished, setIsEvaluationFinished] = useState(false);

  const findNextTask = useCallback(async () => {
    if (!user || !eventId) return null;
    const result = await getNextSample(user.id, eventId, undefined, completedSampleIds);
    return result.sample;
  }, [user, eventId, completedSampleIds]);

  const startEvaluation = useCallback(async (id: string) => {
    setEventId(id);
    setIsLoading(true);
    if (!user) {
      setIsLoading(false);
      return;
    }
    try {
      const productTypes = await getProductTypes(id);
      const evals = await getCompletedEvaluations(id, user.id);
      const completedIds = evals.map(e => e.sampleId);
      setAllProductTypes(productTypes);
      setCompletedSampleIds(completedIds);

      const result = await getNextSample(user.id, id, undefined, completedIds);
      const nextSample = result.sample;

      if (nextSample && !result.isComplete) {
        const nextPt = productTypes.find(pt => pt.id === nextSample.productTypeId);
        setCurrentSample(nextSample);
        setCurrentProductType(nextPt || null);
        if (nextPt) {
          setJarAttributes(await getJARAttributes(nextPt.id));
        }
        setIsEvaluationFinished(false);
      } else {
        setIsEvaluationFinished(true);
      }
    } catch (error) {
      console.error("Failed to start evaluation:", error);
      toast({ title: "Greška", description: "Nije moguće pokrenuti evaluaciju.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [user, toast]);

  const loadNextTask = useCallback(async () => {
    setIsLoading(true);
    setShowSampleReveal(false);

    const nextSample = await findNextTask();

    if (nextSample) {
      const nextPt = allProductTypes.find(pt => pt.id === nextSample.productTypeId);
      setCurrentSample(nextSample);
      if (currentProductType?.id !== nextPt?.id) {
        setCurrentProductType(nextPt || null);
        if (nextPt) {
          setJarAttributes(await getJARAttributes(nextPt.id));
        }
      }
      setIsEvaluationFinished(false);
    } else {
      setIsEvaluationFinished(true);
    }
    setIsLoading(false);
  }, [findNextTask, allProductTypes, currentProductType]);

  const submitEvaluation = useCallback(async (evaluationData: Omit<Evaluation, "id" | "userId" | "sampleId" | "productTypeId" | "eventId" | "timestamp">) => {
    if (!user || !currentSample || !eventId || !currentProductType) {
      throw new Error("Nedostaju podaci za predaju ocjene.");
    }

    // Submit evaluation through API
    await submitEvaluationAPI({
      userId: user.id,
      sampleId: currentSample.id,
      productTypeId: currentProductType.id,
      eventId: eventId,
      hedonicRatings: evaluationData.hedonic,
      jarRatings: evaluationData.jar,
    });

    // Nakon uspješne predaje, optimistično ažuriraj stanje
    setCompletedSampleIds(prev => [...prev, currentSample.id]);

    // Provjeri je li trenutni tip proizvoda gotov
    const newCompleted = [...completedSampleIds, currentSample.id];
    
    // Za sada, jednostavno učitaj sljedeći zadatak
    // Kompleksniju logiku za reveal možemo dodati kasnije
    await loadNextTask();
  }, [user, currentSample, eventId, currentProductType, completedSampleIds, loadNextTask]);

  return (
    <EvaluationContext.Provider
      value={{
        isLoading,
        currentSample,
        currentProductType,
        jarAttributes,
        isEvaluationFinished,
        showSampleReveal,
        samplesForReveal,
        startEvaluation,
        submitEvaluation,
        loadNextTask
      }}
    >
      {children}
    </EvaluationContext.Provider>
  );
};

export const useEvaluation = () => {
    const context = useContext(EvaluationContext);
    if (context === undefined) throw new Error("useEvaluation must be used within a EvaluationProvider");
    return context;
};