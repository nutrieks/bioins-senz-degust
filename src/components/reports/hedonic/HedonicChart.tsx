
import React, { useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toPng } from "html-to-image";
import { HedonicReport } from "@/types";
import { processChartData } from "./utils";

interface HedonicChartProps {
  report: HedonicReport;
  productName: string;
}

export function HedonicChart({ report, productName }: HedonicChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  const handleDownloadChartImage = async () => {
    if (chartRef.current) {
      const dataUrl = await toPng(chartRef.current, {
        backgroundColor: "#fff",
        pixelRatio: 3,
        cacheBust: true,
        style: { fontFamily: "inherit" },
      });
      const link = document.createElement('a');
      link.download = `Hedonic_${productName}_chart.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  const { chartData, sortedSamples, colorMap, textColorMap, attributes } = processChartData(report);

  return (
    <div className="mb-6">
      <div className="flex justify-end mb-4">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDownloadChartImage}
          className="flex items-center"
        >
          <Download className="mr-2 h-4 w-4" /> Preuzmi graf
        </Button>
      </div>
      
      {/* Chart container for export and display */}
      <div ref={chartRef} className="print-container print-safe print-text-black bg-white p-6">
        <div 
          className="rounded-lg shadow mx-auto" 
          style={{ width: '100%', maxWidth: 1400 }}
        >
          {/* Title and description */}
          <div className="mb-4 text-center">
            <h4 className="font-bold text-lg mb-1">Preference data: overall and attribute liking</h4>
            <p className="text-sm">Method: 9-point hedonic scale</p>
            <p className="text-sm">Sample: {productName}</p>
            <p className="text-sm mb-1">Plot of: mean</p>
          </div>
          
          {/* Chart */}
          <div className="w-full">
            <ResponsiveContainer width="100%" height={800}>
               <BarChart
                data={chartData}
                margin={{
                  top: 40,
                  right: 50,
                  left: 80,
                  bottom: 80
                }}
                barCategoryGap="10%"
                barGap={0}
              >
                <CartesianGrid stroke="black" strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name"
                  tick={{ fontSize: 11, fontWeight: 'bold', fill: 'black' }}
                  interval={0}
                />
                <YAxis 
                  domain={[0, 9]}
                  ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]}
                  tick={{ fontSize: 11, fill: 'black' }}
                  label={{ value: 'Liking (points)', angle: -90, position: 'insideLeft', fontSize: 13, fill: 'black' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    color: 'black', 
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }} 
                  formatter={(value: number, name: string) => [value.toFixed(1), name]}
                  labelFormatter={(label) => `Attribute: ${label}`}
                />
                {sortedSamples.map(([id, sample]) => {
                  const sampleKey = `${sample.retailerCode} ${sample.brand}_${id}`;
                  const color = colorMap.get(id) || "#000";
                  const textColor = textColorMap.get(id) || "#000";
                  
                  return (
                    <Bar
                      key={sampleKey}
                      dataKey={sampleKey}
                      name={`${sample.retailerCode} ${sample.brand}`}
                      fill={color}
                    >
                      <LabelList 
                        dataKey={sampleKey} 
                        position="top"
                        style={{ fill: 'black', fontSize: 10, fontWeight: 'bold' }} 
                        formatter={(value: number) => value > 0 ? value.toFixed(1) : ''}
                      />
                    </Bar>
                  );
                })}
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Custom Legend */}
          <div className="flex flex-wrap justify-center items-center gap-3 mt-4" style={{ fontSize: 15 }}>
            {sortedSamples.map(([id, sample]) => {
              const color = colorMap.get(id) || "#000";
              const textColor = textColorMap.get(id) || "#000";
              
              return (
                <span className="flex items-center gap-2" key={id}>
                  <span
                    className="inline-block rounded-[3px]"
                    style={{
                      width: 22,
                      height: 17,
                      backgroundColor: color,
                      border: "1px solid #000",
                      display: "inline-block"
                    }}
                  />
                  <span style={{ color: "#111", fontWeight: 500 }}>
                    {`${sample.retailerCode} ${sample.brand}`}
                  </span>
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
