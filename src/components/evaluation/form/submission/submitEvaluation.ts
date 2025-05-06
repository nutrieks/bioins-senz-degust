
import { FormData } from "../types";
import { HedonicScale, JARRating, Sample } from "@/types";
import { submitEvaluation as submitEvaluationAPI } from "@/services/dataService";
import { UseFormReturn } from "react-hook-form";
import { toast } from "@/hooks/use-toast";

export async function handleEvaluationSubmit(
  data: FormData,
  form: UseFormReturn<FormData>,
  userId: string,
  currentSample: Sample,
  eventId: string,
  toast: { toast: (props: any) => void },
  setIsSubmitting: (value: boolean) => void,
  loadNextSample: (eventId: string, productTypeId?: string) => Promise<void>,
  setFormKey: (value: number) => void,
  scrollRef: React.RefObject<HTMLDivElement>
): Promise<void> {
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
    await submitEvaluationAPI(
      userId,
      currentSample.id,
      currentSample.productTypeId,
      eventId,
      hedonicRatings,
      jarRatings
    );
    
    toast.toast({
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
      loadNextSample(eventId, currentSample.productTypeId).then(() => {
        setIsSubmitting(false);
        // Scroll to top after submitting
        if (scrollRef.current) {
          scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }, 1000);
    
  } catch (error) {
    console.error("Error submitting evaluation:", error);
    toast.toast({
      title: "Greška",
      description: "Došlo je do pogreške prilikom spremanja ocjene.",
      variant: "destructive",
    });
    setIsSubmitting(false);
  }
}
