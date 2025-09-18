
import React, { useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toPng } from "html-to-image";
import { JAR_LABELS, JAR_COLORS } from "./utils";

interface JARChartProps {
  data: any[];
  attrData: any;
  productName: string;
}

export function JARChart({ data, attrData, productName }: JARChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  const handleDownloadChartImage = async () => {
    if (chartRef.current) {
      const dataUrl = await toPng(chartRef.current, {
        backgroundColor: "#fff",
        pixelRatio: 6,
        cacheBust: true,
        style: { fontFamily: "inherit" },
      });
      const link = document.createElement('a');
      link.download = `JAR_${attrData.nameEN.replace(/\s/g, "_")}_${productName}_chart.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  console.log("JAR Chart received data:", data);
  console.log("JAR Chart received attrData:", attrData);
  console.log("JAR Chart productName:", productName);

  // Calculate dynamic spacing based on number of samples
  const sampleCount = data.length;
  const barCategoryGap = sampleCount <= 5 ? "10%" : sampleCount <= 8 ? "5%" : "2%";

  // Check if we have valid data
  if (!data || data.length === 0) {
    return (
      <div className="mb-6 p-4 border rounded-lg">
        <p className="text-center text-muted-foreground">
          Nema podataka za prikaz JAR grafa
        </p>
      </div>
    );
  }

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
          className="w-full flex flex-col"
          style={{ width: '100%', padding: '12px' }}
        >
          {/* Title */}
          <div className="text-center mb-4">
            <h4 className="font-extrabold text-2xl mb-2" style={{ textShadow: '1px 1px 2px rgba(0,0,0,0.3)' }}>Consumer's reaction to specific attribute</h4>
            <p className="text-lg font-semibold">Method: JAR scale</p>
            <p className="text-lg font-semibold">Sample: {productName}</p>
            <p className="text-lg font-semibold mb-3">Attribute: {attrData.nameEN}</p>
          </div>
          
          {/* Chart Container */}
          <div className="w-full" style={{ height: '500px' }}>
            <ResponsiveContainer width="100%" height="100%">
               <BarChart
                data={data}
                margin={{
                  top: 7,
                  right: 21,
                  left: 42,
                  bottom: 7
                }}
                barCategoryGap={barCategoryGap}
                barGap={0}
              >
                {/* Grid removed for cleaner export */}
                <XAxis 
                  dataKey="name"
                  angle={-45}
                  textAnchor="end"
                  height={60}
                  tick={{ fontSize: 20, fill: 'black' }}
                  interval={0}
                />
                <YAxis 
                  domain={[0, 12]}
                  ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
                  tick={{ fontSize: 20, fill: 'black' }}
                  label={{ value: 'No. of votes', angle: -90, position: 'insideLeft', fontSize: 20, fontWeight: 'bold', fill: 'black' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    color: 'black', 
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }} 
                  formatter={(value: number, name: string) => [value, name]}
                  labelFormatter={(label) => `Brand: ${label}`}
                />
                {JAR_LABELS.map((label, index) => (
                  <Bar
                    key={label}
                    dataKey={label}
                    name={label}
                    fill={JAR_COLORS[index]}
                  >
                    <LabelList 
                      dataKey={label} 
                      position="top"
                      style={{ 
                        fill: 'black', 
                        fontSize: 16, 
                        fontWeight: 'bold',
                        stroke: 'white',
                        strokeWidth: 2,
                        paintOrder: 'stroke fill'
                      }}
                      formatter={(value: number) => value > 0 ? value : ''}
                    />
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Legend */}
          <div className="mt-3 w-full">
            <div className="flex flex-wrap justify-center items-center gap-3" style={{ fontSize: 14 }}>
              {JAR_LABELS.map((label, index) => (
                <span className="flex items-center gap-2" key={label}>
                  <span
                    className="inline-block rounded-[2px]"
                    style={{
                      width: 16,
                      height: 12,
                      backgroundColor: JAR_COLORS[index],
                      border: "2px solid #000",
                      display: "inline-block"
                    }}
                  />
                  <span style={{ color: "#111", fontWeight: 600, textShadow: '0.5px 0.5px 1px rgba(0,0,0,0.2)' }}>{label}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
