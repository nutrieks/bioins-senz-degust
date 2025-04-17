
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { EvaluatorLayout } from "@/components/layout/EvaluatorLayout";
import { EvaluationForm } from "@/components/evaluation/EvaluationForm";
import { CompletionMessage } from "@/components/evaluation/CompletionMessage";
import { SampleRevealScreen } from "@/components/evaluation/SampleRevealScreen";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { getEvent, getJARAttributes, getProductTypes } from "@/services/dataService";
import { EvaluationProvider, useEvaluation } from "@/contexts/EvaluationContext"; // Added useEvaluation import
import { JARAttribute, ProductType } from "@/types";

export default function Evaluation() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [eventName, setEventName] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [jarAttributes, setJarAttributes] = useState<JARAttribute[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);

  useEffect(() => {
    if (!eventId) {
      navigate("/evaluator");
      return;
    }

    const fetchEventData = async () => {
      try {
        const event = await getEvent(eventId);
        if (!event) {
          navigate("/evaluator");
          return;
        }

        // Set event date
        const date = new Date(event.date);
        setEventDate(date.toLocaleDateString('hr-HR'));
        setEventName(event.date); // Store the full date string for display

        // Dohvati sve tipove proizvoda za događaj
        const types = await getProductTypes(eventId);
        setProductTypes(types);

        // Dohvati JAR atribute za sve tipove proizvoda
        const allAttributes: JARAttribute[] = [];
        for (const productType of types) {
          const attributes = await getJARAttributes(productType.id);
          allAttributes.push(...attributes);
        }
        setJarAttributes(allAttributes);
      } catch (error) {
        console.error("Error fetching event data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventData();
  }, [eventId, navigate]);

  if (isLoading) {
    return (
      <EvaluatorLayout>
        <div className="flex justify-center items-center min-h-[60vh]">
          <p>Učitavanje...</p>
        </div>
      </EvaluatorLayout>
    );
  }

  return (
    <EvaluatorLayout>
      <div className="container">
        <EvaluationProvider jarAttributes={jarAttributes}>
          <EvaluationContent 
            eventId={eventId || ""} 
            eventName={eventName}
            eventDate={eventDate}
            productTypes={productTypes}
          />
        </EvaluationProvider>
      </div>
    </EvaluatorLayout>
  );
}

function EvaluationContent({ 
  eventId, 
  eventName,
  eventDate,
  productTypes
}: { 
  eventId: string; 
  eventName: string;
  eventDate: string;
  productTypes: ProductType[];
}) {
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
      const hasProductTypes = await loadNextProductType(eventId);
      setInitialized(true);
      
      if (!hasProductTypes) {
        // Ako nema tipova proizvoda, ocjenjivanje je završeno
        console.log("No product types available for evaluation");
      }
    };

    if (!initialized) {
      initializeEvaluation();
    }
  }, [eventId, loadNextSample, loadNextProductType, initialized]);

  const handleReturn = () => {
    navigate("/evaluator");
  };

  const handleContinueAfterReveal = async () => {
    // Sakrij ekran za otkrivanje
    setShowSampleReveal(false);
    
    // Učitaj sljedeći tip proizvoda za ocjenjivanje
    const hasMore = await loadNextProductType(eventId);
    
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
    return <CompletionMessage onReturn={handleReturn} />;
  }

  // Ako je završeno ocjenjivanje trenutnog tipa proizvoda, prikaži otkrivanje uzoraka
  if (showSampleReveal && currentProductType) {
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
  return (
    <EvaluationForm 
      eventId={eventId} 
      productTypeId={currentProductType?.id}
      onComplete={handleReturn} 
    />
  );
}
