
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ProductType } from "@/types";
import { Printer, FileDown, ChevronLeft, ChevronRight } from "lucide-react";

interface RandomizationTableProps {
  selectedProductType: ProductType;
  randomizationTable: any;
  onNavigateNext: () => void;
  onNavigatePrev: () => void;
  onExport: () => void;
  onPrint: () => void;
  onBack: () => void;
  productTypeIndex: number;
  totalProductTypes: number;
}

export function RandomizationTable({
  selectedProductType,
  randomizationTable,
  onNavigateNext,
  onNavigatePrev,
  onExport,
  onPrint,
  onBack,
  productTypeIndex,
  totalProductTypes,
}: RandomizationTableProps) {
  return (
    <div className="space-y-4 print:space-y-2">
      <div className="flex justify-between items-center print:hidden">
        <div className="flex items-center">
          <h3 className="text-lg font-medium">
            Tablica randomizacije: {selectedProductType.productName}
            <span className="ml-2 text-sm text-muted-foreground">
              (Šifra: {selectedProductType.baseCode})
            </span>
          </h3>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPrint}
            className="flex items-center"
          >
            <Printer className="mr-2 h-4 w-4" />
            Ispiši
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onExport}
            className="flex items-center"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Preuzmi CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onBack}
          >
            Natrag
          </Button>
        </div>
      </div>
      
      {totalProductTypes > 1 && (
        <div className="flex justify-between items-center p-2 border rounded mb-4 print:hidden">
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigatePrev}
            disabled={productTypeIndex === 0}
            className="flex items-center"
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Prethodni proizvod
          </Button>
          
          <div className="px-4 py-2 bg-muted rounded text-sm">
            {productTypeIndex + 1} / {totalProductTypes}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={onNavigateNext}
            disabled={productTypeIndex === totalProductTypes - 1}
            className="flex items-center"
          >
            Sljedeći proizvod
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
      
      <div className="print:text-black">
        <h1 className="text-xl font-bold mb-2 text-center hidden print:block">
          {selectedProductType.productName} - {selectedProductType.baseCode}
        </h1>
        
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>
              Randomizacija za {selectedProductType.productName}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Mjesto</TableHead>
                {selectedProductType.samples.map((_, index) => (
                  <TableHead key={index}>Dijeljenje {index + 1}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 12 }, (_, i) => i + 1).map((position) => (
                <TableRow key={position}>
                  <TableCell className="font-medium">{position}</TableCell>
                  {selectedProductType.samples.map((_, round) => (
                    <TableCell key={round}>
                      {randomizationTable?.[position]?.[round + 1] || "-"}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 text-sm text-muted-foreground print:text-black">
          <p>Legenda:</p>
          <ul className="list-disc pl-5 mt-1">
            {selectedProductType.samples.map((sample, index) => (
              <li key={index}>
                {sample.blindCode}: {sample.brand} ({sample.retailerCode})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
