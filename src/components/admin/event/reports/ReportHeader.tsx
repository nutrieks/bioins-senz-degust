
import { formatDate } from "@/utils/dateUtils";
import { ProductType } from "@/types";

interface ReportHeaderProps {
  eventDate: string;
  productType: ProductType | undefined;
}

export function ReportHeader({ eventDate, productType }: ReportHeaderProps) {
  return (
    <div className="print:block hidden text-center mb-10">
      <div className="mb-4">
        <img src="/logo-placeholder.svg" alt="Logo" className="h-12 mx-auto" />
      </div>
      <div className="border-t pt-4">
        <h1 className="text-2xl font-bold">Potrošačka degustacija</h1>
        <h2 className="text-xl mt-1 mb-3">
          {eventDate ? formatDate(eventDate) : ""}
        </h2>
        <h3 className="text-lg">
          {productType?.customerCode} - {productType?.productName}
        </h3>
      </div>
    </div>
  );
}
