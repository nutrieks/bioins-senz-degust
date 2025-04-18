
import React from "react";
import { JARReport } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList, ResponsiveContainer } from "recharts";

interface JARReportViewProps {
  report: JARReport;
  productName: string;
}

const JAR_COLORS = [
  "rgb(255, 128, 128)", // Much too weak
  "rgb(255, 255, 128)", // Too weak
  "rgb(0, 255, 0)",     // JAR
  "rgb(159, 159, 0)",   // Too strong
  "rgb(255, 0, 0)"      // Much too strong
];

export function JARReportView({ report, productName }: JARReportViewProps) {
  if (!report || Object.keys(report).length === 0) {
    return (
      <div className="text-center p-6">
        <p>Nema dostupnih podataka za JAR skalu.</p>
      </div>
    );
  }

  const processJARData = (attrData: any) => {
    const processedData = Object.entries(attrData.results).map(([sampleId, result]: [string, any]) => ({
      name: result.brand,
      "Much too weak": result.frequencies[0],
      "Too weak": result.frequencies[1],
      "Just About Right": result.frequencies[2],
      "Too strong": result.frequencies[3],
      "Much too strong": result.frequencies[4],
      sampleId
    }));
    return processedData;
  };

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">JAR skala</h3>
      
      {Object.entries(report).map(([attrId, attrData]) => (
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
                  data={processJARData(attrData)}
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
                  <Tooltip contentStyle={{ color: 'black' }} />
                  <Legend 
                    layout="horizontal" 
                    verticalAlign="bottom" 
                    align="center"
                    wrapperStyle={{ bottom: -10, lineHeight: '40px', color: 'black' }}
                  />
                  
                  {[
                    "Much too weak",
                    "Too weak",
                    "Just About Right",
                    "Too strong",
                    "Much too strong"
                  ].map((rating, index) => (
                    <Bar
                      key={rating}
                      dataKey={rating}
                      name={rating}
                      fill={JAR_COLORS[index]}
                      stackId={0}
                    >
                      <LabelList 
                        dataKey={rating} 
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
      ))}
    </div>
  );
}
