
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
        width: 1920,
        height: 1080,
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
  
  // Calculate dynamic spacing based on number of samples
  const sampleCount = sortedSamples.length;
  const barCategoryGap = sampleCount <= 5 ? "15%" : sampleCount <= 8 ? "8%" : "3%";

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
      <div ref={chartRef} className="print-container print-safe print-text-black bg-white">
        <div 
          className="w-full h-full flex flex-col"
          style={{ width: '100%', height: '600px', padding: '20px' }}
        >
          {/* Title */}
          <div className="text-center mb-4">
            <h4 className="font-bold text-lg mb-1">Preference data: overall and attribute liking</h4>
            <p className="text-sm">Method: 9-point hedonic scale</p>
            <p className="text-sm">Sample: {productName}</p>
            <p className="text-sm mb-2">Plot of: mean</p>
          </div>
          
          {/* Chart Container */}
          <div className="flex-1 w-full">
            <ResponsiveContainer width="100%" height="85%">
               <BarChart
                data={chartData}
                margin={{
                  top: 10,
                  right: 30,
                  left: 60,
                  bottom: 10
                }}
                barCategoryGap={barCategoryGap}
                barGap={0}
              >
                {/* Grid removed for cleaner export */}
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
                        style={{ 
                          fill: 'black', 
                          fontSize: 16, 
                          fontWeight: 'bold',
                          stroke: 'white',
                          strokeWidth: 2,
                          paintOrder: 'stroke fill'
                        }}
                        formatter={(value: number) => value > 0 ? value.toFixed(1) : ''}
                      />
                    </Bar>
                  );
                })}
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="mt-4 w-full">
            <div className="flex flex-wrap justify-center items-center gap-4" style={{ fontSize: 16 }}>
              {sortedSamples.map(([id, sample]) => {
                const color = colorMap.get(id) || "#000";
                const textColor = textColorMap.get(id) || "#000";
                
                return (
                  <span className="flex items-center gap-2" key={id}>
                    <span
                      className="inline-block rounded-[3px]"
                      style={{
                        width: 24,
                        height: 18,
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
    </div>
  );
}
