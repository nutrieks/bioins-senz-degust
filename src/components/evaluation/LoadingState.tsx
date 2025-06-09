
import { useEffect, useState } from "react";
import { EvaluatorLayout } from "@/components/layout/EvaluatorLayout";

export function LoadingState() {
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    // Pokažij timeout poruku nakon 8 sekundi
    const timer = setTimeout(() => {
      setShowTimeout(true);
    }, 8000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <EvaluatorLayout>
      <div className="flex flex-col justify-center items-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-lg">Učitavanje...</p>
        
        {showTimeout && (
          <div className="text-center space-y-2 mt-4">
            <p className="text-sm text-yellow-600">
              Učitavanje traje duže nego obično...
            </p>
            <p className="text-xs text-muted-foreground">
              Molimo osvježite stranicu ako se problem nastavi.
            </p>
          </div>
        )}
      </div>
    </EvaluatorLayout>
  );
}
