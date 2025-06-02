
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
    
    // Povećane dimenzije za bolje hvatanje cijelog grafa
    const width = 2200;
    const height = 1600;
    
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
          maxWidth: 2200,
          height: 1600,
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          paddingTop: '80px',
          paddingBottom: '80px',
          paddingLeft: '80px',
          paddingRight: '80px'
        }}
      >
        {/* Title and description */}
        <div className="text-center mb-12">
          <h4 className="font-bold text-3xl mb-3">Consumer's reaction to specific attribute</h4>
          <p className="text-xl mb-2">Method: JAR scale</p>
          <p className="text-xl mb-2">Sample: {productName}</p>
          <p className="text-xl mb-6">Attribute: {attrData.nameEN}</p>
        </div>
        
        <div className="flex-1 flex items-center justify-center" style={{ minHeight: 1200, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 60,
                right: 200,
                left: 120,
                bottom: 200
              }}
              barGap={25}
              barCategoryGap={80}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                tick={{ fontSize: 18 }}
                domain={[0, 'dataMax + 2']}
                label={{ value: 'No. of votes', position: 'insideBottom', offset: -15, fontSize: 18, fontWeight: 'bold' }}
              />
              <YAxis 
                dataKey="name"
                tick={{ fontSize: 20 }}
                width={180}
              />
              <Tooltip 
                contentStyle={{ color: 'black', fontSize: '18px', fontWeight: 'bold' }} 
                formatter={(value, name) => [value, name]}
                labelFormatter={(label) => `Sample: ${label}`}
              />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                wrapperStyle={{ bottom: -15, lineHeight: '40px', fontSize: '18px', fontWeight: 'bold' }}
                formatter={(value, entry) => <span style={{ color: 'black', fontSize: '18px', fontWeight: 'bold' }}>{value}</span>}
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
                    style={{ fill: 'black', fontSize: 20, fontWeight: 'bold' }} 
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
