
import React, { useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { JAR_LABELS, JAR_COLORS, captureElementAsImage } from "./utils";

interface JARChartProps {
  data: any[];
  attrData: any;
  productName: string;
}

export function JARChart({ data, attrData, productName }: JARChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);

  const handleDownloadChartImage = async () => {
    if (!chartRef.current) return;
    
    await captureElementAsImage(
      chartRef.current, 
      `JAR_${attrData.nameEN.replace(/\s/g, "_")}_${productName}_chart.png`
    );
  };

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
      
      <div 
        ref={chartRef}
        className="bg-white p-8 rounded-lg shadow"
      >
        <div className="text-center mb-6">
          <h4 className="font-bold text-xl mb-2">Consumer's reaction to specific attribute</h4>
          <p className="text-sm mb-1">Method: JAR scale</p>
          <p className="text-sm mb-1">Sample: {productName}</p>
          <p className="text-sm mb-4">Attribute: {attrData.nameEN}</p>
        </div>
        
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 80,
                bottom: 50
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                tick={{ fontSize: 12 }}
                label={{ value: 'No. of votes', position: 'insideBottom', offset: -5 }}
              />
              <YAxis 
                dataKey="name"
                tick={{ fontSize: 12 }}
                width={70}
              />
              <Tooltip 
                contentStyle={{ color: 'black' }} 
                formatter={(value, name) => [value, name]}
                labelFormatter={(label) => `Sample: ${label}`}
              />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                wrapperStyle={{ bottom: -15 }}
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
                    position="right"
                    style={{ fill: 'black', fontSize: 12 }} 
                    formatter={(value: number) => value > 0 ? value : ''}
                  />
                </Bar>
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
