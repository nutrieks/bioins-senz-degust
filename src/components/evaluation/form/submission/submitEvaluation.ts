
import { FormData } from "../types";
import { HedonicScale, JARRating, Sample } from "@/types";
import { submitEvaluation as submitEvaluationAPI, getCompletedEvaluations } from "@/services/dataService";
import { UseFormReturn } from "react-hook-form";

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
    console.log("=== SUBMITTING EVALUATION ===");
    console.log("User ID:", userId);
    console.log("Sample ID:", currentSample.id);
    console.log("Product Type ID:", currentSample.productTypeId);
    console.log("Event ID:", eventId);
    console.log("Form data:", data);
    
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
      if (value !== undefined && value !== '') {
        jarRatings[attrId] = parseInt(value.toString());
      }
    });
    
    console.log("Final ratings to submit:", {
      hedonic: hedonicRatings,
      jar: jarRatings
    });
    
    // Slanje ocjene na backend with better error handling
    const submitResult = await submitEvaluationAPI({
      userId,
      sampleId: currentSample.id,
      productTypeId: currentSample.productTypeId,
      eventId,
      hedonicRatings,
      jarRatings
    });
    
    console.log("Evaluation submission result:", submitResult);
    
    if (!submitResult) {
      throw new Error("Failed to submit evaluation - no result returned");
    }
    
    toast.toast({
      title: "Ocjena spremljena",
      description: `Uspješno ste ocijenili uzorak ${currentSample.blindCode}.`,
    });
    
    // Refresh completed evaluations from database to ensure we have latest data
    console.log("Refreshing completed evaluations from database...");
    const refreshedEvaluations = await getCompletedEvaluations(eventId, userId);
    console.log("Refreshed evaluations count:", refreshedEvaluations.length);
    
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
    
    // Wait a bit to ensure database consistency, then load next sample
    setTimeout(async () => {
      try {
        console.log("Loading next sample after evaluation submission...");
        await loadNextSample(eventId, currentSample.productTypeId);
        console.log("Next sample loaded successfully");
        
        // Scroll to top after submitting
        if (scrollRef.current) {
          scrollRef.current.scrollIntoView({ behavior: 'smooth' });
        }
      } catch (error) {
        console.error("Error loading next sample:", error);
        toast.toast({
          title: "Greška",
          description: "Problema s učitavanjem sljedećeg uzorka.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    }, 1500); // Increased delay to ensure database consistency
    
  } catch (error) {
    console.error("=== ERROR SUBMITTING EVALUATION ===");
    console.error("Error details:", error);
    toast.toast({
      title: "Greška",
      description: "Došlo je do pogreške prilikom spremanja ocjene. Molimo pokušajte ponovno.",
      variant: "destructive",
    });
    setIsSubmitting(false);
  }
}
