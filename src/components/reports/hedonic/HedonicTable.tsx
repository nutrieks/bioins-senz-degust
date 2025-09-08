
import React, { useRef } from 'react';
import { HedonicReport } from '@/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toPng } from "html-to-image";
import { formatSampleLabel, processChartData } from './utils';

interface HedonicTableProps {
  report: HedonicReport;
  productName: string;
}

export function HedonicTable({ report, productName }: HedonicTableProps) {
  const tableRef = useRef<HTMLDivElement>(null);
  const { sortedSamples, colorMap, textColorMap } = processChartData(report);
  
  // Download table image
  const handleDownloadTableImage = async () => {
    if (tableRef.current) {
      const dataUrl = await toPng(tableRef.current, {
        backgroundColor: "#fff",
        pixelRatio: 4,
        cacheBust: true,
        style: { fontFamily: "inherit" }
      });
      const link = document.createElement('a');
      link.download = `hedonic_table_${productName}.png`;
      link.href = dataUrl;
      link.click();
    }
  };
  
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-end mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadTableImage}
            className="flex items-center"
          >
            <Download className="mr-2 h-4 w-4" /> Preuzmi sliku (tablica)
          </Button>
        </div>

        <div 
          ref={tableRef}
          className="print-container print-safe print-text-black bg-white p-5 rounded-lg shadow"
        >
          <div className="mb-3 text-center print-text-black">
            <h4 className="font-bold text-lg mb-1 print-text-black">Preference data: overall and attribute liking</h4>
            <p className="text-sm print-text-black">Method: 9-point hedonic scale</p>
            <p className="text-sm print-text-black">Sample: {productName}</p>
            <p className="text-sm mb-3 print-text-black">Values: mean</p>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold text-center print-text-black print-bg-white">Brand</TableHead>
                  <TableHead className="font-bold text-center print-text-black print-bg-white">Appearance</TableHead>
                  <TableHead className="font-bold text-center print-text-black print-bg-white">Odour</TableHead>
                  <TableHead className="font-bold text-center print-text-black print-bg-white">Texture</TableHead>
                  <TableHead className="font-bold text-center print-text-black print-bg-white">Flavour</TableHead>
                  <TableHead className="font-bold text-center print-text-black print-bg-white">Overall liking</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedSamples.map(([id, sample]) => {
                  const bgColor = colorMap.get(id) || "";
                  const textColor = textColorMap.get(id) || "#000";
                  
                  return (
                    <TableRow key={id}>
                      <TableCell 
                        className="font-medium print-text-black table-cell-colored"
                        style={{ 
                          backgroundColor: bgColor,
                          color: textColor
                        }}
                      >
                        {formatSampleLabel(sample)}
                      </TableCell>
                      <TableCell 
                        className="text-center print-text-black table-cell-colored"
                        style={{ backgroundColor: bgColor, color: textColor }}
                      >
                        {sample.appearance.mean.toFixed(1)}
                      </TableCell>
                      <TableCell 
                        className="text-center print-text-black table-cell-colored"
                        style={{ backgroundColor: bgColor, color: textColor }}
                      >
                        {sample.odor.mean.toFixed(1)}
                      </TableCell>
                      <TableCell 
                        className="text-center print-text-black table-cell-colored"
                        style={{ backgroundColor: bgColor, color: textColor }}
                      >
                        {sample.texture.mean.toFixed(1)}
                      </TableCell>
                      <TableCell 
                        className="text-center print-text-black table-cell-colored"
                        style={{ backgroundColor: bgColor, color: textColor }}
                      >
                        {sample.flavor.mean.toFixed(1)}
                      </TableCell>
                      <TableCell 
                        className="text-center print-text-black table-cell-colored"
                        style={{ backgroundColor: bgColor, color: textColor }}
                      >
                        {sample.overallLiking.mean.toFixed(1)}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
