
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Form } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEvaluationFlow } from "@/hooks/useEvaluationFlow";
import { getEvent } from "@/services/dataService";
import { CompletionScreen } from "./form/CompletionScreen";
import { SampleHeader } from "./form/SampleHeader";
import { HedonicScaleSection } from "./form/HedonicScaleSection";
import { JARScaleSection } from "./form/JARScaleSection";
import { SubmitButton } from "./form/SubmitButton";
import { useEvaluationForm } from "./form/useEvaluationForm";
import { useAuth } from "@/contexts/AuthContext";

interface EvaluationFormProps {
  eventId: string;
  productTypeId?: string;
}

export function EvaluationForm({ eventId }: EvaluationFormProps) {
  const { user } = useAuth();
  const { 
    currentSample, 
    isEvaluationCompleteForUser,
    currentProductType,
    jarAttributes,
    submitEvaluation,
    isSubmitting: managerIsSubmitting,
    forceFormReset
  } = useEvaluationFlow(eventId);
  
  const [eventDate, setEventDate] = useState<string>("");
  
  // Use our custom hook for form management but override submit
  const {
    form,
    formKey,
    scrollRef,
    onSubmit: originalOnSubmit,
    scrollToTop
  } = useEvaluationForm(currentSample, jarAttributes, forceFormReset ? 1 : 0);
  
  // Use manager's submission state
  const isSubmitting = managerIsSubmitting;
  
  // Override submit to use our unified submit function with validation
  const onSubmit = async (data: any) => {
    if (!currentSample) return;
    
    // Import validation function locally
    const { validateEvaluationForm } = await import("./form/validation/formValidation");
    const { isValid, errorFields } = validateEvaluationForm(data, form, jarAttributes || []);
    
    if (!isValid) {
      // Toast is handled by useEvaluationForm validation, but we can add additional validation here
      return;
    }
    
    try {
      await submitEvaluation({
        hedonic: {
          appearance: parseInt(data.hedonic.appearance),
          odor: parseInt(data.hedonic.odor),
          texture: parseInt(data.hedonic.texture),
          flavor: parseInt(data.hedonic.flavor),
          overallLiking: parseInt(data.hedonic.overallLiking),
        },
        jar: Object.fromEntries(
          Object.entries(data.jar || {}).map(([key, value]) => [key, parseInt(value as string)])
        )
      });
      
      // Immediate scroll to top after successful submission
      scrollToTop();
      
    } catch (error) {
      console.error("Form submission error:", error);
      // Error handling is done in submitEvaluation
    }
  };
  
  // Dohvati datum događaja
  useEffect(() => {
    const fetchEventDate = async () => {
      if (currentSample?.productTypeId) {
        try {
          // Get event info through sample
          const event = await getEvent(currentSample.productTypeId);
          if (event) {
            setEventDate(format(new Date(event.date), "dd.MM.yyyy."));
          }
        } catch (error) {
          console.error("Error fetching event date:", error);
        }
      }
    };

    fetchEventDate();
  }, [currentSample]);
  
  if (!currentSample) {
    return (
      <Card className="my-8">
        <CardContent className="p-6 text-center">
          <p>Nema dostupnih uzoraka za ocjenjivanje.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <ScrollArea className="h-[calc(100vh-240px)]">
      <div className="evaluation-form container max-w-5xl px-4 py-6" ref={scrollRef}>
        <SampleHeader 
          sampleCode={currentSample.blindCode || ''} 
          user={user} 
          eventDate={eventDate}
          productType={currentProductType}
        />
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} key={formKey}>
            <div className="space-y-10">
              {/* Hedonistička skala */}
              <HedonicScaleSection 
                control={form.control} 
                formKey={formKey}
                errors={form.formState.errors}
              />

              {/* JAR skala - only show if attributes exist */}
              {jarAttributes && jarAttributes.length > 0 && (
                <JARScaleSection 
                  attributes={jarAttributes}
                  control={form.control}
                  formKey={formKey}
                  errors={form.formState.errors}
                />
              )}
            </div>
            
            <SubmitButton 
              isSubmitting={isSubmitting} 
              currentSample={currentSample} 
            />
          </form>
        </Form>
      </div>
    </ScrollArea>
  );
}
