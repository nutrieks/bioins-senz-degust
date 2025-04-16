
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getSamples } from "@/services/dataService";
import { Sample } from "@/types";

interface SampleRevealScreenProps {
  eventId: string;
  productTypeId: string;
  productName: string;
  onContinue: () => void;
}

export function SampleRevealScreen({
  eventId,
  productTypeId,
  productName,
  onContinue
}: SampleRevealScreenProps) {
  const [samples, setSamples] = useState<Sample[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadSamples() {
      try {
        const productSamples = await getSamples(productTypeId);
        // Sortiranje uzoraka prema blindCode za pregledniji prikaz
        setSamples(productSamples.sort((a, b) => {
          if (!a.blindCode || !b.blindCode) return 0;
          return a.blindCode.localeCompare(b.blindCode);
        }));
      } catch (error) {
        console.error("Error loading samples for reveal:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadSamples();
  }, [productTypeId]);

  return (
    <Card className="my-8 max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Otkrivanje uzoraka</CardTitle>
        <CardDescription className="text-lg">
          {productName}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <p>Učitavanje...</p>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Šifra</TableHead>
                  <TableHead>Proizvođač/Marka</TableHead>
                  <TableHead>Trgovina</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {samples.map((sample) => (
                  <TableRow key={sample.id}>
                    <TableCell className="font-medium">{sample.blindCode}</TableCell>
                    <TableCell>{sample.brand}</TableCell>
                    <TableCell>{sample.retailerCode}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="flex justify-center mt-8">
              <Button size="lg" className="px-8" onClick={onContinue}>
                Nastavi
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
