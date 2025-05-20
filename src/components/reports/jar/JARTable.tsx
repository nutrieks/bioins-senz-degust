
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
    
    // Add a fixed width for consistency
    const width = 950;
    
    await captureElementAsImage(
      tableRef.current,
      `JAR_${attrData.nameEN.replace(/\s/g, "_")}_${productName}_table.png`,
      width
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
        className="bg-white p-5 rounded-lg shadow mb-6"
        style={{
          width: '100%',
          maxWidth: 950,
          margin: '0 auto'
        }}
      >
        <div className="mb-3 text-center">
          <h4 className="font-bold text-lg mb-1">Consumer's reaction to specific attribute</h4>
          <p className="text-sm">Method: JAR scale</p>
          <p className="text-sm">Sample: {productName}</p>
          <p className="text-sm mb-3">Attribute: {attrData.nameEN}</p>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Brand</TableHead>
              {JAR_LABELS.map((label) => (
                <TableHead key={label} className="text-center">{label}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.name}</TableCell>
                {JAR_LABELS.map((label, index) => (
                  <TableCell key={label} className="text-center" style={{ backgroundColor: `${JAR_COLORS[index]}40` }}>
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
