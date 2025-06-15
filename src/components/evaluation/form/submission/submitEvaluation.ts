
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
    
    // Submit evaluation with improved error handling
    console.log("Submitting evaluation to API...");
    const submitResult = await submitEvaluationAPI({
      userId,
      sampleId: currentSample.id,
      productTypeId: currentSample.productTypeId,
      eventId,
      hedonicRatings,
      jarRatings
    });
    
    if (!submitResult) {
      throw new Error("Failed to submit evaluation - no result returned");
    }
    
    console.log("Evaluation submission successful");
    
    toast.toast({
      title: "Ocjena spremljena",
      description: `Uspješno ste ocijenili uzorak ${currentSample.blindCode}.`,
    });
    
    // Refresh completed evaluations from database
    console.log("Refreshing completed evaluations from database...");
    try {
      const refreshedEvaluations = await getCompletedEvaluations(eventId, userId);
      console.log("Refreshed evaluations count:", refreshedEvaluations.length);
    } catch (refreshError) {
      console.warn("Could not refresh evaluations:", refreshError);
      // Continue anyway, the evaluation was saved
    }
    
    // Completely reset the form
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
    
    // Load next sample after successful submission
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
          description: "Problem s učitavanjem sljedećeg uzorka. Molimo osvježite stranicu.",
          variant: "destructive",
        });
      } finally {
        setIsSubmitting(false);
      }
    }, 1500); // Reduced delay
    
  } catch (error) {
    console.error("=== ERROR SUBMITTING EVALUATION ===");
    console.error("Error details:", error);
    
    let errorMessage = "Došlo je do pogreške prilikom spremanja ocjene.";
    
    if (error instanceof Error) {
      if (error.message.includes('dozvolu')) {
        errorMessage = error.message;
      } else if (error.message.includes('autentifikacijom')) {
        errorMessage = "Problem s autentifikacijom. Molimo prijavite se ponovno.";
      } else if (error.message.includes('Authentication')) {
        errorMessage = "Problem s autentifikacijom. Molimo prijavite se ponovno.";
      } else {
        errorMessage = `Greška: ${error.message}`;
      }
    }
    
    toast.toast({
      title: "Greška",
      description: errorMessage,
      variant: "destructive",
    });
    setIsSubmitting(false);
  }
}
