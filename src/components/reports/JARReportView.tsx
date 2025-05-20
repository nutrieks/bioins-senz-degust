
import React from "react";
import { JARReport } from "@/types";
import { Card, CardContent } from "@/components/ui/card";
import { JARTable } from "./jar/JARTable";
import { JARChart } from "./jar/JARChart";
import { processJARData } from "./jar/utils";

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

        return (
          <Card key={attrId} className="mb-8">
            <CardContent className="pt-6">
              <div className="mb-4">
                <h4 className="text-lg font-semibold">{attrData.nameEN}</h4>
              </div>

              {/* Table view */}
              <JARTable 
                data={chartData}
                attrData={attrData}
                productName={productName}
              />
              
              {/* Chart view */}
              <JARChart
                data={chartData}
                attrData={attrData}
                productName={productName}
              />
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
