
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
    console.log("Sample ID:", currentSample?.id);
    console.log("Product Type ID:", currentSample?.productTypeId);
    console.log("Event ID:", eventId);
    console.log("Form data:", data);
    
    // Validate required data before proceeding
    if (!userId) {
      throw new Error("User ID is missing");
    }
    
    if (!currentSample?.id) {
      throw new Error("Sample ID is missing");
    }
    
    if (!currentSample?.productTypeId) {
      throw new Error("Product Type ID is missing");
    }
    
    if (!eventId) {
      throw new Error("Event ID is missing");
    }
    
    if (!data?.hedonic) {
      throw new Error("Hedonic data is missing");
    }
    
    // Safely convert hedonic ratings with validation
    const hedonicRatings: HedonicScale = {
      appearance: data.hedonic.appearance ? parseInt(data.hedonic.appearance) : 0,
      odor: data.hedonic.odor ? parseInt(data.hedonic.odor) : 0,
      texture: data.hedonic.texture ? parseInt(data.hedonic.texture) : 0,
      flavor: data.hedonic.flavor ? parseInt(data.hedonic.flavor) : 0,
      overallLiking: data.hedonic.overallLiking ? parseInt(data.hedonic.overallLiking) : 0
    };
    
    // Validate hedonic ratings
    const invalidHedonic = Object.entries(hedonicRatings).find(([key, value]) => 
      isNaN(value) || value < 1 || value > 9
    );
    
    if (invalidHedonic) {
      throw new Error(`Invalid hedonic rating for ${invalidHedonic[0]}: ${invalidHedonic[1]}`);
    }
    
    // Safely convert JAR ratings with validation
    const jarRatings: JARRating = {};
    
    if (data.jar && typeof data.jar === 'object') {
      Object.entries(data.jar).forEach(([attrId, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          const numValue = parseInt(value.toString());
          if (!isNaN(numValue) && numValue >= 1 && numValue <= 5) {
            jarRatings[attrId] = numValue;
          } else {
            console.warn(`Invalid JAR rating for ${attrId}: ${value}`);
          }
        }
      });
    }
    
    console.log("Final ratings to submit:", {
      hedonic: hedonicRatings,
      jar: jarRatings
    });
    
    // Prepare evaluation data with proper structure
    const evaluationData = {
      userId,
      sampleId: currentSample.id,
      productTypeId: currentSample.productTypeId,
      eventId,
      hedonicRatings,
      jarRatings
    };
    
    console.log("Evaluation data prepared:", evaluationData);
    
    // Submit evaluation with improved error handling
    console.log("Submitting evaluation to API...");
    const submitResult = await submitEvaluationAPI(evaluationData);
    
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
    }, 1500);
    
  } catch (error) {
    console.error("=== ERROR SUBMITTING EVALUATION ===");
    console.error("Error details:", error);
    console.error("Stack trace:", error instanceof Error ? error.stack : 'No stack trace');
    
    let errorMessage = "Došlo je do pogreške prilikom spremanja ocjene.";
    
    if (error instanceof Error) {
      if (error.message.includes('dozvolu')) {
        errorMessage = error.message;
      } else if (error.message.includes('autentifikacijom')) {
        errorMessage = "Problem s autentifikacijom. Molimo prijavite se ponovno.";
      } else if (error.message.includes('Authentication')) {
        errorMessage = "Problem s autentifikacijom. Molimo prijavite se ponovno.";
      } else if (error.message.includes('missing') || error.message.includes('Invalid')) {
        errorMessage = `Greška u podacima: ${error.message}`;
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
