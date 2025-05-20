
import { HedonicReport, ProductType } from "@/types";
import { HedonicReportView } from "@/components/reports/HedonicReportView";

interface HedonicTabProps {
  hedonicReport: HedonicReport | null;
  productType: ProductType | null;
  isLoading: boolean;
}

export function HedonicTab({ 
  hedonicReport, 
  productType,
  isLoading
}: HedonicTabProps) {
  if (isLoading) {
    return <div className="text-center p-4">Učitavanje izvještaja...</div>;
  }
  
  if (!productType) {
    return (
      <div className="text-center p-6 border rounded-lg">
        <p className="text-muted-foreground">
          Odaberite tip proizvoda za prikaz izvještaja.
        </p>
      </div>
    );
  }
  
  return (
    <>
      {hedonicReport && productType ? (
        <HedonicReportView 
          report={hedonicReport} 
          productName={productType.productName}
        />
      ) : (
        <div className="text-center p-6 border rounded-lg">
          <p className="text-muted-foreground">
            Nema dostupnih hedoničkih podataka za odabrani tip proizvoda.
          </p>
        </div>
      )}
    </>
  );
}
