
import React from "react";
import { HedonicReport } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { RetailerCode } from "@/types";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList, ResponsiveContainer } from "recharts";

interface HedonicReportViewProps {
  report: HedonicReport;
  productName: string;
}

// Define retailer colors
const RETAILER_COLORS: Record<RetailerCode, string> = {
  LI: "rgb(255, 255, 0)", // Lidl: Yellow
  KL: "rgb(255, 0, 0)",   // Kaufland: Red
  KO: "rgb(0, 0, 255)",   // Konzum: Blue
  IS: "rgb(128, 128, 255)", // Interspar: Light Blue
  PL: "rgb(128, 128, 128)", // Plodine: Gray
  ES: "rgb(0, 176, 240)",  // Eurospin: Light Blue
  M: "rgb(0, 255, 0)"      // Marke: Green
};

// Helper function to get a lighter or darker variant of a color for duplicate retailers
const getColorVariant = (color: string, index: number): string => {
  // Parse RGB values
  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return color;
  
  let [, r, g, b] = match.map(Number);
  
  // Adjust brightness based on index (make it lighter)
  const factor = 0.7 + (index * 0.15); // First duplicate is 15% lighter, second is 30% lighter, etc.
  r = Math.min(255, Math.round(r * factor));
  g = Math.min(255, Math.round(g * factor));
  b = Math.min(255, Math.round(b * factor));
  
  return `rgb(${r}, ${g}, ${b})`;
};

// Sort samples according to the required order: LI, KL, KO, IS, PL, ES, M (alphabetical)
const sortSamples = (report: HedonicReport) => {
  const retailerOrder: RetailerCode[] = ["LI", "KL", "KO", "IS", "PL", "ES", "M"];
  
  return Object.entries(report)
    .sort((a, b) => {
      const retailerA = a[1].retailerCode;
      const retailerB = b[1].retailerCode;
      
      // First sort by retailer code order
      const orderA = retailerOrder.indexOf(retailerA);
      const orderB = retailerOrder.indexOf(retailerB);
      
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      
      // If same retailer code, sort alphabetically by brand
      return a[1].brand.localeCompare(b[1].brand);
    });
};

// Process data for the chart
const processChartData = (report: HedonicReport) => {
  const sortedSamples = sortSamples(report);
  
  // Create color map with variant colors for duplicates
  const colorMap = new Map<string, string>();
  const retailerCounts: Record<RetailerCode, number> = {
    LI: 0, KL: 0, KO: 0, IS: 0, PL: 0, ES: 0, M: 0
  };
  
  sortedSamples.forEach(([id, sample]) => {
    const retailerCode = sample.retailerCode;
    const count = retailerCounts[retailerCode]++;
    const baseColor = RETAILER_COLORS[retailerCode];
    const color = count === 0 ? baseColor : getColorVariant(baseColor, count);
    colorMap.set(id, color);
  });
  
  // Create data for the chart
  const attributes = [
    { key: "appearance", label: "Appearance" },
    { key: "odor", label: "Odour" },
    { key: "texture", label: "Texture" },
    { key: "flavor", label: "Flavour" },
    { key: "overallLiking", label: "Overall liking" }
  ];
  
  // Create chart data
  const chartData = attributes.map(attr => {
    const data: any = { name: attr.label };
    
    sortedSamples.forEach(([id, sample]) => {
      const sampleKey = `${sample.brand}_${id}`;
      data[sampleKey] = Number(sample.hedonic[attr.key as keyof typeof sample.hedonic].toFixed(1));
    });
    
    return data;
  });
  
  return { chartData, sortedSamples, colorMap };
};

export function HedonicReportView({ report, productName }: HedonicReportViewProps) {
  if (!report || Object.keys(report).length === 0) {
    return (
      <div className="text-center p-6">
        <p>Nema dostupnih podataka za hedoničku skalu.</p>
      </div>
    );
  }

  const { chartData, sortedSamples, colorMap } = processChartData(report);
  
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Hedonistička skala</h3>
      
      {/* Hedonic Table */}
      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-36">Atribut</TableHead>
              {sortedSamples.map(([id, sample]) => (
                <TableHead 
                  key={id}
                  style={{ 
                    backgroundColor: colorMap.get(id),
                    color: 'black',
                    fontWeight: 'bold'
                  }}
                >
                  {sample.brand}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {[
              { key: "appearance", label: "Appearance" },
              { key: "odor", label: "Odour" },
              { key: "texture", label: "Texture" },
              { key: "flavor", label: "Flavour" },
              { key: "overallLiking", label: "Overall liking" }
            ].map((attr) => (
              <TableRow key={attr.key}>
                <TableCell className="font-medium">{attr.label}</TableCell>
                {sortedSamples.map(([id, sample]) => (
                  <TableCell 
                    key={id}
                    style={{ 
                      backgroundColor: `${colorMap.get(id)}50` // 50 = 30% opacity
                    }}
                  >
                    {sample.hedonic[attr.key as keyof typeof sample.hedonic].toFixed(1)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Hedonic Chart */}
      <Card>
        <CardContent className="pt-6">
          <div className="text-center mb-4">
            <h4 className="font-bold">Preference data: overall and attribute liking</h4>
            <p>Method: 9-point hedonic scale</p>
            <p>Sample: {productName}</p>
            <p>Plot of: mean</p>
          </div>
          
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 70
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis 
                  label={{ value: 'liking (points)', angle: -90, position: 'insideLeft' }}
                  domain={[1, 9]}
                  ticks={[1, 2, 3, 4, 5, 6, 7, 8, 9]}
                />
                <Tooltip />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{ bottom: -10, lineHeight: '40px' }}
                />
                
                {sortedSamples.map(([id, sample]) => (
                  <Bar 
                    key={id}
                    dataKey={`${sample.brand}_${id}`}
                    name={sample.brand}
                    fill={colorMap.get(id)}
                  >
                    <LabelList dataKey={`${sample.brand}_${id}`} position="top" />
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
