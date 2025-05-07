
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
import { Printer, Image, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef } from "react";
import { toPng } from "html-to-image";

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
  onPrint,
  onBack,
  productTypeIndex,
  totalProductTypes,
}: RandomizationTableProps) {
  // Create an array of position numbers (1-12)
  const positions = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // Determine how many rounds/distributions we have
  const rounds = selectedProductType.samples.length;
  
  // Create an array of round numbers (1 to rounds)
  const roundNumbers = Array.from({ length: rounds }, (_, i) => i + 1);

  const tableRef = useRef<HTMLDivElement>(null);

  const handleExportImage = async () => {
    if (!tableRef.current) return;
    
    try {
      const dataUrl = await toPng(tableRef.current, {
        backgroundColor: "#fff",
        pixelRatio: 2,
        cacheBust: true,
        width: 1200, // Set a wider width for landscape orientation
        height: 800
      });
      
      const link = document.createElement('a');
      link.download = `randomizacija_${selectedProductType.baseCode}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error generating image:", error);
    }
  };

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
            onClick={handleExportImage}
            className="flex items-center"
          >
            <Image className="mr-2 h-4 w-4" />
            Preuzmi sliku
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
      
      <div 
        ref={tableRef} 
        className="print:text-black bg-white p-4 rounded-lg w-full"
        style={{minWidth: "900px"}}
      >
        <h1 className="text-xl font-bold mb-2 text-center">
          {selectedProductType.productName} - {selectedProductType.baseCode}
        </h1>
        
        <div className="overflow-x-auto">
          <Table>
            <TableCaption className="mb-4">
              Randomizacija za {selectedProductType.productName}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Dijeljenje / Mjesto</TableHead>
                {/* Column headers are now positions (1-12) */}
                {positions.map((position) => (
                  <TableHead key={position} className="text-center">Mjesto {position}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Now rows are rounds and columns are positions */}
              {roundNumbers.map((round) => (
                <TableRow key={round}>
                  <TableCell className="font-medium">Dijeljenje {round}</TableCell>
                  {positions.map((position) => (
                    <TableCell key={position} className="text-center">
                      {randomizationTable?.[position]?.[round] || "-"}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-4 text-sm text-black">
          <p className="font-medium">Legenda:</p>
          <ul className="list-disc pl-5 mt-1">
            {selectedProductType.samples.map((sample, index) => (
              <li key={index}>
                {sample.blindCode}: {sample.brand} ({sample.retailerCode})
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Add print-specific styling */}
      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 1cm;
          }
          body {
            min-width: 1000px;
            width: 100%;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
          table {
            page-break-inside: avoid;
            width: 100%;
          }
          .print-container {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
