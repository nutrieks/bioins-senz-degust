
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
      `JAR_${attrData.nameEN.replace(/\s/g, "_")}_${productName}_chart.png`,
      1400,
      900
    );
  };

  console.log("JAR Chart received data:", data);
  console.log("JAR Chart received attrData:", attrData);
  console.log("JAR Chart productName:", productName);

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
      
      <div 
        ref={chartRef}
        className="bg-white p-8 rounded-lg shadow"
        style={{ width: '100%', minHeight: '600px' }}
      >
        <div className="text-center mb-6">
          <h4 className="font-bold text-xl mb-2">Consumer's reaction to specific attribute</h4>
          <p className="text-sm mb-1">Method: JAR scale</p>
          <p className="text-sm mb-1">Sample: {productName}</p>
          <p className="text-sm mb-4">Attribute: {attrData.nameEN}</p>
        </div>
        
        <div style={{ width: '100%', height: 450 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="horizontal"
              margin={{
                top: 20,
                right: 100,
                left: 120,
                bottom: 80
              }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} />
              <XAxis 
                type="number"
                tick={{ fontSize: 12 }}
                domain={[0, 'dataMax']}
                label={{ value: 'No. of votes', position: 'insideBottom', offset: -10, fontSize: 14 }}
              />
              <YAxis 
                type="category"
                dataKey="name"
                tick={{ fontSize: 12 }}
                width={110}
                interval={0}
              />
              <Tooltip 
                contentStyle={{ 
                  color: 'black', 
                  backgroundColor: 'white',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }} 
                formatter={(value: number, name: string) => [value, name]}
                labelFormatter={(label) => `Brand: ${label}`}
              />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}
              />
              {JAR_LABELS.map((label, index) => (
                <Bar
                  key={label}
                  dataKey={label}
                  name={label}
                  fill={JAR_COLORS[index]}
                  stackId="jar"
                >
                  <LabelList 
                    dataKey={label} 
                    position="right"
                    style={{ fill: 'black', fontSize: 11, fontWeight: 'bold' }} 
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
