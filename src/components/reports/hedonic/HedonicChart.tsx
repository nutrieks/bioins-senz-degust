
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
  const chartExportRef = useRef<HTMLDivElement>(null);

  const handleDownloadChartImage = async () => {
    if (chartExportRef.current) {
      const dataUrl = await toPng(chartExportRef.current, {
        backgroundColor: "#fff",
        pixelRatio: 4,
        cacheBust: true,
        style: { fontFamily: "inherit" },
        width: 900,
        height: 700
      });
      const link = document.createElement('a');
      link.download = `Hedonic_${productName}_chart.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  const { chartData, sortedSamples, colorMap, textColorMap, attributes } = processChartData(report);

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
      
      {/* Export container with fixed dimensions */}
      <div 
        ref={chartExportRef}
        style={{
          width: 900,
          height: 700,
          backgroundColor: '#ffffff',
          padding: '30px',
          position: 'absolute',
          left: '-9999px',
          top: '-9999px'
        }}
      >
        {/* Title and description */}
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <h4 style={{ fontWeight: 'bold', fontSize: '18px', marginBottom: '8px' }}>Preference data: overall and attribute liking</h4>
          <p style={{ fontSize: '14px', margin: '4px 0' }}>Method: 9-point hedonic scale</p>
          <p style={{ fontSize: '14px', margin: '4px 0' }}>Sample: {productName}</p>
          <p style={{ fontSize: '14px', margin: '4px 0' }}>Plot of: mean</p>
        </div>
        
        {/* Chart */}
        <div style={{ width: '840px', height: '500px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 30,
                right: 30,
                left: 60,
                bottom: 60
              }}
              barCategoryGap="25%"
              barGap={3}
            >
              <XAxis 
                dataKey="name"
                tick={{ fontSize: 11, fontWeight: 'bold' }}
                interval={0}
              />
              <YAxis 
                domain={[0, 9]}
                ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]}
                tick={{ fontSize: 11 }}
                label={{ value: 'Liking (points)', angle: -90, position: 'insideLeft', fontSize: 13 }}
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
                      style={{ fill: 'black', fontSize: 10, fontWeight: 'bold' }} 
                      formatter={(value: number) => value > 0 ? value.toFixed(1) : ''}
                    />
                  </Bar>
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Custom Legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '20px', fontSize: '15px' }}>
          {sortedSamples.map(([id, sample]) => {
            const color = colorMap.get(id) || "#000";
            const textColor = textColorMap.get(id) || "#000";
            
            return (
              <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }} key={id}>
                <span
                  style={{
                    width: 22,
                    height: 17,
                    backgroundColor: color,
                    border: "1px solid #aaa",
                    display: "inline-block",
                    borderRadius: '3px'
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

      {/* Display container for web view */}
      <div className="bg-white p-6 rounded-lg shadow mx-auto" style={{ width: '100%', maxWidth: 900 }}>
        {/* Title and description */}
        <div className="mb-4 text-center">
          <h4 className="font-bold text-lg mb-1">Preference data: overall and attribute liking</h4>
          <p className="text-sm">Method: 9-point hedonic scale</p>
          <p className="text-sm">Sample: {productName}</p>
          <p className="text-sm mb-1">Plot of: mean</p>
        </div>
        
        {/* Chart */}
        <div className="w-full">
          <ResponsiveContainer width="100%" height={500}>
            <BarChart
              data={chartData}
              margin={{
                top: 30,
                right: 30,
                left: 60,
                bottom: 60
              }}
              barCategoryGap="25%"
              barGap={3}
            >
              <XAxis 
                dataKey="name"
                tick={{ fontSize: 11, fontWeight: 'bold' }}
                interval={0}
              />
              <YAxis 
                domain={[0, 9]}
                ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9]}
                tick={{ fontSize: 11 }}
                label={{ value: 'Liking (points)', angle: -90, position: 'insideLeft', fontSize: 13 }}
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
                      style={{ fill: 'black', fontSize: 10, fontWeight: 'bold' }} 
                      formatter={(value: number) => value > 0 ? value.toFixed(1) : ''}
                    />
                  </Bar>
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Custom Legend */}
        <div className="flex flex-wrap justify-center items-center gap-3 mt-4" style={{ fontSize: 15 }}>
          {sortedSamples.map(([id, sample]) => {
            const color = colorMap.get(id) || "#000";
            const textColor = textColorMap.get(id) || "#000";
            
            return (
              <span className="flex items-center gap-2" key={id}>
                <span
                  className="inline-block rounded-[3px]"
                  style={{
                    width: 22,
                    height: 17,
                    backgroundColor: color,
                    border: "1px solid #aaa",
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
  );
}
