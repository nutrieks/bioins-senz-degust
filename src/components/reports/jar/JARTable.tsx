
import React, { useRef } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { JAR_LABELS, JAR_COLORS, captureElementAsImage } from "./utils";

interface JARTableProps {
  data: any[];
  attrData: any;
  productName: string;
}

export function JARTable({ data, attrData, productName }: JARTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);

  const handleDownloadTableImage = async () => {
    if (!tableRef.current) return;
    
    // Increased fixed dimensions for better display
    const width = 1800;
    const height = 1000;
    
    await captureElementAsImage(
      tableRef.current,
      `JAR_${attrData.nameEN.replace(/\s/g, "_")}_${productName}_table.png`,
      width,
      height,
      8
    );
  };

  return (
    <div className="mb-6">
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadTableImage}
          className="flex items-center"
        >
          <Download className="mr-2 h-4 w-4" /> Preuzmi tablicu
        </Button>
      </div>

      <div 
        ref={tableRef}
        className="print-container print-safe print-text-black bg-white p-4 rounded-lg shadow mb-6"
        style={{
          width: '100%',
          maxWidth: 1800,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        <div className="mb-6 text-center print-text-black">
          <h4 className="font-extrabold text-2xl mb-2 print-text-black" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>Consumer's reaction to specific attribute</h4>
          <p className="text-lg font-semibold mb-1 print-text-black">Method: JAR scale</p>
          <p className="text-lg font-semibold mb-1 print-text-black">Sample: {productName}</p>
          <p className="text-lg font-semibold mb-4 print-text-black">Attribute: {attrData.nameEN}</p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xl font-extrabold print-text-black print-bg-white">Brand</TableHead>
              {JAR_LABELS.map((label) => (
                <TableHead key={label} className="text-center text-xl font-extrabold print-text-black print-bg-white">{label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-extrabold text-xl print-text-black print-bg-white">{item.name}</TableCell>
                {JAR_LABELS.map((label, index) => (
                  <TableCell 
                    key={label} 
                    className="text-center text-xl font-bold print-text-black table-cell-colored" 
                    style={{ backgroundColor: `${JAR_COLORS[index]}40` }}
                  >
                    {item[label]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
