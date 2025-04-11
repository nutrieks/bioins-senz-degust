
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";

interface CompletionMessageProps {
  onReturn: () => void;
}

export function CompletionMessage({ onReturn }: CompletionMessageProps) {
  return (
    <Card className="max-w-md mx-auto my-16">
      <CardHeader className="text-center">
        <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
        <CardTitle className="text-2xl">Ocjenjivanje završeno</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center">
          Uspješno ste završili ocjenjivanje svih uzoraka. Hvala na sudjelovanju!
        </p>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button onClick={onReturn}>Povratak na početnu</Button>
      </CardFooter>
    </Card>
  );
}
