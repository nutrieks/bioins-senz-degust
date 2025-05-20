
import { Event, ProductType } from "@/types";

interface ProductTypeSelectorProps {
  selectedEvent: Event | null;
  selectedProductType: ProductType | null;
  onProductTypeSelect: (productType: ProductType) => void;
}

export function ProductTypeSelector({ 
  selectedEvent, 
  selectedProductType, 
  onProductTypeSelect 
}: ProductTypeSelectorProps) {
  if (!selectedEvent) {
    return null;
  }
  
  return (
    <div className="flex-1 p-4 border rounded-md">
      <h3 className="text-lg font-medium mb-3">Tipovi proizvoda</h3>
      {selectedEvent.productTypes && selectedEvent.productTypes.length === 0 ? (
        <p className="text-muted-foreground">
          Ovaj događaj nema tipova proizvoda.
        </p>
      ) : (
        <div className="space-y-2">
          {selectedEvent.productTypes && selectedEvent.productTypes.map((productType) => (
            <button
              key={productType.id}
              onClick={() => onProductTypeSelect(productType)}
              className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                selectedProductType?.id === productType.id 
                  ? "bg-primary text-primary-foreground" 
                  : "hover:bg-muted"
              }`}
            >
              <div className="flex justify-between items-center">
                <span>{productType.productName}</span>
                <span className="text-sm">
                  Šifra: {productType.baseCode}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
