
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
    
    // Larger dimensions for complete chart capture
    const width = 2000;
    const height = 1400;
    
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
        className="bg-white p-8 rounded-lg shadow"
        style={{
          width: '100%',
          maxWidth: 2000,
          height: 1400,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          paddingTop: '60px',
          paddingBottom: '60px',
          paddingLeft: '60px',
          paddingRight: '60px'
        }}
      >
        {/* Title and description */}
        <div className="text-center mb-8">
          <h4 className="font-bold text-2xl mb-2">Consumer's reaction to specific attribute</h4>
          <p className="text-lg mb-1">Method: JAR scale</p>
          <p className="text-lg mb-1">Sample: {productName}</p>
          <p className="text-lg mb-4">Attribute: {attrData.nameEN}</p>
        </div>
        
        <div className="flex-1 flex items-center justify-center" style={{ minHeight: 1000, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 50,
                right: 160,
                left: 80,
                bottom: 180
              }}
              barGap={25}
              barCategoryGap={80}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                tick={{ fontSize: 16 }}
                domain={[0, 'dataMax + 2']}
                label={{ value: 'No. of votes', position: 'insideBottom', offset: -10, fontSize: 16, fontWeight: 'bold' }}
              />
              <YAxis 
                dataKey="name"
                tick={{ fontSize: 18 }}
                width={150}
              />
              <Tooltip 
                contentStyle={{ color: 'black', fontSize: '16px', fontWeight: 'bold' }} 
                formatter={(value, name) => [value, name]}
                labelFormatter={(label) => `Sample: ${label}`}
              />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                wrapperStyle={{ bottom: -10, lineHeight: '40px', fontSize: '16px', fontWeight: 'bold' }}
                formatter={(value, entry) => <span style={{ color: 'black', fontSize: '16px', fontWeight: 'bold' }}>{value}</span>}
              />
              {JAR_LABELS.map((label, index) => (
                <Bar
                  key={label}
                  dataKey={label}
                  name={label}
                  fill={JAR_COLORS[index]}
                  maxBarSize={80}
                >
                  <LabelList 
                    dataKey={label} 
                    position="right"
                    style={{ fill: 'black', fontSize: 18, fontWeight: 'bold' }} 
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
