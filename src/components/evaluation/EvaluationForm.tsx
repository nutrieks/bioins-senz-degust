import { useState, useEffect } from "react";
import { format } from "date-fns";
import { Form } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEvaluation } from "@/contexts/EvaluationContext";
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
  onComplete: () => void;
}

export function EvaluationForm({ eventId, productTypeId, onComplete }: EvaluationFormProps) {
  const { user } = useAuth();
  const { 
    currentSample, 
    currentJARAttributes, 
    isComplete,
    currentProductType
  } = useEvaluation();
  
  const [eventDate, setEventDate] = useState<string>("");
  
  // Use our custom hook for form management - simplified call
  const {
    form,
    formKey,
    isSubmitting,
    scrollRef,
    onSubmit
  } = useEvaluationForm(eventId);
  
  // Dohvati datum događaja
  useEffect(() => {
    const fetchEventDate = async () => {
      if (eventId) {
        try {
          const event = await getEvent(eventId);
          if (event) {
            setEventDate(format(new Date(event.date), "dd.MM.yyyy."));
          }
        } catch (error) {
          console.error("Error fetching event date:", error);
        }
      }
    };

    fetchEventDate();
  }, [eventId]);

  // Log currentJARAttributes whenever they change
  useEffect(() => {
    console.log("Current JAR Attributes in form:", currentJARAttributes);
  }, [currentJARAttributes]);
  
  // Ako je ocjenjivanje završeno, prikazujemo poruku
  if (isComplete) {
    return <CompletionScreen onContinue={onComplete} />;
  }
  
  if (!currentSample) {
    return (
      <Card className="my-8">
        <CardContent className="p-6 text-center">
          <p>Nema dostupnih uzoraka za ocjenjivanje.</p>
          <Button className="mt-4" onClick={onComplete}>
            Povratak na početnu
          </Button>
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
              {currentJARAttributes && currentJARAttributes.length > 0 && (
                <JARScaleSection 
                  attributes={currentJARAttributes}
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
