
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface CompletionMessageProps {
  onReturn: () => void;
}

export function CompletionMessage({ onReturn }: CompletionMessageProps) {
  return (
    <Card className="my-8 max-w-lg mx-auto">
      <CardContent className="p-8 flex flex-col items-center text-center">
        <CheckCircle className="h-16 w-16 text-primary mb-4" />
        <h2 className="text-2xl font-bold mb-4">Ocjenjivanje završeno</h2>
        <p className="text-muted-foreground mb-6">
          Završili ste s ocjenjivanjem za danas. Hvala na vašem sudjelovanju!
        </p>
        <Button size="lg" onClick={onReturn}>
          Povratak na početnu
        </Button>
      </CardContent>
    </Card>
  );
}
