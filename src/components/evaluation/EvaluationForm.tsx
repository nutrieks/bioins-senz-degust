
import { Form } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent } from "@/components/ui/card";
import { SampleHeader } from "./form/SampleHeader";
import { HedonicScaleSection } from "./form/HedonicScaleSection";
import { JARScaleSection } from "./form/JARScaleSection";
import { SubmitButton } from "./form/SubmitButton";
import { useEvaluationForm } from "./form/useEvaluationForm";
import { Sample, ProductType, User, HedonicScale, JARRating } from "@/types";

interface EvaluationFormProps {
  user: User;
  eventDate: string;
  sample: Sample;
  productType: ProductType;
  jarAttributes: any[];
  onSubmit: (data: { hedonic: HedonicScale; jar: JARRating }) => Promise<void>;
  isSubmitting: boolean;
}

export function EvaluationForm({ 
  user, 
  eventDate, 
  sample, 
  productType, 
  jarAttributes, 
  onSubmit, 
  isSubmitting 
}: EvaluationFormProps) {
  // Use our custom hook for form management
  const {
    form,
    formKey,
    scrollRef,
    scrollToTop
  } = useEvaluationForm(sample, jarAttributes, 0);
  
  // Handle form submission with validation
  const handleSubmit = async (data: any) => {
    // Import validation function locally
    const { validateEvaluationForm } = await import("./form/validation/formValidation");
    const { isValid } = validateEvaluationForm(data, form, jarAttributes || []);
    
    if (!isValid) {
      return;
    }
    
    try {
      await onSubmit({
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
    }
  };
  
  if (!sample) {
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
          sampleCode={sample.blindCode || ''} 
          user={user} 
          eventDate={eventDate}
          productType={productType}
        />
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} key={formKey}>
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
              currentSample={sample} 
            />
          </form>
        </Form>
      </div>
    </ScrollArea>
  );
}
