
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EvaluationForm } from "@/components/evaluation/EvaluationForm";
import { CompletionMessage } from "@/components/evaluation/CompletionMessage";
import { SampleRevealScreen } from "@/components/evaluation/SampleRevealScreen";
import { useEvaluation } from "@/contexts/EvaluationContext";
import { ProductType } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface EvaluationContentProps { 
  eventId: string; 
  eventName: string;
  eventDate: string;
  productTypes: ProductType[];
}

export function EvaluationContent({ 
  eventId, 
  eventName,
  eventDate,
  productTypes
}: EvaluationContentProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    isComplete, 
    loadNextSample, 
    loadNextProductType,
    currentProductType,
    showSampleReveal,
    setShowSampleReveal,
    currentSample
  } = useEvaluation();
  const [initialized, setInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialized && !isInitializing) {
      initializeEvaluation();
    }
  }, [eventId, initialized, isInitializing]);

  const initializeEvaluation = async () => {
    setIsInitializing(true);
    setInitError(null);
    
    try {
      console.log("Initializing evaluation with event ID:", eventId);
      console.log("Available product types:", productTypes.length);
      
      // Provjeri da li događaj ima tipove proizvoda
      if (!productTypes || productTypes.length === 0) {
        setInitError("Ovaj događaj nema dodanih tipova proizvoda.");
        setIsInitializing(false);
        return;
      }

      // Provjeri da li svi tipovi proizvoda imaju randomizaciju
      const productTypesWithoutRandomization = productTypes.filter(pt => !pt.hasRandomization);
      if (productTypesWithoutRandomization.length > 0) {
        setInitError(`Neki tipovi proizvoda nemaju generirane randomizacije. Molimo kontaktirajte administratora.`);
        setIsInitializing(false);
        return;
      }

      // Provjeri da li svi tipovi proizvoda imaju uzorke
      const productTypesWithoutSamples = productTypes.filter(pt => !pt.samples || pt.samples.length === 0);
      if (productTypesWithoutSamples.length > 0) {
        setInitError(`Neki tipovi proizvoda nemaju dodane uzorke. Molimo kontaktirajte administratora.`);
        setIsInitializing(false);
        return;
      }

      // Učitaj prvi tip proizvoda i njegove uzorke
      const hasProductTypes = await loadNextProductType(eventId);
      console.log("loadNextProductType result:", hasProductTypes);
      
      if (!hasProductTypes) {
        console.log("No product types available for evaluation");
        setInitError("Nema dostupnih tipova proizvoda za ocjenjivanje.");
      } else {
        setInitialized(true);
      }
    } catch (error) {
      console.error("Error initializing evaluation:", error);
      setInitError("Došlo je do greške prilikom inicijalizacije ocjenjivanja. Molimo pokušajte ponovno.");
      
      toast({
        title: "Greška",
        description: "Nije moguće pokrenuti ocjenjivanje. Molimo kontaktirajte administratora.",
        variant: "destructive",
      });
    } finally {
      setIsInitializing(false);
    }
  };

  const handleReturn = () => {
    navigate("/evaluator");
  };

  const handleRetryInitialization = () => {
    setInitialized(false);
    setInitError(null);
    initializeEvaluation();
  };

  const handleContinueAfterReveal = async () => {
    // Sakrij ekran za otkrivanje
    setShowSampleReveal(false);
    
    console.log("Continue after reveal, loading next product type");
    // Učitaj sljedeći tip proizvoda za ocjenjivanje
    const hasMore = await loadNextProductType(eventId);
    console.log("Has more product types:", hasMore);
    
    if (!hasMore) {
      // Nema više tipova proizvoda, prikaži konačnu poruku
      console.log("All product types completed");
    }
  };

  // Prikaz greške prilikom inicijalizacije
  if (initError) {
    return (
      <Card className="my-8">
        <CardContent className="p-6 text-center space-y-4">
          <AlertTriangle className="h-12 w-12 text-orange-500 mx-auto" />
          <h3 className="text-lg font-semibold">Problem s pokretanjem ocjenjivanja</h3>
          <p className="text-muted-foreground">{initError}</p>
          <div className="flex justify-center space-x-4">
            <Button onClick={handleReturn} variant="outline">
              Natrag na početnu
            </Button>
            <Button onClick={handleRetryInitialization} className="flex items-center">
              <RefreshCw className="mr-2 h-4 w-4" />
              Pokušaj ponovno
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Prikaz loading-a tijekom inicijalizacije
  if (isInitializing || !initialized) {
    return (
      <Card className="my-8">
        <CardContent className="p-6 text-center space-y-4">
          <RefreshCw className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-lg">Priprema evaluacije...</p>
          <p className="text-sm text-muted-foreground">
            Učitavanje tipova proizvoda i randomizacije
          </p>
        </CardContent>
      </Card>
    );
  }

  // Ako je ocjenjivanje za sve tipove proizvoda završeno
  if (isComplete) {
    console.log("Evaluation complete, showing completion message");
    return <CompletionMessage onReturn={handleReturn} />;
  }

  // Ako je završeno ocjenjivanje trenutnog tipa proizvoda, prikaži otkrivanje uzoraka
  if (showSampleReveal && currentProductType) {
    console.log("Showing sample reveal for product type:", currentProductType.id);
    return (
      <SampleRevealScreen 
        eventId={eventId}
        productTypeId={currentProductType.id}
        productName={currentProductType.productName}
        onContinue={handleContinueAfterReveal}
      />
    );
  }

  // Prikaži obrazac za ocjenjivanje trenutnog uzorka
  console.log("Showing evaluation form for product type:", currentProductType?.id);
  return (
    <EvaluationForm 
      eventId={eventId} 
      productTypeId={currentProductType?.id}
      onComplete={handleReturn} 
    />
  );
}
