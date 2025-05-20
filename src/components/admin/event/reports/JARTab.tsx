
import { JARReport, ProductType } from "@/types";
import { JARReportView } from "@/components/reports/JARReportView";

interface JARTabProps {
  jarReport: JARReport | null;
  productType: ProductType | null;
  isLoading: boolean;
}

export function JARTab({ 
  jarReport, 
  productType,
  isLoading
}: JARTabProps) {
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
      {jarReport && productType ? (
        <JARReportView 
          report={jarReport} 
          productName={productType.productName}
        />
      ) : (
        <div className="text-center p-6 border rounded-lg">
          <p className="text-muted-foreground">
            Nema dostupnih JAR podataka za odabrani tip proizvoda.
          </p>
        </div>
      )}
    </>
  );
}
