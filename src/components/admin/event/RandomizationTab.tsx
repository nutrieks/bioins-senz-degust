
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductType } from "@/types";
import { RandomizationProductList } from "./RandomizationProductList";
import { RandomizationTable } from "./RandomizationTable";

interface RandomizationTabProps {
  productTypes: ProductType[];
  generatingRandomization: { [productTypeId: string]: boolean };
  onGenerateRandomization: (productTypeId: string) => void;
}

export function RandomizationTab({
  productTypes,
  generatingRandomization,
  onGenerateRandomization,
}: RandomizationTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Randomizacija</CardTitle>
        <CardDescription>
          Generiranje i pregled randomizacije uzoraka.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {productTypes.length === 0 ? (
          <div className="text-center p-6 border rounded-lg">
            <p className="text-muted-foreground">
              Nema dodanih tipova proizvoda za koje bi se mogla generirati randomizacija.
            </p>
          </div>
        ) : (
          <RandomizationProductList 
            productTypes={productTypes}
            generatingRandomization={generatingRandomization}
            onGenerateRandomization={onGenerateRandomization}
          />
        )}
      </CardContent>
    </Card>
  );
}
