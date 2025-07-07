
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useEvaluation } from "@/contexts/EvaluationContext";
import { JARRating, HedonicScale } from "@/types";
import { FormData } from "./types";
import { validateEvaluationForm } from "./validation/formValidation";

export function useEvaluationForm() {
  const { toast } = useToast();
  const { submitEvaluation, currentSample, jarAttributes } = useEvaluation();
  const [formKey, setFormKey] = useState<number>(Date.now());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const form = useForm<FormData>({ 
    defaultValues: {
      hedonic: { appearance: "", odor: "", texture: "", flavor: "", overallLiking: "" },
      jar: {},
    },
    mode: "onSubmit" 
  });

  useEffect(() => {
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
    if (!currentSample) return;

    const { isValid, errorFields } = validateEvaluationForm(data, form, jarAttributes);
    if (!isValid) {
      toast({ title: "Nepotpuna ocjena", description: `Molimo ispunite sva polja. Nedostaju: ${errorFields}`, variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      const hedonic: HedonicScale = {
        appearance: parseInt(data.hedonic.appearance),
        odor: parseInt(data.hedonic.odor),
        texture: parseInt(data.hedonic.texture),
        flavor: parseInt(data.hedonic.flavor),
        overallLiking: parseInt(data.hedonic.overallLiking),
      };
      const jar: JARRating = {};
      Object.entries(data.jar).forEach(([attrId, value]) => {
        if (value !== undefined && value !== '') jar[attrId] = parseInt(value.toString());
      });

      await submitEvaluation({ hedonic, jar });

      toast({ title: "Ocjena spremljena", description: `Uspješno ste ocijenili uzorak ${currentSample.blindCode}.` });

    } catch (error) {
      console.error("Greška kod predaje ocjene:", error);
      toast({ title: "Greška", description: "Problem kod spremanja ocjene. Molimo pokušajte ponovno.", variant: "destructive" });
    } finally {
      // GARANTIRANO se izvršava, sprječavajući zamrzavanje ekrana
      setIsSubmitting(false);
    }
  };

  return { form, formKey, isSubmitting, scrollRef, onSubmit };
}
