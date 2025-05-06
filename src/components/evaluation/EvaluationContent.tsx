
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { EvaluationForm } from "@/components/evaluation/EvaluationForm";
import { CompletionMessage } from "@/components/evaluation/CompletionMessage";
import { SampleRevealScreen } from "@/components/evaluation/SampleRevealScreen";
import { useEvaluation } from "@/contexts/EvaluationContext";
import { ProductType } from "@/types";

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

  useEffect(() => {
    const initializeEvaluation = async () => {
      // Učitaj prvi tip proizvoda i njegove uzorke
      console.log("Initializing evaluation with event ID:", eventId);
      const hasProductTypes = await loadNextProductType(eventId);
      console.log("loadNextProductType result:", hasProductTypes);
      setInitialized(true);
      
      if (!hasProductTypes) {
        // Ako nema tipova proizvoda, ocjenjivanje je završeno
        console.log("No product types available for evaluation");
      }
    };

    if (!initialized) {
      initializeEvaluation();
    }
  }, [eventId, loadNextProductType, initialized]);

  const handleReturn = () => {
    navigate("/evaluator");
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

  if (!initialized) {
    return (
      <Card className="my-8">
        <CardContent className="p-6 text-center">
          <p>Priprema evaluacije...</p>
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
