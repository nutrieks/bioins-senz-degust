
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
        pixelRatio: 4,
        cacheBust: true,
        style: { fontFamily: "inherit" }
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
        className="bg-white p-5 rounded-lg shadow w-full flex flex-col items-center" 
        style={{
          width: '100%',
          maxWidth: 950,
          margin: '0 auto'
        }}
      >
        {/* Title and description */}
        <div className="mb-3 text-center">
          <h4 className="font-bold text-lg mb-1">Consumer's reaction to specific attribute</h4>
          <p className="text-sm">Method: JAR scale</p>
          <p className="text-sm">Sample: {productName}</p>
          <p className="text-sm mb-1">Attribute: {attrData.nameEN}</p>
        </div>
        
        {/* Chart */}
        <ResponsiveContainer width="100%" height={500}>
          <BarChart
            data={data}
            margin={{
              top: 30,
              right: 40,
              left: 60,
              bottom: 60
            }}
            barCategoryGap="25%"
            barGap={3}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis 
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={60}
              tick={{ fontSize: 11 }}
              interval={0}
            />
            <YAxis 
              domain={[0, 12]}
              ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
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
        
        {/* Custom Legend */}
        <div
          className="flex flex-wrap justify-center items-center gap-3 mt-4"
          style={{ fontSize: 15, marginBottom: 7 }}
        >
          {JAR_LABELS.map((label, index) => (
            <span className="flex items-center gap-2" key={label}>
              <span
                className="inline-block rounded-[3px]"
                style={{
                  width: 22,
                  height: 17,
                  backgroundColor: JAR_COLORS[index],
                  border: "1px solid #aaa",
                  display: "inline-block"
                }}
              />
              <span style={{ color: "#111", fontWeight: 500 }}>{label}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
