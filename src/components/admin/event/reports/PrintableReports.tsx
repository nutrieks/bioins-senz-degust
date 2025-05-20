
import { HedonicReport, JARReport, ProductType } from "@/types";
import { HedonicReportView } from "@/components/reports/HedonicReportView";
import { JARReportView } from "@/components/reports/JARReportView";

interface PrintableReportsProps {
  hedonicReport: HedonicReport | null;
  jarReport: JARReport | null;
  productType: ProductType | null;
}

export function PrintableReports({
  hedonicReport,
  jarReport,
  productType
}: PrintableReportsProps) {
  if (!hedonicReport || !jarReport || !productType) {
    return null;
  }
  
  return (
    <div className="print:block hidden space-y-10">
      {hedonicReport && productType && (
        <HedonicReportView 
          report={hedonicReport} 
          productName={productType.productName}
        />
      )}
      
      {jarReport && productType && (
        <JARReportView 
          report={jarReport} 
          productName={productType.productName}
        />
      )}
    </div>
  );
}
