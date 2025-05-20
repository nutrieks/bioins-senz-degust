
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
    
    // Add a fixed width and height for consistency
    const width = 950;
    const height = 600;
    
    await captureElementAsImage(
      chartRef.current, 
      `JAR_${attrData.nameEN.replace(/\s/g, "_")}_${productName}_chart.png`,
      width,
      height
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
        className="bg-white p-5 rounded-lg shadow"
        style={{
          width: '100%',
          maxWidth: 950,
          height: 600,
          margin: '0 auto'
        }}
      >
        {/* Title and description (part of image) */}
        <div className="text-center mb-4">
          <h4 className="font-bold text-lg mb-1">Consumer's reaction to specific attribute</h4>
          <p className="text-sm">Method: JAR scale</p>
          <p className="text-sm">Sample: {productName}</p>
          <p className="text-sm mb-3">Attribute: {attrData.nameEN}</p>
        </div>
        
        <div style={{ height: 500 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 70
              }}
              barGap={2}
              barCategoryGap={20}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis 
                label={{ value: 'No. of votes', angle: -90, position: 'insideLeft' }}
                domain={[0, 12]}
                ticks={[0, 2, 4, 6, 8, 10, 12]}
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
                wrapperStyle={{ bottom: -10, lineHeight: '40px', color: 'black' }}
                formatter={(value, entry) => <span style={{ color: 'black' }}>{value}</span>}
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
                    style={{ fill: 'black', fontSize: 14 }}
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
