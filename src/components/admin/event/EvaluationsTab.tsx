import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getEvaluationsByProductType, getSamplesWithVisibility } from "@/services/supabase/evaluationManagement";
import { EvaluationsList } from "./evaluations/EvaluationsList";
import { ProductType } from "@/types";
import { Loader2 } from "lucide-react";

interface EvaluationsTabProps {
  productTypes: ProductType[];
  eventId: string;
}

export function EvaluationsTab({ productTypes, eventId }: EvaluationsTabProps) {
  const [selectedProductTypeId, setSelectedProductTypeId] = useState<string>("");
  const queryClient = useQueryClient();

  const { data: evaluations = [], isLoading: isLoadingEvaluations } = useQuery({
    queryKey: ['evaluations', selectedProductTypeId],
    queryFn: () => getEvaluationsByProductType(selectedProductTypeId),
    enabled: !!selectedProductTypeId,
  });

  const { data: samples = [], isLoading: isLoadingSamples } = useQuery({
    queryKey: ['samples', selectedProductTypeId],
    queryFn: () => getSamplesWithVisibility(selectedProductTypeId),
    enabled: !!selectedProductTypeId,
  });

  const isLoading = isLoadingEvaluations || isLoadingSamples;
  const selectedProductType = productTypes.find(pt => pt.id === selectedProductTypeId);

  const handleEvaluationUpdated = () => {
    // Invalidate relevant queries to refresh data
    queryClient.invalidateQueries({ queryKey: ['evaluations', selectedProductTypeId] });
    queryClient.invalidateQueries({ queryKey: ['hedonicReport', selectedProductTypeId] });
    queryClient.invalidateQueries({ queryKey: ['jarReport', selectedProductTypeId] });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ocjene</CardTitle>
        <CardDescription>
          Pregled i uređivanje ocjena ocjenjitelja za završene događaje.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="w-full sm:w-auto">
              <Select 
                value={selectedProductTypeId} 
                onValueChange={setSelectedProductTypeId}
              >
                <SelectTrigger className="w-full sm:w-[300px]">
                  <SelectValue placeholder="Odaberite tip proizvoda" />
                </SelectTrigger>
                <SelectContent>
                  {productTypes.map((productType) => (
                    <SelectItem key={productType.id} value={productType.id}>
                      {productType.customerCode} - {productType.productName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {selectedProductTypeId && (
            <>
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Učitavanje ocjena...</span>
                </div>
              ) : (
                <EvaluationsList
                  evaluations={evaluations}
                  samples={samples}
                  productType={selectedProductType}
                  onEvaluationUpdated={handleEvaluationUpdated}
                />
              )}
            </>
          )}

          {!selectedProductTypeId && (
            <div className="text-center p-6 text-muted-foreground">
              Odaberite tip proizvoda za pregled ocjena.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}