
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
    
    // Enhanced submission with retry logic
    let submitResult = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`Evaluation submission attempt ${attempt}/3`);
      try {
        submitResult = await submitEvaluationAPI({
          userId,
          sampleId: currentSample.id,
          productTypeId: currentSample.productTypeId,
          eventId,
          hedonicRatings,
          jarRatings
        });
        
        if (submitResult) {
          console.log("Evaluation submission successful on attempt:", attempt);
          break;
        }
      } catch (error) {
        console.error(`Evaluation submission attempt ${attempt} failed:`, error);
        if (attempt === 3) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    if (!submitResult) {
      throw new Error("Failed to submit evaluation after 3 attempts");
    }
    
    console.log("Evaluation submission result:", submitResult);
    
    toast.toast({
      title: "Ocjena spremljena",
      description: `Uspješno ste ocijenili uzorak ${currentSample.blindCode}.`,
    });
    
    // Refresh completed evaluations from database with retry logic
    console.log("Refreshing completed evaluations from database...");
    let refreshedEvaluations = [];
    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`Evaluations refresh attempt ${attempt}/3`);
      try {
        refreshedEvaluations = await getCompletedEvaluations(eventId, userId);
        console.log("Refreshed evaluations count:", refreshedEvaluations.length);
        break;
      } catch (error) {
        console.error(`Evaluations refresh attempt ${attempt} failed:`, error);
        if (attempt === 3) {
          console.warn("Could not refresh evaluations, continuing anyway");
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
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
    
    // Enhanced next sample loading with better error handling
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
    }, 2000); // Increased delay for better database consistency
    
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
