
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertTriangle } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  isError?: boolean;
}

export function LoadingState({ 
  message = "Učitavanje...", 
  isError = false 
}: LoadingStateProps) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardContent className="flex flex-col items-center justify-center p-8 text-center">
          {isError ? (
            <AlertTriangle className="h-12 w-12 text-amber-500 mb-4" />
          ) : (
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          )}
          <p className="text-lg font-medium mb-2">
            {isError ? "Ocjenjivanje nije dostupno" : "Učitavanje"}
          </p>
          <p className="text-muted-foreground">
            {message}
          </p>
          {isError && (
            <p className="text-sm text-muted-foreground mt-4">
              Molimo kontaktirajte administratora za više informacija.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
