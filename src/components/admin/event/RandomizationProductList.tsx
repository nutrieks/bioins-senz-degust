
import { Button } from "@/components/ui/button";
import { ProductType } from "@/types";
import { Shuffle, Eye } from "lucide-react";

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
        {productTypes.map((productType) => {
          const samplesWithBlindCodes = productType.samples.filter(s => s.blindCode);
          const allSamplesHaveBlindCodes = productType.samples.length > 0 && samplesWithBlindCodes.length === productType.samples.length;
          
          return (
            <div 
              key={productType.id} 
              className="flex justify-between items-center p-3 border rounded-md"
            >
              <div className="flex flex-col">
                <span className="font-medium">{productType.productName}</span>
                <span className="text-sm text-muted-foreground">
                  Šifra: {productType.baseCode} | Uzorci: {productType.samples.length}
                </span>
                {productType.samples.length > 0 && (
                  <div className="text-xs text-muted-foreground mt-1">
                    <span>Šifre uzoraka: </span>
                    {productType.samples.map((sample, index) => (
                      <span key={sample.id} className={sample.blindCode ? "text-green-600" : "text-orange-600"}>
                        {sample.blindCode || `${productType.baseCode}${index + 1}*`}
                        {index < productType.samples.length - 1 ? ", " : ""}
                      </span>
                    ))}
                    {!allSamplesHaveBlindCodes && (
                      <span className="text-orange-600 ml-1">(*će biti dodijeljeno)</span>
                    )}
                  </div>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {productType.hasRandomization ? (
                  <Button 
                    onClick={() => onViewRandomization(productType)}
                    className="flex items-center"
                    variant="outline"
                  >
                    <Eye className="mr-1 h-4 w-4" />
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
          );
        })}
      </div>
    </div>
  );
}
