
import { Button } from "@/components/ui/button";
import { ProductType } from "@/types";
import { Shuffle } from "lucide-react";

interface ProductTypesListProps {
  productTypes: ProductType[];
  onViewRandomization: (productType: ProductType) => void;
}

export function ProductTypesList({
  productTypes,
  onViewRandomization,
}: ProductTypesListProps) {
  return (
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
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onViewRandomization(productType)}
              className="flex items-center"
            >
              <Shuffle className="mr-1 h-4 w-4" />
              Randomizacija
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
