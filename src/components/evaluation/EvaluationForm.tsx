import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { format } from "date-fns";
import { Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Form,
  FormField,
  FormItem,
  FormLabel 
} from "@/components/ui/form";
import { 
  HedonicRadioGroup, 
  HedonicRadioItem,
  JARRadioGroup, 
  JARRadioItem 
} from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { useEvaluation } from "@/contexts/EvaluationContext";
import { submitEvaluation, getEvent } from "@/services/dataService";
import { HedonicScale, JARRating } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface EvaluationFormProps {
  eventId: string;
  productTypeId?: string;
  onComplete: () => void;
}

type FormData = {
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

// Opis za hedonističku skalu s brojevima u zagradama
const HEDONIC_LABELS = [
  "Iznimno mi se sviđa (9)",
  "Vrlo mi se sviđa (8)",
  "Umjereno mi se sviđa (7)",
  "Lagano mi se sviđa (6)",
  "Niti mi se sviđa niti mi se ne sviđa (5)",
  "Lagano mi se ne sviđa (4)",
  "Umjereno mi se ne sviđa (3)",
  "Vrlo mi se ne sviđa (2)",
  "Iznimno mi se ne sviđa (1)"
];

export function EvaluationForm({ eventId, productTypeId, onComplete }: EvaluationFormProps) {
  const { user } = useAuth();
  const { 
    currentSample, 
    currentRound, 
    currentJARAttributes, 
    loadNextSample, 
    isComplete,
    currentProductType
  } = useEvaluation();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventDate, setEventDate] = useState<string>("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [formKey, setFormKey] = useState<number>(Date.now()); // Key to force form reset
  
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
    }
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
  
  const onSubmit = async (data: FormData) => {
    if (!user || !currentSample) return;
    
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
  
  // Ako je ocjenjivanje završeno, prikazujemo poruku
  if (isComplete) {
    return (
      <Card className="my-8">
        <CardContent className="p-6 flex flex-col items-center">
          <div className="rounded-full bg-primary p-3 text-primary-foreground">
            <Check className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-xl font-semibold">Ocjenjivanje završeno</h2>
          <p className="text-center mt-2 text-muted-foreground">
            Uspješno ste završili ocjenjivanje svih uzoraka.
          </p>
          <Button className="mt-6" onClick={onComplete}>
            Povratak na početnu
          </Button>
        </CardContent>
      </Card>
    );
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
        <Card className="mb-8">
          <CardHeader className="text-center bg-[#F1F0FB] rounded-t-lg">
            <CardTitle className="text-2xl">
              {currentSample.blindCode}
            </CardTitle>
            <div className="mt-2 text-sm text-muted-foreground">
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 mb-2">
                <span>Ocjenjivačko mjesto: {user?.evaluatorPosition}</span>
                <span>Datum: {eventDate}</span>
              </div>
              <div>
                {currentProductType && (
                  <span className="font-medium text-base">{currentProductType.productName}</span>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} key={formKey}>
            <div className="space-y-10">
              {/* Hedonistička skala */}
              <Card>
                <CardHeader className="border-b">
                  <CardTitle>Hedonistička Skala</CardTitle>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-10">
                    <FormField
                      control={form.control}
                      name="hedonic.appearance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-semibold">Izgled:</FormLabel>
                          <div className="mt-2">
                            <HedonicRadioGroup 
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              {[9, 8, 7, 6, 5, 4, 3, 2, 1].map((value, index) => (
                                <HedonicRadioItem 
                                  key={`appearance-${value}-${formKey}`}
                                  value={value.toString()}
                                  label={HEDONIC_LABELS[index]}
                                />
                              ))}
                            </HedonicRadioGroup>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hedonic.odor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-semibold">Miris:</FormLabel>
                          <div className="mt-2">
                            <HedonicRadioGroup 
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              {[9, 8, 7, 6, 5, 4, 3, 2, 1].map((value, index) => (
                                <HedonicRadioItem 
                                  key={`odor-${value}-${formKey}`}
                                  value={value.toString()}
                                  label={HEDONIC_LABELS[index]}
                                />
                              ))}
                            </HedonicRadioGroup>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hedonic.texture"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-semibold">Tekstura:</FormLabel>
                          <div className="mt-2">
                            <HedonicRadioGroup 
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              {[9, 8, 7, 6, 5, 4, 3, 2, 1].map((value, index) => (
                                <HedonicRadioItem 
                                  key={`texture-${value}-${formKey}`}
                                  value={value.toString()}
                                  label={HEDONIC_LABELS[index]}
                                />
                              ))}
                            </HedonicRadioGroup>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hedonic.flavor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-semibold">Okus:</FormLabel>
                          <div className="mt-2">
                            <HedonicRadioGroup 
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              {[9, 8, 7, 6, 5, 4, 3, 2, 1].map((value, index) => (
                                <HedonicRadioItem 
                                  key={`flavor-${value}-${formKey}`}
                                  value={value.toString()}
                                  label={HEDONIC_LABELS[index]}
                                />
                              ))}
                            </HedonicRadioGroup>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="mt-10">
                    <FormField
                      control={form.control}
                      name="hedonic.overallLiking"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-semibold">Ukupni dojam:</FormLabel>
                          <div className="mt-2">
                            <HedonicRadioGroup 
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              {[9, 8, 7, 6, 5, 4, 3, 2, 1].map((value, index) => (
                                <HedonicRadioItem 
                                  key={`overallLiking-${value}-${formKey}`}
                                  value={value.toString()}
                                  label={HEDONIC_LABELS[index]}
                                />
                              ))}
                            </HedonicRadioGroup>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* JAR skala - only show if attributes exist */}
              {currentJARAttributes && currentJARAttributes.length > 0 && (
                <Card>
                  <CardHeader className="border-b">
                    <CardTitle>JAR skala (Just About Right)</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-8">
                      {currentJARAttributes.map((attribute) => (
                        <FormField
                          key={`jar-${attribute.id}-${formKey}`}
                          control={form.control}
                          name={`jar.${attribute.id}`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="text-lg font-semibold">{attribute.nameHR}:</FormLabel>
                              <div className="mt-2">
                                <JARRadioGroup 
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                >
                                  {[1, 2, 3, 4, 5].map((value) => (
                                    <JARRadioItem
                                      key={`${attribute.id}-${value}-${formKey}`}
                                      value={value.toString()}
                                      label={attribute.scaleHR[value-1]}
                                    />
                                  ))}
                                </JARRadioGroup>
                              </div>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
            
            <div className="flex justify-center mt-10 mb-6">
              <Button 
                type="submit" 
                size="lg" 
                disabled={isSubmitting}
                className="w-full max-w-md text-lg py-6"
              >
                {isSubmitting ? 
                  "Spremanje..." : 
                  `Predaj ocjenu za uzorak ${currentSample.blindCode}`}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </ScrollArea>
  );
}
