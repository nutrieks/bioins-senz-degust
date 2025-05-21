
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
    
    // Još veće fiksne dimenzije za bolji prikaz, osiguravajući vidljivost cijelog grafa
    const width = 1500; // Povećano s 1200 na 1500
    const height = 900; // Povećano s 800 na 900
    
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
          maxWidth: 1500, // Povećano s 1200 na 1500
          height: 900,    // Povećano s 800 na 900
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
        
        <div style={{ height: 800 }}> {/* Povećana visina samog grafa */}
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 120, // Značajno povećane desne margine za osiguranje vidljivosti
                left: 60,
                bottom: 150 // Značajno povećana donja margina za bolje prikazivanje x-osi
              }}
              barGap={15}  // Povećan razmak između grupa stupaca
              barCategoryGap={60} // Povećan razmak između kategorija
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 14 }} // Povećan font
                interval={0}
                textAnchor="end"
                angle={-45} // Rotacija teksta na x-osi za bolje prikazivanje
                height={120} // Značajno više prostora za etikete x-osi
              />
              <YAxis 
                label={{ value: 'No. of votes', angle: -90, position: 'insideLeft', style: { textAnchor: 'middle' } }}
                domain={[0, 'dataMax + 3']} // Više prostora na vrhu grafa
                padding={{ top: 30 }}
                tick={{ fontSize: 14 }} // Povećan font
              />
              <Tooltip 
                contentStyle={{ color: 'black', fontSize: '14px' }} 
                formatter={(value, name) => [value, name]}
                labelFormatter={(label) => `Sample: ${label}`}
              />
              <Legend 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                wrapperStyle={{ bottom: -10, lineHeight: '40px', color: 'black', fontSize: '14px' }}
                formatter={(value, entry) => <span style={{ color: 'black', fontSize: '14px' }}>{value}</span>}
              />
              {JAR_LABELS.map((label, index) => (
                <Bar
                  key={label}
                  dataKey={label}
                  name={label}
                  fill={JAR_COLORS[index]}
                  maxBarSize={100} // Povećana maksimalna širina stupca za bolju vidljivost
                >
                  <LabelList 
                    dataKey={label} 
                    position="top"
                    style={{ fill: 'black', fontSize: 16, fontWeight: 'bold' }} // Povećan font oznaka
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
