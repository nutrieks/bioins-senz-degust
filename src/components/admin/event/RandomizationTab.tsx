
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductType } from "@/types";
import { RandomizationProductList } from "./RandomizationProductList";
import { RandomizationTable } from "./RandomizationTable";

interface RandomizationTabProps {
  productTypes: ProductType[];
  randomizationView: boolean;
  selectedProductType: ProductType | null;
  randomizationTable: any;
  onViewRandomization: (productType: ProductType) => void;
  onGenerateRandomization: (productTypeId: string) => void;
  onPrintRandomizationTable: () => void;
  onExportRandomizationTable: () => void;
  onBackFromRandomization: () => void;
  onNavigateToNextProductType: () => void;
  onNavigateToPrevProductType: () => void;
}

export function RandomizationTab({
  productTypes,
  randomizationView,
  selectedProductType,
  randomizationTable,
  onViewRandomization,
  onGenerateRandomization,
  onPrintRandomizationTable,
  onExportRandomizationTable,
  onBackFromRandomization,
  onNavigateToNextProductType,
  onNavigateToPrevProductType,
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
        ) : randomizationView && selectedProductType ? (
          <RandomizationTable 
            selectedProductType={selectedProductType}
            randomizationTable={randomizationTable}
            onNavigateNext={onNavigateToNextProductType}
            onNavigatePrev={onNavigateToPrevProductType}
            onExport={onExportRandomizationTable}
            onPrint={onPrintRandomizationTable}
            onBack={onBackFromRandomization}
            productTypeIndex={productTypes.findIndex(pt => pt.id === selectedProductType.id)}
            totalProductTypes={productTypes.length}
          />
        ) : (
          <RandomizationProductList 
            productTypes={productTypes}
            onViewRandomization={onViewRandomization}
            onGenerateRandomization={onGenerateRandomization}
          />
        )}
      </CardContent>
    </Card>
  );
}
