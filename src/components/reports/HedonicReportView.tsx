import React from "react";
import { HedonicReport, RetailerCode } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

// Define retailer colors
const RETAILER_COLORS: Record<RetailerCode, string> = {
  [RetailerCode.LI]: "rgb(255, 255, 0)", // Lidl: Yellow
  [RetailerCode.KL]: "rgb(255, 0, 0)",   // Kaufland: Red
  [RetailerCode.KO]: "rgb(0, 0, 255)",   // Konzum: Blue
  [RetailerCode.IS]: "rgb(128, 128, 255)", // Interspar: Light Blue
  [RetailerCode.PL]: "rgb(128, 128, 128)", // Plodine: Gray
  [RetailerCode.ES]: "rgb(0, 176, 240)",  // Eurospin: Light Blue
  [RetailerCode.M]: "rgb(0, 255, 0)"      // Marke: Green
};

// Function to determine if a color is dark and needs white text
const isDarkColor = (color: string): boolean => {
  // Parse RGB values
  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return false;
  
  const [, r, g, b] = match.map(Number);
  
  // Calculate luminance (simplified formula)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return true if color is dark (needs white text)
  return luminance < 0.5;
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
  const retailerOrder: RetailerCode[] = [RetailerCode.LI, RetailerCode.KL, RetailerCode.KO, RetailerCode.IS, RetailerCode.PL, RetailerCode.ES, RetailerCode.M];
  
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
  const textColorMap = new Map<string, string>(); // Added map for text colors
  const retailerCounts: Record<RetailerCode, number> = {
    [RetailerCode.LI]: 0, 
    [RetailerCode.KL]: 0, 
    [RetailerCode.KO]: 0, 
    [RetailerCode.IS]: 0, 
    [RetailerCode.PL]: 0, 
    [RetailerCode.ES]: 0, 
    [RetailerCode.M]: 0
  };
  
  sortedSamples.forEach(([id, sample]) => {
    const retailerCode = sample.retailerCode;
    const count = retailerCounts[retailerCode]++;
    const baseColor = RETAILER_COLORS[retailerCode];
    const color = count === 0 ? baseColor : getColorVariant(baseColor, count);
    colorMap.set(id, color);
    // Set text color based on background darkness
    textColorMap.set(id, isDarkColor(color) ? "#fff" : "#000");
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
  
  return { chartData, sortedSamples, colorMap, textColorMap };
};

// NEW: CSV generator for table
function exportHedonicTableToCSV(sortedSamples: [string, any][], report: HedonicReport, productName: string) {
  let csv = `Hedonic Table for ${productName}\n`;
  // header
  csv += "Atribut," + sortedSamples.map(([_, sample]) => `"${sample.brand}"`).join(",") + "\n";
  // rows
  const attributes = [
    { key: "appearance", label: "Appearance" },
    { key: "odor", label: "Odour" },
    { key: "texture", label: "Texture" },
    { key: "flavor", label: "Flavour" },
    { key: "overallLiking", label: "Overall liking" }
  ];
  attributes.forEach(attr => {
    csv += `${attr.label},` +
      sortedSamples.map(([id, sample]) => sample.hedonic[attr.key].toFixed(1)).join(",")
      + "\n";
  });
  downloadCSV(csv, `hedonic_table_${productName}.csv`);
}

// NEW: CSV generator for chart
function exportHedonicChartToCSV(chartData: any[], sortedSamples: [string, any][], productName: string) {
  let csv = `Hedonic Chart Data for ${productName}\n`;
  // header
  csv += "Atribut," + sortedSamples.map(([id, sample]) => `"${sample.brand}_${id}"`).join(",") + "\n";
  chartData.forEach(row => {
    csv += `${row.name},` + sortedSamples.map(([id, sample]) => row[`${sample.brand}_${id}`]).join(",") + "\n";
  });
  downloadCSV(csv, `hedonic_chart_${productName}.csv`);
}

// CSV download util
function downloadCSV(content: string, filename: string) {
  const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(content);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function HedonicReportView({ report, productName }: { report: HedonicReport; productName: string; }) {
  if (!report || Object.keys(report).length === 0) {
    return (
      <div className="text-center p-6">
        <p>Nema dostupnih podataka za hedoničku skalu.</p>
      </div>
    );
  }

  const { chartData, sortedSamples, colorMap, textColorMap } = processChartData(report);
  
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Hedonistička skala</h3>
      
      {/* Download for table */}
      <div className="flex justify-end mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportHedonicTableToCSV(sortedSamples, report, productName)}
          className="flex items-center"
        >
          <Download className="mr-2 h-4 w-4" /> Preuzmi CSV (tablica)
        </Button>
      </div>
      
      {/* Hedonic Table */}
      <div className="overflow-x-auto border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-36 bg-gray-100">Atribut</TableHead>
              {sortedSamples.map(([id, sample]) => (
                <TableHead 
                  key={id}
                  style={{ 
                    backgroundColor: colorMap.get(id),
                    color: textColorMap.get(id),
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
            ].map((attr, index) => (
              <TableRow key={attr.key}>
                <TableCell className="font-medium bg-gray-100">{attr.label}</TableCell>
                {sortedSamples.map(([id, sample]) => (
                  <TableCell 
                    key={id}
                    style={{ 
                      backgroundColor: `${colorMap.get(id)}`,
                      color: textColorMap.get(id)
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
      
      {/* Download for chart */}
      <div className="flex justify-end mb-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => exportHedonicChartToCSV(chartData, sortedSamples, productName)}
          className="flex items-center"
        >
          <Download className="mr-2 h-4 w-4" /> Preuzmi CSV (graf)
        </Button>
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
                <Tooltip contentStyle={{ color: 'black' }} />
                <Legend 
                  layout="horizontal" 
                  verticalAlign="bottom" 
                  align="center"
                  wrapperStyle={{ bottom: -10, lineHeight: '40px', color: 'black' }}
                  formatter={(value, entry) => <span style={{ color: 'black' }}>{value}</span>}
                />
                {sortedSamples.map(([id, sample]) => (
                  <Bar 
                    key={id}
                    dataKey={`${sample.brand}_${id}`}
                    name={sample.brand}
                    fill={colorMap.get(id)}
                  >
                    <LabelList 
                      dataKey={`${sample.brand}_${id}`} 
                      position="top"
                      style={{ fill: textColorMap.get(id) || 'black' }}
                    />
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
