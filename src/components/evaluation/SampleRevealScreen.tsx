
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Sample } from "@/types";

interface SampleRevealScreenProps {
  productName: string;
  samples: Sample[];
  onContinue: () => void;
}

export function SampleRevealScreen({
  productName,
  samples,
  onContinue
}: SampleRevealScreenProps) {
  // Sort samples by blind code for better display
  const sortedSamples = [...samples].sort((a, b) => {
    if (!a.blindCode || !b.blindCode) return 0;
    return a.blindCode.localeCompare(b.blindCode);
  });

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-2xl shadow-lg bg-card/30 backdrop-blur-md">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl font-bold">Otkrivanje uzoraka</CardTitle>
          <CardDescription className="text-lg font-medium text-foreground">
            {productName}
          </CardDescription>
          <p className="text-sm text-muted-foreground mt-2">
            Završili ste ocjenjivanje svih uzoraka za ovaj tip proizvoda
          </p>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-semibold">Šifra</TableHead>
                <TableHead className="font-semibold">Proizvođač/Marka</TableHead>
                <TableHead className="font-semibold">Trgovina</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSamples.map((sample) => (
                <TableRow key={sample.id} className="hover:bg-muted/50">
                  <TableCell className="font-medium text-primary">{sample.blindCode}</TableCell>
                  <TableCell>{sample.brand}</TableCell>
                  <TableCell className="text-muted-foreground">{sample.retailerCode}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="flex justify-center mt-8">
            <Button size="lg" className="px-8 font-medium" onClick={onContinue}>
              Nastavi ocjenjivanje
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
