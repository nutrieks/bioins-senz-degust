
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function ReportsTab() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Izvještaji</CardTitle>
        <CardDescription>
          Pregled i preuzimanje izvještaja o događaju.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-center p-6 border rounded-lg">
          <p className="text-muted-foreground">
            Ova funkcionalnost će biti dostupna uskoro.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
