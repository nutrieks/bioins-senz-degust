
import React from "react";
import { JARReport, RetailerCode } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList, ResponsiveContainer } from "recharts";

interface JARReportViewProps {
  report: JARReport;
  productName: string;
}

// JAR Colors as specified, fixed for each JAR category
const JAR_COLORS = [
  "rgb(255, 128, 128)", // Much too weak (1) - Light red/pink
  "rgb(255, 255, 128)", // Too weak (2) - Light yellow
  "rgb(0, 255, 0)",     // Just About Right (3) - Green
  "rgb(159, 159, 0)",   // Too strong (4) - Olive/Dark yellow
  "rgb(255, 0, 0)"      // Much too strong (5) - Red
];

// JAR Rating Labels (English)
const JAR_LABELS = [
  "Much too weak",
  "Too weak",
  "Just About Right",
  "Too strong",
  "Much too strong"
];

// Sort samples according to the standard order: LI, KL, KO, IS, PL, ES, M
const sortSamples = (samples: any[]) => {
  const retailerOrder: RetailerCode[] = [RetailerCode.LI, RetailerCode.KL, RetailerCode.KO, RetailerCode.IS, RetailerCode.PL, RetailerCode.ES, RetailerCode.M];
  
  return samples.sort((a, b) => {
    const retailerA = a.retailerCode;
    const retailerB = b.retailerCode;
    
    // First sort by retailer code order
    const orderA = retailerOrder.indexOf(retailerA);
    const orderB = retailerOrder.indexOf(retailerB);
    
    if (orderA !== orderB) {
      return orderA - orderB;
    }
    
    // If same retailer code, sort alphabetically by brand
    return a.brand.localeCompare(b.brand);
  });
};

// Process JAR data for the chart
const processJARData = (attrData: any) => {
  const samples = Object.entries(attrData.results).map(([sampleId, result]: [string, any]) => ({
    id: sampleId,
    ...result
  }));
  
  const sortedSamples = sortSamples(samples);
  
  // Create chart data - one entry per sample (brand)
  return sortedSamples.map(sample => {
    // Base data with sample name
    const data: any = { 
      name: sample.brand,
      id: sample.id
    };
    
    // Add each rating's value (number of votes) as a separate property
    for (let i = 0; i < 5; i++) {
      data[JAR_LABELS[i]] = sample.frequencies[i];
    }
    
    return data;
  });
};

export function JARReportView({ report, productName }: JARReportViewProps) {
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
        
        return (
          <Card key={attrId}>
            <CardContent className="pt-6">
              <div className="text-center mb-4">
                <h4 className="font-bold">Consumer's reaction to specific attribute</h4>
                <p>Method: JAR scale</p>
                <p>Sample: {productName}</p>
                <p>Attribute: {attrData.nameEN}</p>
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
                    
                    {/* Create a separate bar for each JAR rating (1-5) */}
                    {JAR_LABELS.map((label, index) => (
                      <Bar
                        key={label}
                        dataKey={label}
                        name={label}
                        fill={JAR_COLORS[index]}
                        // Not using stackId - these are grouped bars, not stacked
                      >
                        <LabelList 
                          dataKey={label} 
                          position="top"
                          style={{ fill: 'black' }}
                          formatter={(value: number) => value > 0 ? value : ''}
                        />
                      </Bar>
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
