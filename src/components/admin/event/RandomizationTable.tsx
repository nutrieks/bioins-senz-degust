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
import { Printer, Image, ChevronLeft, ChevronRight, FileDown } from "lucide-react";
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
          size: A4 landscape;
          margin: 1cm;
        }
        body {
          min-width: 100%;
          width: 100%;
          -webkit-print-color-adjust: exact;
          print-color-adjust: exact;
        }
        .print-container {
          width: 100%;
          max-width: none;
        }
        table {
          page-break-inside: avoid;
          width: 100%;
          table-layout: fixed;
          font-size: 0.65rem !important;
        }
        th, td {
          padding: 2px !important;
          font-size: 0.65rem !important;
          border: 1px solid #000 !important;
          background-color: white !important;
          color: black !important;
        }
        .print-hide {
          display: none !important;
        }
        .legend-container {
          margin-top: 0.5cm;
          font-size: 0.6rem !important;
        }
        .legend-item {
          padding: 1px !important;
          margin: 1px !important;
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
        width: 1400,  // Increased width for better fit
        height: 800,  // Increased height
        style: {
          transform: 'scale(1)',
          transformOrigin: 'top left',
        }
      });
      
      const link = document.createElement('a');
      link.download = `randomizacija_${selectedProductType.baseCode}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error generating image:", error);
    }
  };

  const handleExportCSV = () => {
    // Create CSV content using the correct table structure
    let csvContent = "Pozicija,";
    roundNumbers.forEach(round => {
      csvContent += `Dijeljenje ${round},`;
    });
    csvContent = csvContent.slice(0, -1) + "\n";

    // Add data rows - use the table structure from randomization data
    positions.forEach(position => {
      csvContent += `Mjesto ${position},`;
      roundNumbers.forEach(round => {
        // Get value from the table structure in randomization data
        const value = randomizationTable?.table?.[position]?.[round] || 
                     randomizationTable?.[position]?.[round] || 
                     "-";
        csvContent += `${value},`;
      });
      csvContent = csvContent.slice(0, -1) + "\n";
    });

    // Add legend
    csvContent += "\nLegenda uzoraka:\n";
    selectedProductType.samples.forEach(sample => {
      csvContent += `${sample.blindCode},${sample.brand},${sample.retailerCode}\n`;
    });

    // Add metadata
    csvContent += `\nUkupno uzoraka:,${selectedProductType.samples.length}\n`;
    csvContent += `Generirano:,${new Date().toLocaleDateString('hr-HR')}\n`;
    csvContent += `Tip proizvoda:,${selectedProductType.productName}\n`;
    csvContent += `Šifra:,${selectedProductType.baseCode}\n`;

    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `randomizacija_${selectedProductType.baseCode}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
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
      <div className="flex justify-between items-center print-hide">
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
            onClick={handleExportCSV}
            className="flex items-center"
          >
            <FileDown className="mr-2 h-4 w-4" />
            CSV/Excel
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportImage}
            className="flex items-center"
          >
            <Image className="mr-2 h-4 w-4" />
            Slika
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
        <div className="flex justify-between items-center p-2 border rounded mb-4 print-hide">
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
        className="print-container print-safe print-text-black bg-white p-4 rounded-lg overflow-x-auto"
      >
        <div className="text-center mb-4 font-bold text-lg print-text-black">
          Randomizacija: {selectedProductType.productName} ({selectedProductType.baseCode})
        </div>
        
        <Table className="w-full border-collapse border-2 border-black">
          <TableHeader>
            <TableRow>
              <TableHead className="text-center py-2 px-2 text-sm font-bold border border-black print-text-black print-bg-white" style={{width: "120px"}}>
                Dijeljenje / Mjesto
              </TableHead>
              {positions.map((position) => (
                <TableHead key={position} className="text-center py-2 px-2 text-sm font-bold border border-black print-text-black print-bg-white" style={{width: "70px"}}>
                  Mjesto {position}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {roundNumbers.map((round) => (
              <TableRow key={round}>
                <TableCell className="font-medium text-center py-2 px-2 text-sm border border-black print-text-black print-bg-white">
                  Dijeljenje {round}
                </TableCell>
                {positions.map((position) => (
                  <TableCell key={position} className="text-center py-2 px-2 text-sm border border-black font-mono font-bold print-text-black print-bg-white">
                    {randomizationTable?.table?.[position]?.[round] || 
                     randomizationTable?.[position]?.[round] || 
                     "-"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        
        <div className="legend-container mt-6 border-t pt-4">
          <h4 className="font-semibold text-sm mb-3">Legenda uzoraka:</h4>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-1">
            {selectedProductType.samples.map((sample) => (
              <div key={sample.id} className="legend-item flex items-center p-2 bg-muted/30 rounded text-xs">
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
