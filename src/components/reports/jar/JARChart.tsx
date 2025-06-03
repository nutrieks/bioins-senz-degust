
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
        className="bg-white rounded-lg shadow"
        style={{ 
          width: '1000px', 
          height: '1200px', 
          margin: '0 auto',
          padding: '40px 30px 30px 30px'
        }}
      >
        <div className="text-center mb-8">
          <h4 className="font-bold text-xl mb-3">Consumer's reaction to specific attribute</h4>
          <p className="text-sm mb-2">Method: JAR scale</p>
          <p className="text-sm mb-2">Sample: {productName}</p>
          <p className="text-sm mb-6">Attribute: {attrData.nameEN}</p>
        </div>
        
        <div style={{ width: '100%', height: '1000px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 30,
                right: 40,
                left: 60,
                bottom: 180
              }}
              barCategoryGap="25%"
              barGap={3}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name"
                angle={-45}
                textAnchor="end"
                height={150}
                tick={{ fontSize: 11 }}
                interval={0}
              />
              <YAxis 
                tick={{ fontSize: 11 }}
                label={{ value: 'No. of votes', angle: -90, position: 'insideLeft', fontSize: 13 }}
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
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                wrapperStyle={{ paddingTop: '30px', fontSize: '11px' }}
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
                    style={{ fill: 'black', fontSize: 10, fontWeight: 'bold' }} 
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
