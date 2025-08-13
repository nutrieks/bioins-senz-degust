
import { format } from "date-fns";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { User } from "@/types";
import { ProductType } from "@/types";

interface SampleHeaderProps {
  sampleCode: string;
  user: User | null;
  eventDate: string;
  productType: ProductType | null;
}

export function SampleHeader({ 
  sampleCode,
  user,
  eventDate,
  productType
}: SampleHeaderProps) {
  return (
    <Card className="mb-8">
      <CardHeader className="text-center bg-muted/50 rounded-t-lg">
        <CardTitle className="text-2xl">
          {sampleCode}
        </CardTitle>
        <div className="mt-2 text-sm text-muted-foreground">
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 mb-2">
            <span>Ocjenjivačko mjesto: {user?.evaluatorPosition}</span>
            <span>Datum: {eventDate}</span>
          </div>
          <div>
            {productType && (
              <span className="font-medium text-base">{productType.productName}</span>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}
