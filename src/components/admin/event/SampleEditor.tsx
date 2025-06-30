
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sample, RetailerCode } from "@/types";
import { Plus, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useProductTypeManager } from "@/hooks/useProductTypeManager";

interface SampleEditorProps {
  productTypeId: string;
  samples: Sample[];
  onSamplesUpdate: () => void;
}

export function SampleEditor({ productTypeId, samples, onSamplesUpdate }: SampleEditorProps) {
  const { toast } = useToast();
  const { createSample, isCreatingSample } = useProductTypeManager(productTypeId);
  
  const [isAdding, setIsAdding] = useState(false);
  const [newBrand, setNewBrand] = useState("");
  const [newRetailerCode, setNewRetailerCode] = useState<RetailerCode>(RetailerCode.LI);

  const retailerOptions = [
    { value: RetailerCode.LI, label: "Lidl (LI)" },
    { value: RetailerCode.KL, label: "Kaufland (KL)" },
    { value: RetailerCode.KO, label: "Konzum (KO)" },
    { value: RetailerCode.IS, label: "Interspar (IS)" },
    { value: RetailerCode.PL, label: "Plodine (PL)" },
    { value: RetailerCode.ES, label: "Eurospin (ES)" },
    { value: RetailerCode.M, label: "Marka \"M\"" },
  ];

  const handleAddSample = async () => {
    if (!newBrand.trim()) {
      toast({
        title: "Greška",
        description: "Naziv brenda je obavezan.",
        variant: "destructive",
      });
      return;
    }

    try {
      await createSample({
        productTypeId,
        brand: newBrand.trim(),
        retailerCode: newRetailerCode,
      });
      
      setNewBrand("");
      setNewRetailerCode(RetailerCode.LI);
      setIsAdding(false);
      onSamplesUpdate();
    } catch (error) {
      // Error is already handled by the hook
    }
  };

  const handleCancelAdd = () => {
    setIsAdding(false);
    setNewBrand("");
    setNewRetailerCode(RetailerCode.LI);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Uzorci ({samples.length})</span>
          {!isAdding && (
            <Button
              onClick={() => setIsAdding(true)}
              size="sm"
              className="flex items-center"
            >
              <Plus className="mr-1 h-4 w-4" />
              Dodaj uzorak
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {samples.map((sample, index) => (
          <div key={sample.id} className="flex items-center p-3 border rounded-md">
            <div className="flex-1">
              <div className="font-medium">{sample.brand}</div>
              <div className="text-sm text-muted-foreground">
                {sample.blindCode || `Šifra će biti dodijeljena`} | {sample.retailerCode}
              </div>
            </div>
          </div>
        ))}

        {isAdding && (
          <div className="p-4 border rounded-md bg-muted/30">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="newBrand">Naziv brenda/proizvođača</Label>
                <Input
                  id="newBrand"
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                  placeholder="npr. Gavrilović"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newRetailer">Trgovina</Label>
                <select
                  id="newRetailer"
                  className="w-full px-3 py-2 border rounded-md"
                  value={newRetailerCode}
                  onChange={(e) => setNewRetailerCode(e.target.value as RetailerCode)}
                >
                  {retailerOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancelAdd}
                disabled={isCreatingSample}
              >
                <X className="mr-1 h-4 w-4" />
                Odustani
              </Button>
              <Button
                size="sm"
                onClick={handleAddSample}
                disabled={isCreatingSample}
              >
                <Save className="mr-1 h-4 w-4" />
                {isCreatingSample ? "Dodavanje..." : "Dodaj"}
              </Button>
            </div>
          </div>
        )}

        {samples.length === 0 && !isAdding && (
          <div className="text-center p-6 text-muted-foreground">
            Nema dodanih uzoraka za ovaj tip proizvoda.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
