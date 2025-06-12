
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductType } from "@/types";
import { ProductTypesList } from "./ProductTypesList";
import { AddProductTypeForm } from "./AddProductTypeForm";
import { BaseProductType, RetailerCode } from "@/types";

interface ProductTypesTabProps {
  productTypes: ProductType[];
  refreshEventData: () => Promise<void>;
}

export function ProductTypesTab({
  productTypes,
  refreshEventData,
}: ProductTypesTabProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tipovi proizvoda</CardTitle>
        <CardDescription>
          Upravljanje tipovima proizvoda i uzorcima za ovaj događaj.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {productTypes.length === 0 ? (
          <div className="text-center p-6 border rounded-lg">
            <p className="text-muted-foreground mb-4">Nema dodanih tipova proizvoda.</p>
            <p className="text-sm text-muted-foreground">
              Dodajte tipove proizvoda da biste mogli generirati randomizacije.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Dodani tipovi proizvoda</h3>
            </div>
            
            <ProductTypesList 
              productTypes={productTypes} 
              onRefresh={refreshEventData}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
