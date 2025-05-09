
import React, { useRef } from "react";
import { JARReport, RetailerCode } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { toPng } from "html-to-image";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const JAR_COLORS = [
  "rgb(255, 128, 128)", // Much too weak (1) - Light red/pink
  "rgb(255, 255, 128)", // Too weak (2) - Light yellow
  "rgb(0, 255, 0)",     // Just About Right (3) - Green
  "rgb(159, 159, 0)",   // Too strong (4) - Olive/Dark yellow
  "rgb(255, 0, 0)"      // Much too strong (5) - Red
];

const JAR_LABELS = [
  "Much too weak",
  "Too weak",
  "Just About Right",
  "Too strong",
  "Much too strong"
];

const sortSamples = (samples: any[]) => {
  const retailerOrder: RetailerCode[] = [RetailerCode.LI, RetailerCode.KL, RetailerCode.KO, RetailerCode.IS, RetailerCode.PL, RetailerCode.ES, RetailerCode.M];
  
  return samples.sort((a, b) => {
    const retailerA = a.retailerCode;
    const retailerB = b.retailerCode;
    
    const orderA = retailerOrder.indexOf(retailerA);
    const orderB = retailerOrder.indexOf(retailerB);
    
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    
    return a.brand.localeCompare(b.brand);
  });
};

// Format label for display - showing retailer code + brand
const formatSampleLabel = (sample: {retailerCode: RetailerCode, brand: string}): string => {
  return `${sample.retailerCode} ${sample.brand}`;
};

const processJARData = (attrData: any) => {
  const samples = Object.entries(attrData.results).map(([sampleId, result]: [string, any]) => ({
    id: sampleId,
    ...result
  }));
  
  const sortedSamples = sortSamples(samples);
  
  return sortedSamples.map(sample => {
    const data: any = { 
      name: formatSampleLabel(sample),
      id: sample.id
    };
    
    for (let i = 0; i < 5; i++) {
      data[JAR_LABELS[i]] = sample.frequencies[i];
    }
    
    return data;
  });
};

function exportJARAttributeChartToCSV(attrData: any, productName: string) {
  let csv = `JAR Chart: ${attrData.nameEN} (Sample: ${productName})\n`;
  csv += "Brand," + JAR_LABELS.join(",") + "\n";
  const samples = Object.entries(attrData.results).map(([sampleId, result]: [string, any]) => ({
    id: sampleId,
    ...result
  }));
  const sortedSamples = sortSamples(samples);
  sortedSamples.forEach(sample => {
    csv += `${formatSampleLabel(sample)},${sample.frequencies.join(",")}\n`;
  });
  downloadCSV(csv, `JAR_${attrData.nameEN.replace(/\s/g, "_")}_${productName}.csv`);
}

function downloadCSV(content: string, filename: string) {
  const encodedUri = "data:text/csv;charset=utf-8," + encodeURIComponent(content);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function JARReportView({ report, productName }: { report: JARReport; productName: string; }) {
  if (!report || Object.keys(report).length === 0) {
    return (
      <div className="text-center p-6">
        <p>Nema dostupnih podataka za JAR skalu.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">JAR skala</h3>
      {Object.entries(report).map(([attrId, attrData]) => {
        const chartData = processJARData(attrData);
        const chartRef = useRef<HTMLDivElement>(null);
        const tableRef = useRef<HTMLDivElement>(null);

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

        const handleDownloadTableImage = async () => {
          if (tableRef.current) {
            const dataUrl = await toPng(tableRef.current, {
              backgroundColor: "#fff",
              pixelRatio: 4,
              cacheBust: true,
              style: { fontFamily: "inherit" }
            });
            const link = document.createElement('a');
            link.download = `JAR_${attrData.nameEN.replace(/\s/g, "_")}_${productName}_table.png`;
            link.href = dataUrl;
            link.click();
          }
        };

        return (
          <Card key={attrId} className="mb-8">
            <CardContent className="pt-6">
              <div className="flex justify-between mb-4">
                <h4 className="text-lg font-semibold">{attrData.nameEN}</h4>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadChartImage}
                    className="flex items-center"
                  >
                    <Download className="mr-2 h-4 w-4" /> Preuzmi graf
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadTableImage}
                    className="flex items-center"
                  >
                    <Download className="mr-2 h-4 w-4" /> Preuzmi tablicu
                  </Button>
                </div>
              </div>

              {/* Table view */}
              <div 
                ref={tableRef}
                className="bg-white p-5 rounded-lg shadow mb-6"
              >
                <div className="mb-3 text-center">
                  <h4 className="font-bold text-lg mb-1">Consumer's reaction to specific attribute</h4>
                  <p className="text-sm">Method: JAR scale</p>
                  <p className="text-sm">Sample: {productName}</p>
                  <p className="text-sm mb-3">Attribute: {attrData.nameEN}</p>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Brand</TableHead>
                      {JAR_LABELS.map((label) => (
                        <TableHead key={label} className="text-center">{label}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chartData.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        {JAR_LABELS.map((label, index) => (
                          <TableCell key={label} className="text-center" style={{ backgroundColor: `${JAR_COLORS[index]}40` }}>
                            {item[label]}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {/* Chart view */}
              <div 
                ref={chartRef}
                className="bg-white p-5 rounded-lg shadow"
                style={{
                  width: '100%',
                  maxWidth: 950,
                  margin: '0 auto'
                }}
              >
                {/* Naslov i opis (dio slike) */}
                <div className="text-center mb-4">
                  <h4 className="font-bold text-lg mb-1">Consumer's reaction to specific attribute</h4>
                  <p className="text-sm">Method: JAR scale</p>
                  <p className="text-sm">Sample: {productName}</p>
                  <p className="text-sm mb-3">Attribute: {attrData.nameEN}</p>
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
                      barGap={2}
                      barCategoryGap={20}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis 
                        label={{ value: 'No. of votes', angle: -90, position: 'insideLeft' }}
                        domain={[0, 12]}
                        ticks={[0, 2, 4, 6, 8, 10, 12]}
                      />
                      <Tooltip 
                        contentStyle={{ color: 'black' }} 
                        formatter={(value, name) => [value, name]}
                        labelFormatter={(label) => `Sample: ${label}`}
                      />
                      <Legend 
                        layout="horizontal" 
                        verticalAlign="bottom" 
                        align="center"
                        wrapperStyle={{ bottom: -10, lineHeight: '40px', color: 'black' }}
                        formatter={(value, entry) => <span style={{ color: 'black' }}>{value}</span>}
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
                            style={{ fill: 'black', fontSize: 14 }}
                            formatter={(value: number) => value > 0 ? value : ''}
                          />
                        </Bar>
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
