
import React, { useRef } from "react";
import { HedonicReport, RetailerCode } from "@/types";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toPng } from "html-to-image";

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
  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return false;
  const [, r, g, b] = match.map(Number);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.5;
};

// Helper function to get a lighter or darker variant of a color for duplicate retailers
const getColorVariant = (color: string, index: number): string => {
  const match = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
  if (!match) return color;
  let [, r, g, b] = match.map(Number);
  const factor = 0.7 + (index * 0.15);
  r = Math.min(255, Math.round(r * factor));
  g = Math.min(255, Math.round(g * factor));
  b = Math.min(255, Math.round(b * factor));
  return `rgb(${r}, ${g}, ${b})`;
};

// Format label for display - showing retailer code + brand
const formatSampleLabel = (sample: {retailerCode: RetailerCode, brand: string}): string => {
  return `${sample.retailerCode} ${sample.brand}`;
};

const sortSamples = (report: HedonicReport) => {
  const retailerOrder: RetailerCode[] = [RetailerCode.LI, RetailerCode.KL, RetailerCode.KO, RetailerCode.IS, RetailerCode.PL, RetailerCode.ES, RetailerCode.M];
  return Object.entries(report)
    .sort((a, b) => {
      const retailerA = a[1].retailerCode;
      const retailerB = b[1].retailerCode;
      const orderA = retailerOrder.indexOf(retailerA);
      const orderB = retailerOrder.indexOf(retailerB);
      if (orderA !== orderB) {
        return orderA - orderB;
      }
      return a[1].brand.localeCompare(b[1].brand);
    });
};

const processChartData = (report: HedonicReport) => {
  const sortedSamples = sortSamples(report);
  const colorMap = new Map<string, string>();
  const textColorMap = new Map<string, string>();
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
    textColorMap.set(id, isDarkColor(color) ? "#fff" : "#000");
  });
  
  const attributes = [
    { key: "appearance", label: "Appearance" },
    { key: "odor", label: "Odour" },
    { key: "texture", label: "Texture" },
    { key: "flavor", label: "Flavour" },
    { key: "overallLiking", label: "Overall liking" }
  ];
  
  const chartData = attributes.map(attr => {
    const data: any = { name: attr.label };
    sortedSamples.forEach(([id, sample]) => {
      // Use retailer code + brand name format for keys
      const sampleKey = `${sample.retailerCode} ${sample.brand}_${id}`;
      data[sampleKey] = Number(sample.hedonic[attr.key as keyof typeof sample.hedonic].toFixed(1));
    });
    return data;
  });
  
  return { chartData, sortedSamples, colorMap, textColorMap };
};

export function HedonicReportView({ report, productName }: { report: HedonicReport; productName: string; }) {
  if (!report || Object.keys(report).length === 0) {
    return (
      <div className="text-center p-6">
        <p>Nema dostupnih podataka za hedoničku skalu.</p>
      </div>
    );
  }

  const { chartData, sortedSamples, colorMap, textColorMap } = processChartData(report);

  // refs
  const chartRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  // Slika grafa
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

  // Slika tablice
  const handleDownloadTableImage = async () => {
    if (tableRef.current) {
      const dataUrl = await toPng(tableRef.current, {
        backgroundColor: "#fff",
        pixelRatio: 4,
        cacheBust: true,
        style: { fontFamily: "inherit" }
      });
      const link = document.createElement('a');
      link.download = `hedonic_table_${productName}.png`;
      link.href = dataUrl;
      link.click();
    }
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Hedonistička skala</h3>

      {/* Table view */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-end mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownloadTableImage}
              className="flex items-center"
            >
              <Download className="mr-2 h-4 w-4" /> Preuzmi sliku (tablica)
            </Button>
          </div>

          <div 
            ref={tableRef}
            className="bg-white p-5 rounded-lg shadow"
          >
            <div className="mb-3 text-center">
              <h4 className="font-bold text-lg mb-1">Preference data: overall and attribute liking</h4>
              <p className="text-sm">Method: 9-point hedonic scale</p>
              <p className="text-sm">Sample: {productName}</p>
              <p className="text-sm mb-3">Values: mean</p>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="font-bold text-center">Brand</TableHead>
                    <TableHead className="font-bold text-center">Appearance</TableHead>
                    <TableHead className="font-bold text-center">Odour</TableHead>
                    <TableHead className="font-bold text-center">Texture</TableHead>
                    <TableHead className="font-bold text-center">Flavour</TableHead>
                    <TableHead className="font-bold text-center">Overall liking</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedSamples.map(([id, sample]) => (
                    <TableRow key={id}>
                      <TableCell 
                        className="font-medium"
                        style={{ 
                          backgroundColor: colorMap.get(id),
                          color: textColorMap.get(id)
                        }}
                      >
                        {formatSampleLabel(sample)}
                      </TableCell>
                      <TableCell className="text-center">{sample.hedonic.appearance.toFixed(1)}</TableCell>
                      <TableCell className="text-center">{sample.hedonic.odor.toFixed(1)}</TableCell>
                      <TableCell className="text-center">{sample.hedonic.texture.toFixed(1)}</TableCell>
                      <TableCell className="text-center">{sample.hedonic.flavor.toFixed(1)}</TableCell>
                      <TableCell className="text-center">{sample.hedonic.overallLiking.toFixed(1)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Chart view */}
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
    </div>
  );
}
