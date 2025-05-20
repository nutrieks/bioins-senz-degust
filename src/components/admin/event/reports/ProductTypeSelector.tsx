
import { useState } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductType } from "@/types";

interface ProductTypeSelectorProps {
  productTypes: ProductType[];
  selectedProductType: string | null;
  onProductTypeChange: (value: string) => void;
}

export function ProductTypeSelector({ 
  productTypes, 
  selectedProductType, 
  onProductTypeChange 
}: ProductTypeSelectorProps) {
  return (
    <div className="w-full sm:w-64">
      <Select
        value={selectedProductType || ""}
        onValueChange={onProductTypeChange}
        disabled={productTypes.length === 0}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Odaberite tip proizvoda" />
        </SelectTrigger>
        <SelectContent>
          {productTypes.map((type) => (
            <SelectItem key={type.id} value={type.id}>
              {type.productName} ({type.baseCode})
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
