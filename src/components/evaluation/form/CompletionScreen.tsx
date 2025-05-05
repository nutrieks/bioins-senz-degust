
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface CompletionScreenProps {
  onContinue: () => void;
}

export function CompletionScreen({ onContinue }: CompletionScreenProps) {
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
        <Button className="mt-6" onClick={onContinue}>
          Povratak na početnu
        </Button>
      </CardContent>
    </Card>
  );
}
