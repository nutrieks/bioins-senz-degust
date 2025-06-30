
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useEvaluation } from "@/contexts/EvaluationContext";
import { JARRating } from "@/types";
import { FormData } from "./types";
import { validateEvaluationForm } from "./validation/formValidation";

export function useEvaluationForm(eventId: string) {
  const {
    currentSample,
    currentJARAttributes,
    submitAndLoadNext,
  } = useEvaluation();

  const [formKey, setFormKey] = useState<number>(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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
    if (!currentSample) {
      console.log('No current sample to submit');
      return;
    }

    console.log('=== FORM SUBMISSION ===');
    console.log('Form data:', data);

    const { isValid } = validateEvaluationForm(data, form, currentJARAttributes);
    if (!isValid) {
      console.log('Form validation failed');
      return;
    }

    setIsSubmitting(true);

    try {
      const hedonicRatings = {
        appearance: parseInt(data.hedonic.appearance),
        odor: parseInt(data.hedonic.odor),
        texture: parseInt(data.hedonic.texture),
        flavor: parseInt(data.hedonic.flavor),
        overallLiking: parseInt(data.hedonic.overallLiking),
      };

      const jarRatings: JARRating = {};
      Object.entries(data.jar).forEach(([attrId, value]) => {
        if (value !== undefined && value !== '') {
          jarRatings[attrId] = parseInt(value.toString());
        }
      });

      console.log('Submitting evaluation with ratings:', { hedonicRatings, jarRatings });

      await submitAndLoadNext({
        hedonicRatings,
        jarRatings,
      });

      console.log('Evaluation submitted successfully');

    } catch (error) {
      console.error("Error submitting evaluation:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    formKey,
    isSubmitting,
    scrollRef,
    onSubmit,
  };
}
