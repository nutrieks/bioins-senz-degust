import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BaseProductType, RetailerCode } from "@/types";
import { XCircle, Plus, ChevronUp } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useNavigate } from "react-router-dom";
interface AddProductTypeFormProps {
  isLoadingProductTypes: boolean;
  availableProductTypes: BaseProductType[];
  showAddProductForm: boolean;
  selectedProductTypeId: string;
  baseCode: string;
  customerCode: string;
  sampleCount: number;
  samples: Array<{
    brand: string;
    retailerCode: RetailerCode;
  }>;
  isUpdating: boolean;
  onSelectedProductTypeIdChange: (id: string) => void;
  onBaseCodeChange: (code: string) => void;
  onCustomerCodeChange: (code: string) => void;
  onSampleCountChange: (count: number) => void;
  onBrandChange: (index: number, value: string) => void;
  onRetailerChange: (index: number, value: RetailerCode) => void;
  onAddSample: () => void;
  onRemoveSample: (index: number) => void;
  onToggleAddProductForm: () => void;
  onAddProductType: () => void;
}
export function AddProductTypeForm({
  isLoadingProductTypes,
  availableProductTypes,
  showAddProductForm,
  selectedProductTypeId,
  baseCode,
  customerCode,
  sampleCount,
  samples,
  isUpdating,
  onSelectedProductTypeIdChange,
  onBaseCodeChange,
  onCustomerCodeChange,
  onSampleCountChange,
  onBrandChange,
  onRetailerChange,
  onAddSample,
  onRemoveSample,
  onToggleAddProductForm,
  onAddProductType
}: AddProductTypeFormProps) {
  const navigate = useNavigate();

  // Define retailer options
  const retailerOptions = [{
    value: RetailerCode.LI,
    label: "Lidl (LI)"
  }, {
    value: RetailerCode.KL,
    label: "Kaufland (KL)"
  }, {
    value: RetailerCode.KO,
    label: "Konzum (KO)"
  }, {
    value: RetailerCode.IS,
    label: "Interspar (IS)"
  }, {
    value: RetailerCode.PL,
    label: "Plodine (PL)"
  }, {
    value: RetailerCode.ES,
    label: "Eurospin (ES)"
  }, {
    value: RetailerCode.M,
    label: "Marka \"M\""
  }];
  const toggleButton = <Button onClick={onToggleAddProductForm} variant={showAddProductForm ? "default" : "outline"} className="flex items-center">
      {showAddProductForm ? <>
          <ChevronUp className="mr-2 h-4 w-4" />
          Sakrij formu
        </> : <>
          <Plus className="mr-2 h-4 w-4" />
          Dodaj tip proizvoda
        </>}
    </Button>;
  if (!showAddProductForm) {
    return toggleButton;
  }
  return <div className="mt-6 border rounded-md p-4 space-y-4 bg-muted/30">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Dodaj novi tip proizvoda</h3>
        {toggleButton}
      </div>
      
      {isLoadingProductTypes ? <div className="text-center p-4">Učitavanje tipova proizvoda...</div> : availableProductTypes.length === 0 ? <div>
          <p className="mb-4">Nema dostupnih tipova proizvoda za dodavanje.</p>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline">Kreiraj novi tip proizvoda</Button>
            </SheetTrigger>
            <SheetContent side="right" className="sm:max-w-md">
              <SheetHeader>
                <SheetTitle>Novi tip proizvoda</SheetTitle>
                <SheetDescription>
                  Kreirajte novi tip proizvoda koji će biti dostupan za sve događaje.
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6">
                <p>Ovdje bi bila forma za kreiranje novog tipa proizvoda...</p>
                <div className="mt-4">
                  <Button onClick={() => navigate("/admin/products/new")} className="w-full">
                    Otvori punu formu za dodavanje
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div> : <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productType">Odaberite tip proizvoda</Label>
              <select id="productType" value={selectedProductTypeId} onChange={e => onSelectedProductTypeIdChange(e.target.value)} className="w-full px-3 py-2 border rounded-md bg-slate-950">
                {availableProductTypes.map(type => <option key={type.id} value={type.id}>
                    {type.productName}
                  </option>)}
              </select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="customerCode">Šifra kupca (4 znamenke)</Label>
              <Input id="customerCode" value={customerCode} onChange={e => onCustomerCodeChange(e.target.value)} placeholder="npr. 4581" maxLength={4} />
            </div>
          
            <div className="space-y-2">
              <Label htmlFor="baseCode">Šifra uzorka</Label>
              <Input id="baseCode" value={baseCode} onChange={e => onBaseCodeChange(e.target.value.toUpperCase())} placeholder="npr. A, B, C, AA, AB..." className="uppercase" />
              <p className="text-xs text-muted-foreground">
                Možete koristiti slova poput A, B, C ili kombinacije AA, AB, itd.
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="sampleCount">Broj uzoraka</Label>
              <Input id="sampleCount" type="number" min={1} max={10} value={sampleCount} onChange={e => onSampleCountChange(parseInt(e.target.value))} />
            </div>
          </div>
          
          <div className="space-y-3">
            <Label>Uzorci</Label>
            {samples.map((sample, index) => <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                <div className="md:col-span-3">
                  <Label htmlFor={`brand-${index}`} className="text-sm">
                    Naziv brenda/proizvođača
                  </Label>
                  <Input id={`brand-${index}`} value={sample.brand} onChange={e => onBrandChange(index, e.target.value)} placeholder="npr. Gavrilović" />
                </div>
                <div className="md:col-span-1">
                  <Label htmlFor={`retailer-${index}`} className="text-sm">
                    Trgovina
                  </Label>
                  <select id={`retailer-${index}`} value={sample.retailerCode} onChange={e => onRetailerChange(index, e.target.value as RetailerCode)} className="w-full px-3 py-2 border rounded-md bg-slate-950">
                    {retailerOptions.map(option => <option key={option.value} value={option.value}>
                        {option.label}
                      </option>)}
                  </select>
                </div>
                <div className="md:col-span-1">
                  <Button type="button" variant="outline" size="icon" onClick={() => onRemoveSample(index)} disabled={samples.length <= 1}>
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>
              </div>)}
            
            {samples.length < 10 && <Button type="button" variant="outline" onClick={onAddSample} className="mt-2">
                <Plus className="mr-2 h-4 w-4" />
                Dodaj uzorak
              </Button>}
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onToggleAddProductForm}>
              Odustani
            </Button>
            <Button onClick={onAddProductType} disabled={isUpdating}>
              Dodaj
            </Button>
          </div>
        </div>}
    </div>;
}