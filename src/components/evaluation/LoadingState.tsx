
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, AlertTriangle, RotateCcw } from "lucide-react";

interface LoadingStateProps {
  message?: string;
  isError?: boolean;
  onRestart?: () => void;
  error?: string | null;
}

export function LoadingState({ 
  message = "Učitavanje...", 
  isError = false,
  onRestart,
  error
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
            {isError ? "Greška pri učitavanju" : "Učitavanje"}
          </p>
          <p className="text-muted-foreground mb-4">
            {isError ? (error || "Došlo je do greške pri dohvaćanju podataka") : message}
          </p>
          
          {isError && onRestart && (
            <Button 
              onClick={onRestart}
              variant="outline" 
              className="mb-4"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              Pokušaj ponovno
            </Button>
          )}
          
          {isError && (
            <p className="text-sm text-muted-foreground">
              Molimo kontaktirajte administratora ako se greška nastavi pojavljivati.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
