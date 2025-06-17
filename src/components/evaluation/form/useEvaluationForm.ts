
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useEvaluation } from "@/contexts/EvaluationContext";
import { JARAttribute, Sample, HedonicScale, JARRating } from "@/types";
import { FormData } from "./types";
import { validateEvaluationForm } from "./validation/formValidation";
import { submitEvaluation as submitEvaluationAPI, getCompletedEvaluations } from "@/services/dataService";

export function useEvaluationForm(
  currentSample: Sample | null, 
  loadNextSample: (eventId: string, productTypeId?: string) => Promise<void>,
  eventId: string,
  productTypeId?: string,
  currentJARAttributes?: JARAttribute[]
) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { updateCompletedSamples } = useEvaluation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formKey, setFormKey] = useState<number>(Date.now());
  const scrollRef = useRef<HTMLDivElement>(null);
  
  // Inicijalizacija obrasca kroz react-hook-form
  const form = useForm<FormData>({
    defaultValues: {
      hedonic: {
        appearance: "",
        odor: "",
        texture: "",
        flavor: "",
        overallLiking: ""
      },
      jar: {}
    },
    mode: "onSubmit"
  });
  
  // Reset form when current sample changes with enhanced debugging
  useEffect(() => {
    console.log('=== FORM RESET TRIGGERED ===');
    console.log('Current sample:', currentSample?.id, currentSample?.blindCode);
    
    form.reset({
      hedonic: {
        appearance: "",
        odor: "",
        texture: "",
        flavor: "",
        overallLiking: ""
      },
      jar: {}
    });
    
    // Update the form key to force re-rendering of radio inputs
    setFormKey(Date.now());
    
    // Scroll to top when sample changes
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
    
    console.log('Form reset completed for sample:', currentSample?.blindCode);
  }, [currentSample, form]);

  // Complete onSubmit function with proper state management
  const onSubmit = async (data: FormData) => {
    if (!user || !currentSample) return;

    const { isValid, errorFields } = validateEvaluationForm(data, form, currentJARAttributes);
    if (!isValid) {
      toast({
        title: "Nepotpuna ocjena",
        description: `Molimo ispunite sva polja. Nedostaju: ${errorFields}`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const hedonicRatings: HedonicScale = {
        appearance: parseInt(data.hedonic.appearance),
        odor: parseInt(data.hedonic.odor),
        texture: parseInt(data.hedonic.texture),
        flavor: parseInt(data.hedonic.flavor),
        overallLiking: parseInt(data.hedonic.overallLiking)
      };
  
      const jarRatings: JARRating = {};
      Object.entries(data.jar).forEach(([attrId, value]) => {
        if (value !== undefined && value !== '') jarRatings[attrId] = parseInt(value.toString());
      });
  
      await submitEvaluationAPI({
        userId: user.id,
        sampleId: currentSample.id,
        productTypeId: currentSample.productTypeId,
        eventId,
        hedonicRatings,
        jarRatings
      });

      toast({
        title: "Ocjena spremljena",
        description: `Uspješno ste ocijenili uzorak ${currentSample.blindCode}.`,
      });

      // CRITICAL FIX: Update central state with new list of completed samples
      const refreshedEvaluations = await getCompletedEvaluations(eventId, user.id);
      const completedIds = refreshedEvaluations.map(e => e.sampleId);
      updateCompletedSamples(completedIds);

      form.reset({ hedonic: { appearance: "", odor: "", texture: "", flavor: "", overallLiking: "" }, jar: {} });
      setFormKey(Date.now());

      // Load next sample immediately after updating state
      await loadNextSample(eventId, currentSample.productTypeId);

      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth' });
      }

    } catch (error) {
      console.error("Greška kod predaje ocjene:", error);
      toast({
        title: "Greška",
        description: "Problem kod spremanja ocjene. Pokušajte ponovno.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    formKey,
    isSubmitting,
    scrollRef,
    onSubmit
  };
}
