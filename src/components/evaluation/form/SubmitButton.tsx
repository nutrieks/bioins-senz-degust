
import { Button } from "@/components/ui/button";
import { Sample } from "@/types";

interface SubmitButtonProps {
  isSubmitting: boolean;
  currentSample: Sample | null;
}

export function SubmitButton({ isSubmitting, currentSample }: SubmitButtonProps) {
  if (!currentSample) return null;
  
  return (
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
  );
}
