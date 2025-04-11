
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { useEvaluation } from "@/contexts/EvaluationContext";
import { submitEvaluation } from "@/services/dataService";
import { HedonicScale, JARRating } from "@/types";
import { useToast } from "@/hooks/use-toast";

interface EvaluationFormProps {
  eventId: string;
  productTypeId?: string;
  onComplete: () => void;
}

export function EvaluationForm({ eventId, productTypeId, onComplete }: EvaluationFormProps) {
  const { user } = useAuth();
  const { currentSample, currentRound, currentJARAttributes, loadNextSample } = useEvaluation();
  const { toast } = useToast();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hedonicRatings, setHedonicRatings] = useState<HedonicScale>({
    appearance: 0,
    odor: 0,
    texture: 0,
    flavor: 0,
    overallLiking: 0,
  });
  
  const [jarRatings, setJarRatings] = useState<JARRating>({});
  
  // Initialize JAR ratings if needed
  if (currentJARAttributes.length > 0) {
    currentJARAttributes.forEach(attr => {
      if (jarRatings[attr.id] === undefined) {
        setJarRatings(prev => ({ ...prev, [attr.id]: 0 }));
      }
    });
  }
  
  const handleHedonicChange = (attribute: keyof HedonicScale, value: number) => {
    setHedonicRatings(prev => ({ ...prev, [attribute]: value }));
  };
  
  const handleJARChange = (attributeId: string, value: number) => {
    setJarRatings(prev => ({ ...prev, [attributeId]: value }));
  };
  
  const isFormValid = () => {
    // Check all hedonic ratings are set
    const hedonicComplete = Object.values(hedonicRatings).every(rating => rating > 0);
    
    // Check all JAR ratings are set
    const jarComplete = currentJARAttributes.every(attr => jarRatings[attr.id] > 0);
    
    return hedonicComplete && jarComplete;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !currentSample) return;
    
    setIsSubmitting(true);
    
    try {
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
        description: "Vaša ocjena je uspješno spremljena.",
      });
      
      // Reset form
      setHedonicRatings({
        appearance: 0,
        odor: 0,
        texture: 0,
        flavor: 0,
        overallLiking: 0,
      });
      
      setJarRatings({});
      
      // Load next sample after a short delay
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
    <div className="evaluation-form">
      <div className="mb-8 text-center">
        <p className="text-sm text-muted-foreground">
          Ocjenjivačko mjesto: {user?.evaluatorPosition} | Uzorak: {currentRound} od {currentJARAttributes.length > 0 ? currentJARAttributes[0].scaleHR.length : "?"}
        </p>
        <h2 className="text-2xl font-bold mt-2">
          {currentSample.blindCode} - {productTypeId ? currentJARAttributes[0]?.nameHR : ""}
        </h2>
      </div>
      
      {currentSample.images.prepared && (
        <div className="evaluation-image">
          <img 
            src={currentSample.images.prepared} 
            alt="Pripremljeni uzorak" 
            className="rounded-lg shadow-md"
          />
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="evaluation-attributes">
          <div>
            <h3>Hedonistička ocjena</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ocijenite koliko vam se sviđaju sljedeći atributi od 1 (Izrazito mi se ne sviđa) do 9 (Izrazito mi se sviđa).
            </p>
            
            <div className="space-y-6">
              <div>
                <h4>Izgled</h4>
                <div className="rating-grid hedonic-input">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((value) => (
                    <label key={`appearance-${value}`}>
                      <input
                        type="radio"
                        name="appearance"
                        value={value}
                        checked={hedonicRatings.appearance === value}
                        onChange={() => handleHedonicChange("appearance", value)}
                        required
                      />
                      <span>{value}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <h4>Miris</h4>
                <div className="rating-grid hedonic-input">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((value) => (
                    <label key={`odor-${value}`}>
                      <input
                        type="radio"
                        name="odor"
                        value={value}
                        checked={hedonicRatings.odor === value}
                        onChange={() => handleHedonicChange("odor", value)}
                        required
                      />
                      <span>{value}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <h4>Tekstura</h4>
                <div className="rating-grid hedonic-input">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((value) => (
                    <label key={`texture-${value}`}>
                      <input
                        type="radio"
                        name="texture"
                        value={value}
                        checked={hedonicRatings.texture === value}
                        onChange={() => handleHedonicChange("texture", value)}
                        required
                      />
                      <span>{value}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <h4>Okus</h4>
                <div className="rating-grid hedonic-input">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((value) => (
                    <label key={`flavor-${value}`}>
                      <input
                        type="radio"
                        name="flavor"
                        value={value}
                        checked={hedonicRatings.flavor === value}
                        onChange={() => handleHedonicChange("flavor", value)}
                        required
                      />
                      <span>{value}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div>
                <h4>Ukupni dojam</h4>
                <div className="rating-grid hedonic-input">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((value) => (
                    <label key={`overallLiking-${value}`}>
                      <input
                        type="radio"
                        name="overallLiking"
                        value={value}
                        checked={hedonicRatings.overallLiking === value}
                        onChange={() => handleHedonicChange("overallLiking", value)}
                        required
                      />
                      <span>{value}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3>JAR ocjena</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Ocijenite koliko su sljedeći atributi optimalni (prema JAR skali).
            </p>
            
            <div className="space-y-6">
              {currentJARAttributes.map((attribute) => (
                <div key={attribute.id}>
                  <h4>{attribute.nameHR}</h4>
                  <div className="rating-grid-jar jar-input">
                    {attribute.scaleHR.map((label, index) => (
                      <label key={`${attribute.id}-${index + 1}`}>
                        <input
                          type="radio"
                          name={`jar-${attribute.id}`}
                          value={index + 1}
                          checked={jarRatings[attribute.id] === index + 1}
                          onChange={() => handleJARChange(attribute.id, index + 1)}
                          required
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex justify-center mt-8">
          <Button 
            type="submit" 
            size="lg" 
            disabled={isSubmitting || !isFormValid()}
          >
            {isSubmitting ? "Spremanje..." : "Predaj ocjenu"}
          </Button>
        </div>
      </form>
    </div>
  );
}
