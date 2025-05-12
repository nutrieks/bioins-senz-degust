
import React from "react";
import { HedonicReport } from "@/types";
import { HedonicTable } from "./hedonic/HedonicTable";
import { HedonicChart } from "./hedonic/HedonicChart";

export function HedonicReportView({ report, productName }: { report: HedonicReport; productName: string; }) {
  if (!report || Object.keys(report).length === 0) {
    return (
      <div className="text-center p-6">
        <p>Nema dostupnih podataka za hedoničku skalu.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold">Hedonistička skala</h3>

      {/* Table view */}
      <HedonicTable report={report} productName={productName} />

      {/* Chart view */}
      <HedonicChart report={report} productName={productName} />
    </div>
  );
}
