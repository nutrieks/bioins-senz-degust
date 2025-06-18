
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useEvaluation } from "@/contexts/EvaluationContext";
import { JARAttribute, Sample, HedonicScale, JARRating } from "@/types";
import { FormData } from "./types";
import { validateEvaluationForm } from "./validation/formValidation";
import { submitEvaluation as submitEvaluationAPI } from "@/services/dataService";

export function useEvaluationForm(
  eventId: string
) {
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    currentSample,
    currentJARAttributes,
    loadNextSample,
    completedSamples, // Get current list of completed samples
    currentProductType,
  } = useEvaluation();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formKey, setFormKey] = useState<number>(Date.now());
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
    if (!user || !currentSample) {
      toast({ title: "Greška", description: "Korisnik ili uzorak nisu dostupni.", variant: "destructive" });
      return;
    }

    const { isValid, errorFields } = validateEvaluationForm(data, form, currentJARAttributes);
    if (!isValid) {
      toast({ title: "Nepotpuna ocjena", description: `Molimo ispunite sva polja. Nedostaju: ${errorFields}`, variant: "destructive" });
      return;
    }

    setIsSubmitting(true);

    try {
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

      // 1. Save evaluation to database
      await submitEvaluationAPI({
        userId: user.id,
        sampleId: currentSample.id,
        productTypeId: currentSample.productTypeId,
        eventId,
        hedonicRatings,
        jarRatings,
      });

      toast({
        title: "Ocjena spremljena",
        description: `Uspješno ste ocijenili uzorak ${currentSample.blindCode}.`,
      });

      // 2. **OPTIMISTIC UPDATE**: Update local state IMMEDIATELY
      const newCompletedIds = [...completedSamples, currentSample.id];

      // 3. Load next sample WITH UPDATED DATA
      await loadNextSample(eventId, currentProductType?.id, newCompletedIds);

    } catch (error) {
      console.error("Greška kod predaje ocjene:", error);
      toast({ title: "Greška", description: "Problem kod spremanja ocjene. Pokušajte ponovno.", variant: "destructive" });
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
