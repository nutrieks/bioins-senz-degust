
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductType } from "@/types";
import { ProductTypesList } from "./ProductTypesList";
import { AddProductTypeForm } from "./AddProductTypeForm";
import { BaseProductType, RetailerCode } from "@/types";

interface ProductTypesTabProps {
  productTypes: ProductType[];
  showAddProductForm: boolean;
  isLoadingProductTypes: boolean;
  availableProductTypes: BaseProductType[];
  selectedProductTypeId: string;
  baseCode: string;
  customerCode: string;
  sampleCount: number;
  samples: Array<{ brand: string; retailerCode: RetailerCode }>;
  isUpdating: boolean;
  onViewRandomization: (productType: ProductType) => void;
  onGenerateRandomization: (productTypeId: string) => void;
  onToggleAddProductForm: () => void;
  onSelectedProductTypeIdChange: (id: string) => void;
  onBaseCodeChange: (code: string) => void;
  onCustomerCodeChange: (code: string) => void;
  onSampleCountChange: (count: number) => void;
  onBrandChange: (index: number, value: string) => void;
  onRetailerChange: (index: number, value: RetailerCode) => void;
  onAddSample: () => void;
  onRemoveSample: (index: number) => void;
  onAddProductType: () => void;
  onEditProductType?: (productTypeId: string, customerCode: string, baseCode: string) => void;
  onDeleteProductType?: (productTypeId: string) => void;
}

export function ProductTypesTab({
  productTypes,
  showAddProductForm,
  isLoadingProductTypes,
  availableProductTypes,
  selectedProductTypeId,
  baseCode,
  customerCode,
  sampleCount,
  samples,
  isUpdating,
  onViewRandomization,
  onGenerateRandomization,
  onToggleAddProductForm,
  onSelectedProductTypeIdChange,
  onBaseCodeChange,
  onCustomerCodeChange,
  onSampleCountChange,
  onBrandChange,
  onRetailerChange,
  onAddSample,
  onRemoveSample,
  onAddProductType,
  onEditProductType,
  onDeleteProductType,
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
            
            <AddProductTypeForm
              isLoadingProductTypes={isLoadingProductTypes}
              availableProductTypes={availableProductTypes}
              showAddProductForm={showAddProductForm}
              selectedProductTypeId={selectedProductTypeId}
              baseCode={baseCode}
              customerCode={customerCode}
              sampleCount={sampleCount}
              samples={samples}
              isUpdating={isUpdating}
              onSelectedProductTypeIdChange={onSelectedProductTypeIdChange}
              onBaseCodeChange={onBaseCodeChange}
              onCustomerCodeChange={onCustomerCodeChange}
              onSampleCountChange={onSampleCountChange}
              onBrandChange={onBrandChange}
              onRetailerChange={onRetailerChange}
              onAddSample={onAddSample}
              onRemoveSample={onRemoveSample}
              onToggleAddProductForm={onToggleAddProductForm}
              onAddProductType={onAddProductType}
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Dodani tipovi proizvoda</h3>
              <AddProductTypeForm
                isLoadingProductTypes={isLoadingProductTypes}
                availableProductTypes={availableProductTypes}
                showAddProductForm={showAddProductForm}
                selectedProductTypeId={selectedProductTypeId}
                baseCode={baseCode}
                customerCode={customerCode}
                sampleCount={sampleCount}
                samples={samples}
                isUpdating={isUpdating}
                onSelectedProductTypeIdChange={onSelectedProductTypeIdChange}
                onBaseCodeChange={onBaseCodeChange}
                onCustomerCodeChange={onCustomerCodeChange}
                onSampleCountChange={onSampleCountChange}
                onBrandChange={onBrandChange}
                onRetailerChange={onRetailerChange}
                onAddSample={onAddSample}
                onRemoveSample={onRemoveSample}
                onToggleAddProductForm={onToggleAddProductForm}
                onAddProductType={onAddProductType}
              />
            </div>
            
            <ProductTypesList 
              productTypes={productTypes} 
              onViewRandomization={onViewRandomization} 
              onGenerateRandomization={onGenerateRandomization}
              onEditProductType={onEditProductType}
              onDeleteProductType={onDeleteProductType}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
