
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ProductType, RetailerCode } from "@/types";
import { Shuffle, Edit, Trash2, Save, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ProductTypesListProps {
  productTypes: ProductType[];
  onRefresh: () => Promise<void>;
  onEditProductType?: (productTypeId: string, customerCode: string, baseCode: string) => void;
  onDeleteProductType?: (productTypeId: string) => void;
}

export function ProductTypesList({
  productTypes,
  onRefresh,
  onEditProductType,
  onDeleteProductType,
}: ProductTypesListProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editCustomerCode, setEditCustomerCode] = useState("");
  const [editBaseCode, setEditBaseCode] = useState("");

  const handleStartEdit = (productType: ProductType) => {
    setEditingId(productType.id);
    setEditCustomerCode(productType.customerCode);
    setEditBaseCode(productType.baseCode);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditCustomerCode("");
    setEditBaseCode("");
  };

  const handleSaveEdit = () => {
    if (editingId && onEditProductType) {
      onEditProductType(editingId, editCustomerCode, editBaseCode);
      setEditingId(null);
      setEditCustomerCode("");
      setEditBaseCode("");
    }
  };

  const validateEdit = () => {
    return editCustomerCode.length === 4 && 
           /^\d{4}$/.test(editCustomerCode) && 
           editBaseCode.trim() !== "";
  };

  return (
    <div className="space-y-2">
      {productTypes.map((productType) => (
        <div 
          key={productType.id} 
          className="flex justify-between items-center p-3 border rounded-md"
        >
          <div className="flex flex-col flex-1">
            <span className="font-medium">{productType.productName}</span>
            {editingId === productType.id ? (
              <div className="mt-2 grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor={`customer-${productType.id}`} className="text-xs">
                    Šifra kupca
                  </Label>
                  <Input
                    id={`customer-${productType.id}`}
                    value={editCustomerCode}
                    onChange={(e) => setEditCustomerCode(e.target.value)}
                    placeholder="4 broja"
                    maxLength={4}
                    className="h-8"
                  />
                </div>
                <div>
                  <Label htmlFor={`base-${productType.id}`} className="text-xs">
                    Šifra uzorka
                  </Label>
                  <Input
                    id={`base-${productType.id}`}
                    value={editBaseCode}
                    onChange={(e) => setEditBaseCode(e.target.value)}
                    placeholder="Šifra"
                    className="h-8"
                  />
                </div>
              </div>
            ) : (
              <span className="text-sm text-muted-foreground">
                Šifra: {productType.baseCode} | Kupac: {productType.customerCode} | Uzorci: {productType.samples.length}
              </span>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            {editingId === productType.id ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleSaveEdit}
                  disabled={!validateEdit()}
                  className="flex items-center"
                >
                  <Save className="mr-1 h-4 w-4" />
                  Spremi
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleCancelEdit}
                  className="flex items-center"
                >
                  <X className="mr-1 h-4 w-4" />
                  Odustani
                </Button>
              </>
            ) : (
              <>
                {productType.hasRandomization ? (
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled
                    className="flex items-center"
                  >
                    <Shuffle className="mr-1 h-4 w-4" />
                    Randomizacija
                  </Button>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={productType.samples.length === 0}
                    className="flex items-center"
                  >
                    <Shuffle className="mr-1 h-4 w-4" />
                    Randomizacija
                  </Button>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleStartEdit(productType)}
                  className="flex items-center"
                >
                  <Edit className="mr-1 h-4 w-4" />
                  Uredi
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="flex items-center text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Obriši
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Jeste li sigurni?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Ova akcija će trajno obrisati tip proizvoda "{productType.productName}" 
                        s šifrom "{productType.baseCode}" i sve povezane uzorke, JAR atribute i 
                        randomizacije. Ova akcija se ne može poništiti.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Odustani</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => onDeleteProductType?.(productType.id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Obriši
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
