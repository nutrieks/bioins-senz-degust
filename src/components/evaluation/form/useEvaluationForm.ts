
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useAuth } from "@/contexts/AuthContext";
import { useEvaluation } from "@/contexts/EvaluationContext";
import { JARAttribute, Sample, HedonicScale, JARRating } from "@/types";
import { FormData } from "./types";
import { validateEvaluationForm } from "./validation/formValidation";
import { useSubmitEvaluation } from "@/hooks/useEvaluations";

export function useEvaluationForm(eventId: string) {
  const { user } = useAuth();
  const {
    currentSample,
    currentJARAttributes,
    loadNextSample,
    completedSamples,
    currentProductType,
  } = useEvaluation();

  const [formKey, setFormKey] = useState<number>(Date.now());
  const scrollRef = useRef<HTMLDivElement>(null);
  const submitEvaluationMutation = useSubmitEvaluation();

  const form = useForm<FormData>({
    defaultValues: {
      hedonic: { appearance: "", odor: "", texture: "", flavor: "", overallLiking: "" },
      jar: {},
    },
    mode: "onSubmit",
  });

  useEffect(() => {
    console.log('FORM HOOK: Resetting form for new sample:', currentSample?.blindCode);
    form.reset({
      hedonic: { appearance: "", odor: "", texture: "", flavor: "", overallLiking: "" },
      jar: {},
    });
    setFormKey(Date.now());
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentSample, form]);

  const onSubmit = async (data: FormData) => {
    if (!user || !currentSample) {
      return;
    }

    const { isValid, errorFields } = validateEvaluationForm(data, form, currentJARAttributes);
    if (!isValid) {
      return;
    }

    const hedonicRatings: HedonicScale = {
      appearance: parseInt(data.hedonic.appearance),
      odor: parseInt(data.hedonic.odor),
      texture: parseInt(data.hedonic.texture),
      flavor: parseInt(data.hedonic.flavor),
      overallLiking: parseInt(data.hedonic.overallLiking),
    };

    const jarRatings: JARRating = {};
    Object.entries(data.jar).forEach(([attrId, value]) => {
      if (value !== undefined && value !== '') jarRatings[attrId] = parseInt(value.toString());
    });

    try {
      // Submit evaluation using the mutation
      await submitEvaluationMutation.mutateAsync({
        userId: user.id,
        sampleId: currentSample.id,
        productTypeId: currentSample.productTypeId,
        eventId,
        hedonicRatings,
        jarRatings,
      });

      // Optimistic update: Update local state IMMEDIATELY
      const newCompletedIds = [...completedSamples, currentSample.id];

      // Load next sample WITH UPDATED DATA
      await loadNextSample(eventId, currentProductType?.id, newCompletedIds);

    } catch (error) {
      console.error("Greška kod predaje ocjene:", error);
      // Error handling is done in the mutation
    }
  };

  return {
    form,
    formKey,
    isSubmitting: submitEvaluationMutation.isPending,
    scrollRef,
    onSubmit,
  };
}
