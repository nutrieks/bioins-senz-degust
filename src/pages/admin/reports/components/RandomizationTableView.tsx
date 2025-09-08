
import React, { useRef } from "react";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Printer, FileDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { toPng } from "html-to-image";
import { ProductType, Randomization } from "@/types";

interface RandomizationTableViewProps {
  randomization: Randomization;
  selectedProductType: ProductType;
}

export function RandomizationTableView({ 
  randomization, 
  selectedProductType 
}: RandomizationTableViewProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  // Create an array of position numbers (1-12)
  const positions = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // Determine how many rounds/distributions we have if randomization exists
  const rounds = selectedProductType?.samples.length || 0;
  
  // Create an array of round numbers (1 to rounds)
  const roundNumbers = Array.from({ length: rounds }, (_, i) => i + 1);

  const handlePrintRandomizationTable = () => {
    window.print();
  };

  const handleExportRandomizationTable = async () => {
    if (!tableRef.current) return;
    
    try {
      const dataUrl = await toPng(tableRef.current, {
        backgroundColor: "#fff",
        pixelRatio: 4,
        cacheBust: true
      });
      
      const link = document.createElement('a');
      link.download = `randomizacija_${selectedProductType.baseCode}_${new Date().toISOString().split('T')[0]}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error generating image:", error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom generiranja slike tablice.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-4 print:space-y-2">
      <div className="flex justify-between items-center print:hidden">
        <h3 className="text-lg font-medium">
          Tablica randomizacije: {selectedProductType.productName}
        </h3>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePrintRandomizationTable}
            className="flex items-center"
          >
            <Printer className="mr-2 h-4 w-4" />
            Ispiši
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportRandomizationTable}
            className="flex items-center"
          >
            <FileDown className="mr-2 h-4 w-4" />
            Preuzmi sliku
          </Button>
        </div>
      </div>
      
      <div 
        ref={tableRef} 
        className="print-container print-safe print-text-black bg-white p-5 rounded-lg"
      >
        <h1 className="text-xl font-bold mb-4 text-center">
          {selectedProductType.productName} - {selectedProductType.baseCode}
        </h1>
        
        <div className="overflow-x-auto">
          <Table>
            <TableCaption>
              Randomizacija za {selectedProductType.productName}
            </TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Dijeljenje / Mjesto</TableHead>
                {positions.map((position) => (
                  <TableHead key={position} className="text-center">Mjesto {position}</TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {roundNumbers.map((round) => (
                <TableRow key={round}>
                  <TableCell className="font-medium">Dijeljenje {round}</TableCell>
                  {positions.map((position) => (
                    <TableCell key={position} className="text-center">
                      {randomization.table[position]?.[round] || "-"}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        <div className="mt-6 text-sm">
          <p className="font-medium">Legenda:</p>
          <ul className="list-disc pl-5 mt-2">
            {selectedProductType.samples.map((sample, index) => (
              <li key={index} className="mt-1">
                {sample.blindCode}: {sample.brand} ({sample.retailerCode})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
