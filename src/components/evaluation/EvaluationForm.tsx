
import { useState, useEffect } from "react";
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

// Opisi za hedonističku skalu
const HEDONIC_LABELS = [
  "Iznimno mi se ne sviđa",
  "Vrlo mi se ne sviđa",
  "Umjereno mi se ne sviđa",
  "Malo mi se ne sviđa",
  "Niti mi se sviđa niti ne sviđa",
  "Malo mi se sviđa",
  "Umjereno mi se sviđa",
  "Vrlo mi se sviđa",
  "Iznimno mi se sviđa"
];

export function EvaluationForm({ eventId, productTypeId, onComplete }: EvaluationFormProps) {
  const { user } = useAuth();
  const { 
    currentSample, 
    currentRound, 
    currentJARAttributes, 
    loadNextSample, 
    isComplete 
  } = useEvaluation();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventDate, setEventDate] = useState<string>("");
  
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
      
      // Resetiranje obrasca
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
      
      // Učitaj sljedeći uzorak nakon kratke pauze
      setTimeout(() => {
        loadNextSample(eventId, productTypeId).then(() => {
          setIsSubmitting(false);
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
      <div className="evaluation-form container max-w-4xl px-4 py-6">
        <Card className="mb-8">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">
              {currentSample.blindCode}
            </CardTitle>
            <div className="mt-2 text-sm text-muted-foreground">
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 mb-2">
                <span>Ocjenjivačko mjesto: {user?.evaluatorPosition}</span>
                <span>Datum: {eventDate}</span>
              </div>
              <div>
                {currentJARAttributes.length > 0 && (
                  <span className="font-medium">{currentJARAttributes[0]?.nameHR}</span>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="space-y-10">
              {/* Hedonistička skala */}
              <Card>
                <CardHeader>
                  <CardTitle>Hedonistička skala</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    <FormField
                      control={form.control}
                      name="hedonic.appearance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-semibold">Izgled</FormLabel>
                          <div className="mt-3">
                            <HedonicRadioGroup 
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="justify-between"
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((value) => (
                                <HedonicRadioItem 
                                  key={`appearance-${value}`}
                                  value={value.toString()}
                                  label={value === 1 ? HEDONIC_LABELS[0] :
                                         value === 3 ? HEDONIC_LABELS[2] :
                                         value === 5 ? HEDONIC_LABELS[4] :
                                         value === 7 ? HEDONIC_LABELS[6] :
                                         value === 9 ? HEDONIC_LABELS[8] : undefined}
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
                          <FormLabel className="text-lg font-semibold">Miris</FormLabel>
                          <div className="mt-3">
                            <HedonicRadioGroup 
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="justify-between"
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((value) => (
                                <HedonicRadioItem 
                                  key={`odor-${value}`}
                                  value={value.toString()}
                                  label={value === 1 ? HEDONIC_LABELS[0] :
                                         value === 3 ? HEDONIC_LABELS[2] :
                                         value === 5 ? HEDONIC_LABELS[4] :
                                         value === 7 ? HEDONIC_LABELS[6] :
                                         value === 9 ? HEDONIC_LABELS[8] : undefined}
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
                          <FormLabel className="text-lg font-semibold">Tekstura</FormLabel>
                          <div className="mt-3">
                            <HedonicRadioGroup 
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="justify-between"
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((value) => (
                                <HedonicRadioItem 
                                  key={`texture-${value}`}
                                  value={value.toString()}
                                  label={value === 1 ? HEDONIC_LABELS[0] :
                                         value === 3 ? HEDONIC_LABELS[2] :
                                         value === 5 ? HEDONIC_LABELS[4] :
                                         value === 7 ? HEDONIC_LABELS[6] :
                                         value === 9 ? HEDONIC_LABELS[8] : undefined}
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
                          <FormLabel className="text-lg font-semibold">Okus</FormLabel>
                          <div className="mt-3">
                            <HedonicRadioGroup 
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="justify-between"
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((value) => (
                                <HedonicRadioItem 
                                  key={`flavor-${value}`}
                                  value={value.toString()}
                                  label={value === 1 ? HEDONIC_LABELS[0] :
                                         value === 3 ? HEDONIC_LABELS[2] :
                                         value === 5 ? HEDONIC_LABELS[4] :
                                         value === 7 ? HEDONIC_LABELS[6] :
                                         value === 9 ? HEDONIC_LABELS[8] : undefined}
                                />
                              ))}
                            </HedonicRadioGroup>
                          </div>
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="hedonic.overallLiking"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg font-semibold">Ukupni dojam</FormLabel>
                          <div className="mt-3">
                            <HedonicRadioGroup 
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="justify-between"
                            >
                              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((value) => (
                                <HedonicRadioItem 
                                  key={`overallLiking-${value}`}
                                  value={value.toString()}
                                  label={value === 1 ? HEDONIC_LABELS[0] :
                                         value === 3 ? HEDONIC_LABELS[2] :
                                         value === 5 ? HEDONIC_LABELS[4] :
                                         value === 7 ? HEDONIC_LABELS[6] :
                                         value === 9 ? HEDONIC_LABELS[8] : undefined}
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

              {/* JAR skala */}
              <Card>
                <CardHeader>
                  <CardTitle>JAR skala (Just About Right)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-8">
                    {currentJARAttributes.map((attribute) => (
                      <FormField
                        key={attribute.id}
                        control={form.control}
                        name={`jar.${attribute.id}`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-lg font-semibold">{attribute.nameHR}</FormLabel>
                            <div className="mt-3">
                              <JARRadioGroup 
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                              >
                                {[1, 2, 3, 4, 5].map((value, index) => (
                                  <JARRadioItem
                                    key={`${attribute.id}-${value}`}
                                    value={value.toString()}
                                    label={attribute.scaleHR[index]}
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
            </div>
            
            <div className="flex justify-center mt-10 mb-6">
              <Button 
                type="submit" 
                size="lg" 
                disabled={isSubmitting || !form.formState.isValid}
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
