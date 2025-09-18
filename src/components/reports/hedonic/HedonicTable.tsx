
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
        pixelRatio: 8,
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
          className="print-container print-safe bg-white p-4 rounded-lg shadow"
        >
          <div className="mb-4 text-center text-black">
            <h4 className="font-extrabold text-2xl mb-2 text-black" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>Preference data: overall and attribute liking</h4>
            <p className="text-lg font-semibold text-black">Method: 9-point hedonic scale</p>
            <p className="text-lg font-semibold text-black">Sample: {productName}</p>
            <p className="text-lg font-semibold mb-4 text-black">Values: mean</p>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-extrabold text-lg text-center text-black bg-white">Attribute</TableHead>
                  {sortedSamples.map(([id, sample]) => {
                    const bgColor = colorMap.get(id) || "";
                    const textColor = textColorMap.get(id) || "#000";
                    
                    return (
                      <TableHead 
                        key={id}
                        className="font-extrabold text-lg text-center table-cell-colored"
                        style={{ 
                          backgroundColor: bgColor,
                          color: textColor,
                          backgroundImage: 'none',
                          ['--cell-bg' as any]: bgColor,
                          ['--cell-fg' as any]: textColor
                        }}
                      >
                        {formatSampleLabel(sample)}
                      </TableHead>
                    );
                  })}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-extrabold text-lg text-black bg-white">Appearance</TableCell>
                  {sortedSamples.map(([id, sample]) => {
                    const bgColor = colorMap.get(id) || "";
                    const textColor = textColorMap.get(id) || "#000";
                    
                    return (
                      <TableCell 
                        key={id}
                        className="text-center text-lg font-bold table-cell-colored"
                        style={{ 
                          backgroundColor: bgColor, 
                          color: textColor,
                          backgroundImage: 'none',
                          ['--cell-bg' as any]: bgColor,
                          ['--cell-fg' as any]: textColor
                        }}
                      >
                        {sample.appearance.mean.toFixed(1)}
                      </TableCell>
                    );
                  })}
                </TableRow>
                <TableRow>
                  <TableCell className="font-extrabold text-lg text-black bg-white">Odour</TableCell>
                  {sortedSamples.map(([id, sample]) => {
                    const bgColor = colorMap.get(id) || "";
                    const textColor = textColorMap.get(id) || "#000";
                    
                    return (
                      <TableCell 
                        key={id}
                        className="text-center text-lg font-bold table-cell-colored"
                        style={{ 
                          backgroundColor: bgColor, 
                          color: textColor,
                          backgroundImage: 'none',
                          ['--cell-bg' as any]: bgColor,
                          ['--cell-fg' as any]: textColor
                        }}
                      >
                        {sample.odor.mean.toFixed(1)}
                      </TableCell>
                    );
                  })}
                </TableRow>
                <TableRow>
                  <TableCell className="font-extrabold text-lg text-black bg-white">Texture</TableCell>
                  {sortedSamples.map(([id, sample]) => {
                    const bgColor = colorMap.get(id) || "";
                    const textColor = textColorMap.get(id) || "#000";
                    
                    return (
                      <TableCell 
                        key={id}
                        className="text-center text-lg font-bold table-cell-colored"
                        style={{ 
                          backgroundColor: bgColor, 
                          color: textColor,
                          backgroundImage: 'none',
                          ['--cell-bg' as any]: bgColor,
                          ['--cell-fg' as any]: textColor
                        }}
                      >
                        {sample.texture.mean.toFixed(1)}
                      </TableCell>
                    );
                  })}
                </TableRow>
                <TableRow>
                  <TableCell className="font-extrabold text-lg text-black bg-white">Flavour</TableCell>
                  {sortedSamples.map(([id, sample]) => {
                    const bgColor = colorMap.get(id) || "";
                    const textColor = textColorMap.get(id) || "#000";
                    
                    return (
                      <TableCell 
                        key={id}
                        className="text-center text-lg font-bold table-cell-colored"
                        style={{ 
                          backgroundColor: bgColor, 
                          color: textColor,
                          backgroundImage: 'none',
                          ['--cell-bg' as any]: bgColor,
                          ['--cell-fg' as any]: textColor
                        }}
                      >
                        {sample.flavor.mean.toFixed(1)}
                      </TableCell>
                    );
                  })}
                </TableRow>
                <TableRow>
                  <TableCell className="font-extrabold text-lg text-black bg-white">Overall liking</TableCell>
                  {sortedSamples.map(([id, sample]) => {
                    const bgColor = colorMap.get(id) || "";
                    const textColor = textColorMap.get(id) || "#000";
                    
                    return (
                      <TableCell 
                        key={id}
                        className="text-center text-lg font-bold table-cell-colored"
                        style={{ 
                          backgroundColor: bgColor, 
                          color: textColor,
                          backgroundImage: 'none',
                          ['--cell-bg' as any]: bgColor,
                          ['--cell-fg' as any]: textColor
                        }}
                      >
                        {sample.overallLiking.mean.toFixed(1)}
                      </TableCell>
                    );
                  })}
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
