import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ProductType } from "@/types";
import { Printer, Image, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useEffect } from "react";
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

  // Add print styles using useEffect instead of style jsx
  useEffect(() => {
    // Create style element for print media
    const style = document.createElement('style');
    style.innerHTML = `
      @media print {
        @page {
          size: landscape;
          margin: 0.5cm;
        }
        body {
          min-width: 100%;
          width: 100%;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        table {
          page-break-inside: avoid;
          width: 100%;
          table-layout: fixed;
        }
        .print-container {
          width: 100%;
        }
        th, td {
          padding: 1px !important;
          font-size: 0.7rem !important;
        }
      }
    `;
    
    // Append to document head
    document.head.appendChild(style);
    
    // Clean up on component unmount
    return () => {
      document.head.removeChild(style);
    };
  }, []); // Run only once on component mount

  const handleExportImage = async () => {
    if (!tableRef.current) return;
    
    try {
      const dataUrl = await toPng(tableRef.current, {
        backgroundColor: "#fff",
        pixelRatio: 2,
        cacheBust: true,
        width: 1200,  // Adjusted width for better fit
        height: 600
      });
      
      const link = document.createElement('a');
      link.download = `randomizacija_${selectedProductType.baseCode}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error generating image:", error);
    }
  };

  // Format the date for display
  const currentDate = new Date().toLocaleDateString('hr-HR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  return (
    <div className="space-y-4 print:space-y-2">
      <div className="flex justify-between items-center print:hidden">
        <div className="flex items-center">
          <h3 className="text-lg font-medium">
            Raspored dijeljenja proizvoda: {selectedProductType.productName}
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
        className="print:text-black bg-white p-2 rounded-lg overflow-x-auto"
      >
        <Table className="w-full border-collapse" style={{tableLayout: "fixed", minWidth: "1100px"}}>
          <TableHeader>
            <TableRow>
              <TableHead className="text-center py-1 px-1 text-xs" style={{width: "100px"}}>
                Dijeljenje / Mjesto
              </TableHead>
              {positions.map((position) => (
                <TableHead key={position} className="text-center py-1 px-1 text-xs" style={{width: "80px"}}>
                  Mjesto {position}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {roundNumbers.map((round) => (
              <TableRow key={round}>
                <TableCell className="font-medium text-center py-1 px-1 text-xs">
                  Dijeljenje {round}
                </TableCell>
                {positions.map((position) => (
                  <TableCell key={position} className="text-center py-1 px-1 text-xs">
                    {randomizationTable?.[position]?.[round] || "-"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="mt-6 border-t pt-4">
          <h4 className="font-semibold text-sm mb-3">Legenda uzoraka:</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {selectedProductType.samples.map((sample) => (
              <div key={sample.id} className="flex items-center p-2 bg-muted/30 rounded text-xs">
                <div className="font-mono font-bold text-primary mr-2 min-w-[2.5rem]">
                  {sample.blindCode}:
                </div>
                <div className="flex-1">
                  <span className="font-medium">{sample.brand}</span>
                  <span className="text-muted-foreground ml-1">({sample.retailerCode})</span>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 text-xs text-muted-foreground">
            <p>Ukupno uzoraka: {selectedProductType.samples.length}</p>
            <p>Generirano: {currentDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
