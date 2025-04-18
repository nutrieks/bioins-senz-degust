
import React from "react";
import { JARReport } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { RetailerCode } from "@/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList, ResponsiveContainer } from "recharts";

interface JARReportViewProps {
  report: JARReport;
  productName: string;
}

// Define JAR colors
const JAR_COLORS = [
  "rgb(255, 128, 128)", // Ocjena 1
  "rgb(255, 255, 128)", // Ocjena 2
  "rgb(0, 255, 0)",     // Ocjena 3 (JAR)
  "rgb(159, 159, 0)",   // Ocjena 4
  "rgb(255, 0, 0)"      // Ocjena 5
];

// Sort retailer order function
const sortRetailerOrder = (samples: { retailerCode: RetailerCode, brand: string, sampleId: string }[]) => {
  const retailerOrder: RetailerCode[] = ["LI", "KL", "KO", "IS", "PL", "ES", "M"];
  
  return [...samples].sort((a, b) => {
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

// Process JAR data for the charts
const processJARData = (report: JARReport) => {
  // Extract unique samples across all attributes
  const uniqueSamples = new Map<string, { retailerCode: RetailerCode, brand: string, sampleId: string }>();
  
  Object.values(report).forEach(attr => {
    Object.entries(attr.results).forEach(([sampleId, sample]) => {
      if (!uniqueSamples.has(sampleId)) {
        uniqueSamples.set(sampleId, {
          retailerCode: sample.retailerCode,
          brand: sample.brand,
          sampleId
        });
      }
    });
  });
  
  // Sort samples according to retailer order
  const sortedSamples = sortRetailerOrder(Array.from(uniqueSamples.values()));
  
  // Process attribute data
  const attributeData = Object.entries(report).map(([attrId, attr]) => {
    // Create chart data for this attribute
    const chartData = sortedSamples.map(sample => {
      const result = attr.results[sample.sampleId];
      
      // If no result for this sample, use zeros
      const frequencies = result?.frequencies || [0, 0, 0, 0, 0];
      
      return {
        name: result?.brand || sample.brand,
        rating1: frequencies[0],
        rating2: frequencies[1],
        rating3: frequencies[2],
        rating4: frequencies[3],
        rating5: frequencies[4],
        sampleId: sample.sampleId
      };
    });
    
    return {
      id: attrId,
      nameEN: attr.nameEN,
      nameHR: attr.nameHR,
      scaleEN: attr.scaleEN,
      scaleHR: attr.scaleHR,
      chartData
    };
  });
  
  return { attributeData, sortedSamples };
};

export function JARReportView({ report, productName }: JARReportViewProps) {
  if (!report || Object.keys(report).length === 0) {
    return (
      <div className="text-center p-6">
        <p>Nema dostupnih podataka za JAR skalu.</p>
      </div>
    );
  }

  const { attributeData } = processJARData(report);
  
  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">JAR skala</h3>
      
      {attributeData.map((attribute) => (
        <Card key={attribute.id} className="overflow-hidden">
          <CardContent className="pt-6">
            <div className="text-center mb-4">
              <h4 className="font-bold">Consumer's reaction to specific attribute</h4>
              <p>Method: JAR scale</p>
              <p>Sample: {productName}</p>
              <p>Attribute: {attribute.nameEN}</p>
            </div>
            
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={attribute.chartData}
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
                    label={{ value: 'No. of votes', angle: -90, position: 'insideLeft' }}
                    domain={[0, 12]}
                    ticks={[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]}
                  />
                  <Tooltip />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    wrapperStyle={{ bottom: -10, lineHeight: '40px' }}
                  />
                  
                  <Bar 
                    dataKey="rating1"
                    name={attribute.scaleEN[0]}
                    fill={JAR_COLORS[0]}
                    stackId="a"
                  >
                    <LabelList dataKey="rating1" position="top" formatter={(value: number) => value > 0 ? value : ''} />
                  </Bar>
                  <Bar 
                    dataKey="rating2"
                    name={attribute.scaleEN[1]}
                    fill={JAR_COLORS[1]}
                    stackId="a"
                  >
                    <LabelList dataKey="rating2" position="top" formatter={(value: number) => value > 0 ? value : ''} />
                  </Bar>
                  <Bar 
                    dataKey="rating3"
                    name={attribute.scaleEN[2]} 
                    fill={JAR_COLORS[2]}
                    stackId="a"
                  >
                    <LabelList dataKey="rating3" position="top" formatter={(value: number) => value > 0 ? value : ''} />
                  </Bar>
                  <Bar 
                    dataKey="rating4"
                    name={attribute.scaleEN[3]}
                    fill={JAR_COLORS[3]}
                    stackId="a"
                  >
                    <LabelList dataKey="rating4" position="top" formatter={(value: number) => value > 0 ? value : ''} />
                  </Bar>
                  <Bar 
                    dataKey="rating5"
                    name={attribute.scaleEN[4]}
                    fill={JAR_COLORS[4]}
                    stackId="a"
                  >
                    <LabelList dataKey="rating5" position="top" formatter={(value: number) => value > 0 ? value : ''} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
