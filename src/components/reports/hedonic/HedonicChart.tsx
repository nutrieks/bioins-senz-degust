
import React, { useRef } from 'react';
import { HedonicReport } from '@/types';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList, ResponsiveContainer } from "recharts";
import { toPng } from "html-to-image";
import { formatSampleLabel, processChartData } from './utils';

interface HedonicChartProps {
  report: HedonicReport;
  productName: string;
}

export function HedonicChart({ report, productName }: HedonicChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const { chartData, sortedSamples, colorMap } = processChartData(report);

  // Download chart image
  const handleDownloadChartImage = async () => {
    if (chartRef.current) {
      const dataUrl = await toPng(chartRef.current, {
        backgroundColor: "#fff",
        pixelRatio: 4, // Maksimalna kvaliteta slike
        cacheBust: true,
        style: { fontFamily: "inherit" }
      });
      const link = document.createElement('a');
      link.download = `hedonic_chart_${productName}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-end mb-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownloadChartImage}
            className="flex items-center"
          >
            <Download className="mr-2 h-4 w-4" /> Preuzmi sliku (graf)
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
          {/* Naslov i opis (dio slike) */}
          <div className="mb-3 text-center">
            <h4 className="font-bold text-lg mb-1">Preference data: overall and attribute liking</h4>
            <p className="text-sm">Method: 9-point hedonic scale</p>
            <p className="text-sm">Sample: {productName}</p>
            <p className="text-sm mb-1">Plot of: mean</p>
          </div>
          {/* Stvarni graf */}
          <div className="w-full" style={{ height: 410, maxWidth: 870 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 16,
                  right: 24,
                  left: 12,
                  bottom: 42
                }}
                barCategoryGap={30}
                barGap={4}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 16 }} />
                <YAxis
                  label={{ value: 'liking (points)', angle: -90, position: 'insideLeft', fontSize: 15 }}
                  domain={[1, 9]}
                  ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9]}
                  tick={{ fontSize: 15 }}
                />
                <Tooltip contentStyle={{ color: 'black' }} />
                {sortedSamples.map(([id, sample]) => {
                  const labelKey = `${sample.retailerCode} ${sample.brand}_${id}`;
                  return (
                    <Bar 
                      key={id}
                      dataKey={labelKey}
                      name={formatSampleLabel(sample)}
                      fill={colorMap.get(id)}
                      radius={[5, 5, 0, 0]}
                      maxBarSize={60}
                    >
                      <LabelList 
                        dataKey={labelKey} 
                        position="top" 
                        content={(props: any) => {
                          const { x, y, width, height, value } = props;
                          return (
                            <text 
                              x={x + width / 2} 
                              y={y - 4} 
                              fill="black"
                              textAnchor="middle" 
                              fontSize={16}
                              fontWeight={600}
                            >
                              {value?.toFixed(1)}
                            </text>
                          );
                        }}
                      />
                    </Bar>
                  );
                })}
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Legenda ispod grafa */}
          <div
            className="flex flex-wrap justify-center items-center gap-3 mt-1"
            style={{ fontSize: 15, marginBottom: 7 }}
          >
            {sortedSamples.map(([id, sample]) => (
              <span className="flex items-center gap-2" key={id}>
                <span
                  className="inline-block rounded-[3px]"
                  style={{
                    width: 22,
                    height: 17,
                    backgroundColor: colorMap.get(id),
                    border: "1px solid #aaa",
                    display: "inline-block"
                  }}
                />
                <span style={{ color: "#111", fontWeight: 500 }}>{formatSampleLabel(sample)}</span>
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
