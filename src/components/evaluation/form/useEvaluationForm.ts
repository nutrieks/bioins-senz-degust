
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { JARAttribute, Sample } from "@/types";
import { FormData } from "./types";
import { validateEvaluationForm } from "./validation/formValidation";
import { handleEvaluationSubmit } from "./submission/submitEvaluation";

export function useEvaluationForm(
  currentSample: Sample | null, 
  loadNextSample: (eventId: string, productTypeId?: string) => Promise<void>,
  eventId: string,
  productTypeId?: string,
  currentJARAttributes?: JARAttribute[]
) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formKey, setFormKey] = useState<number>(Date.now()); // Key to force form reset
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
  
  // Reset form when current sample changes
  useEffect(() => {
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
  }, [currentSample, form]);

  const onSubmit = async (data: FormData) => {
    if (!user || !currentSample) return;
    
    // Validate the form
    const { isValid, errorFields } = validateEvaluationForm(data, form, currentJARAttributes);
    
    if (!isValid) {
      toast({
        title: "Nepotpuna ocjena",
        description: `Molimo ispunite sva polja. Nedostaju: ${errorFields}`,
        variant: "destructive",
      });
      return;
    }
    
    // Submit the form
    await handleEvaluationSubmit(
      data,
      form,
      user.id,
      currentSample,
      eventId,
      { toast },
      setIsSubmitting,
      loadNextSample,
      setFormKey,
      scrollRef
    );
  };

  return {
    form,
    formKey,
    isSubmitting,
    scrollRef,
    onSubmit
  };
}
