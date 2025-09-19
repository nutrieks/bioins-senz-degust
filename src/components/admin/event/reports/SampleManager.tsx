import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSamplesWithVisibility, toggleSampleVisibility } from "@/services/supabase/evaluationManagement";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Eye, EyeOff } from "lucide-react";

interface SampleManagerProps {
  productTypeId: string;
  productTypeName: string;
}

interface Sample {
  id: string;
  brand: string;
  retailer_code: string;
  blind_code: string | null;
  hidden_from_reports: boolean;
}

export function SampleManager({ productTypeId, productTypeName }: SampleManagerProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [updatingSamples, setUpdatingSamples] = useState<Set<string>>(new Set());

  const { data: samples = [], isLoading } = useQuery({
    queryKey: ['samples', productTypeId],
    queryFn: () => getSamplesWithVisibility(productTypeId),
    enabled: !!productTypeId,
  });

  const handleToggleVisibility = async (sample: Sample) => {
    setUpdatingSamples(prev => new Set(prev).add(sample.id));
    
    try {
      await toggleSampleVisibility(sample.id, !sample.hidden_from_reports);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['samples', productTypeId] });
      queryClient.invalidateQueries({ queryKey: ['hedonicReport', productTypeId] });
      queryClient.invalidateQueries({ queryKey: ['jarReport', productTypeId] });
      
      toast({
        title: "Uspjeh",
        description: `Uzorak je ${sample.hidden_from_reports ? 'prikazan' : 'skriven'} u izvještajima.`,
      });
    } catch (error) {
      console.error("Error toggling sample visibility:", error);
      toast({
        title: "Greška",
        description: "Dogodila se greška prilikom promjene vidljivosti uzorka.",
        variant: "destructive",
      });
    } finally {
      setUpdatingSamples(prev => {
        const newSet = new Set(prev);
        newSet.delete(sample.id);
        return newSet;
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Učitavanje uzoraka...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Upravljanje uzorcima - {productTypeName}
          <Badge variant="outline">{samples.length} uzoraka</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Odaberite koje uzorke želite sakriti iz izvještaja. Skriveni uzorci neće se prikazivati u grafovima i tablicama.
          </p>
          
          {samples.length === 0 ? (
            <div className="text-center p-6 text-muted-foreground">
              Nema dostupnih uzoraka za ovaj tip proizvoda.
            </div>
          ) : (
            <div className="grid gap-3">
              {samples.map((sample) => {
                const isUpdating = updatingSamples.has(sample.id);
                
                return (
                  <div 
                    key={sample.id} 
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="font-medium">
                          {sample.retailer_code} - {sample.brand}
                        </span>
                        {sample.blind_code && (
                          <span className="text-sm text-muted-foreground">
                            Slijepi kod: {sample.blind_code}
                          </span>
                        )}
                      </div>
                      {sample.hidden_from_reports && (
                        <Badge variant="secondary" className="text-xs">
                          <EyeOff className="h-3 w-3 mr-1" />
                          Skriveno
                        </Badge>
                      )}
                      {!sample.hidden_from_reports && (
                        <Badge variant="outline" className="text-xs">
                          <Eye className="h-3 w-3 mr-1" />
                          Prikazano
                        </Badge>
                      )}
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleToggleVisibility(sample)}
                      disabled={isUpdating}
                    >
                      {isUpdating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : sample.hidden_from_reports ? (
                        <>
                          <Eye className="h-4 w-4 mr-2" />
                          Prikaži
                        </>
                      ) : (
                        <>
                          <EyeOff className="h-4 w-4 mr-2" />
                          Sakrij
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}