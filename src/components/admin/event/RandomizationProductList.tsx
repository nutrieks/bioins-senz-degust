
import { Button } from "@/components/ui/button";
import { ProductType } from "@/types";
import { Shuffle } from "lucide-react";

interface RandomizationProductListProps {
  productTypes: ProductType[];
  onViewRandomization: (productType: ProductType) => void;
  onGenerateRandomization: (productTypeId: string) => void;
}

export function RandomizationProductList({
  productTypes,
  onViewRandomization,
  onGenerateRandomization,
}: RandomizationProductListProps) {
  return (
    <div className="space-y-4">
      <p>Odaberite tip proizvoda za koji želite generirati ili pregledati randomizaciju:</p>
      <div className="space-y-2">
        {productTypes.map((productType) => (
          <div 
            key={productType.id} 
            className="flex justify-between items-center p-3 border rounded-md"
          >
            <div className="flex flex-col">
              <span className="font-medium">{productType.productName}</span>
              <span className="text-sm text-muted-foreground">
                Šifra: {productType.baseCode} | Uzorci: {productType.samples.length}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {productType.hasRandomization ? (
                <Button 
                  onClick={() => onViewRandomization(productType)}
                  className="flex items-center"
                >
                  <Shuffle className="mr-1 h-4 w-4" />
                  Pregled randomizacije
                </Button>
              ) : (
                <Button 
                  onClick={() => onGenerateRandomization(productType.id)}
                  disabled={productType.samples.length === 0}
                  className="flex items-center"
                >
                  <Shuffle className="mr-1 h-4 w-4" />
                  Generiraj randomizaciju
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
