
import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { submitEvaluation } from "@/services/dataService";
import { JARAttribute, Sample, HedonicScale, JARRating } from "@/types";

export type FormData = {
  hedonic: {
    appearance: string;
    odor: string;
    texture: string;
    flavor: string;
    overallLiking: string;
  };
  jar: {
    [attributeId: string]: string;
  };
};

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
  
  // Inicijalizacija obrasca kroz react-hook-form s validacijom
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
    
    // Validate all hedonic fields are filled
    const hedonicFields = ["appearance", "odor", "texture", "flavor", "overallLiking"];
    const emptyHedonicFields = hedonicFields.filter(field => !data.hedonic[field as keyof typeof data.hedonic]);
    
    // Validate all JAR fields are filled (if there are any)
    const emptyJarFields: string[] = [];
    if (currentJARAttributes && currentJARAttributes.length > 0) {
      currentJARAttributes.forEach(attr => {
        if (!data.jar[attr.id]) {
          emptyJarFields.push(attr.nameHR);
        }
      });
    }
    
    // If any fields are empty, show error and highlight them
    if (emptyHedonicFields.length > 0 || emptyJarFields.length > 0) {
      // Map empty hedonic fields to their Croatian names
      const hedonicFieldNames = {
        appearance: "Izgled",
        odor: "Miris",
        texture: "Tekstura",
        flavor: "Okus",
        overallLiking: "Ukupni dojam"
      };
      
      const emptyHedonicNames = emptyHedonicFields.map(
        field => hedonicFieldNames[field as keyof typeof hedonicFieldNames]
      );
      
      const errorFields = [...emptyHedonicNames, ...emptyJarFields].join(", ");
      
      toast({
        title: "Nepotpuna ocjena",
        description: `Molimo ispunite sva polja. Nedostaju: ${errorFields}`,
        variant: "destructive",
      });
      
      // Manually trigger errors for empty hedonic fields
      emptyHedonicFields.forEach(field => {
        form.setError(`hedonic.${field}` as any, {
          type: "required",
          message: "Obavezno polje"
        });
      });
      
      // Manually trigger errors for empty JAR fields
      emptyJarFields.forEach((_, index) => {
        if (currentJARAttributes && currentJARAttributes[index]) {
          form.setError(`jar.${currentJARAttributes[index].id}` as any, {
            type: "required",
            message: "Obavezno polje"
          });
        }
      });
      
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Pretvorba string vrijednosti u brojeve za hedonističku skalu
      const hedonicRatings: HedonicScale = {
        appearance: parseInt(data.hedonic.appearance),
        odor: parseInt(data.hedonic.odor),
        texture: parseInt(data.hedonic.texture),
        flavor: parseInt(data.hedonic.flavor),
        overallLiking: parseInt(data.hedonic.overallLiking)
      };
      
      // Pretvorba string vrijednosti u brojeve za JAR atribute
      const jarRatings: JARRating = {};
      
      Object.entries(data.jar).forEach(([attrId, value]) => {
        jarRatings[attrId] = parseInt(value);
      });
      
      // Slanje ocjene na backend
      await submitEvaluation(
        user.id,
        currentSample.id,
        currentSample.productTypeId,
        eventId,
        hedonicRatings,
        jarRatings
      );
      
      toast({
        title: "Ocjena spremljena",
        description: `Uspješno ste ocijenili uzorak ${currentSample.blindCode}.`,
      });
      
      // Completely reset the form - this resets the internal state
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
      
      // Generate a new key to force radio buttons to reset
      setFormKey(Date.now());
      
      // Učitaj sljedeći uzorak nakon kratke pauze
      setTimeout(() => {
        loadNextSample(eventId, productTypeId).then(() => {
          setIsSubmitting(false);
          // Scroll to top after submitting
          if (scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: 'smooth' });
          }
        });
      }, 1000);
      
    } catch (error) {
      console.error("Error submitting evaluation:", error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom spremanja ocjene.",
        variant: "destructive",
      });
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
