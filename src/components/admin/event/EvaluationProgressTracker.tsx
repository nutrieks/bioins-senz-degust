
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import { getEvaluationsStatus } from "@/services/dataService";
import { EvaluationStatus } from "@/types";

interface EvaluationProgressTrackerProps {
  eventId: string;
  refreshInterval?: number; // in milliseconds
}

export function EvaluationProgressTracker({ eventId, refreshInterval = 30000 }: EvaluationProgressTrackerProps) {
  const [evaluationsStatus, setEvaluationsStatus] = useState<EvaluationStatus[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  // Fetch evaluations status
  const fetchEvaluationsStatus = async () => {
    try {
      setIsLoading(true);
      const status = await getEvaluationsStatus(eventId);
      
      // Calculate overall progress
      let totalCompleted = 0;
      let totalSamples = 0;
      
      status.forEach(userStatus => {
        totalCompleted += userStatus.totalCompleted;
        totalSamples += userStatus.totalSamples;
      });
      
      const progressPercentage = totalSamples > 0 ? Math.round((totalCompleted / totalSamples) * 100) : 0;
      setOverallProgress(progressPercentage);
      setEvaluationsStatus(status);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Error fetching evaluations status:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch and set up interval for refreshing
  useEffect(() => {
    fetchEvaluationsStatus();
    
    // Set up interval for auto-refresh
    const intervalId = setInterval(() => {
      fetchEvaluationsStatus();
    }, refreshInterval);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [eventId, refreshInterval]);

  // Helper function to get unique product types from all evaluators
  const getUniqueProductTypes = () => {
    if (evaluationsStatus.length === 0) return [];
    
    const allProductTypes = evaluationsStatus.flatMap(status => status.completedSamples);
    const uniqueTypes = Array.from(new Set(allProductTypes.map(pt => pt.productTypeId)))
      .map(id => {
        const productType = allProductTypes.find(pt => pt.productTypeId === id);
        return {
          id: productType?.productTypeId || "",
          name: productType?.productTypeName || ""
        };
      });
    
    return uniqueTypes;
  };

  const productTypes = getUniqueProductTypes();

  if (isLoading && evaluationsStatus.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Praćenje ocjenjivanja u tijeku</CardTitle>
          <CardDescription>Učitavanje podataka...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center items-center py-8">
          <div className="animate-pulse h-48 w-full bg-gray-100 rounded"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <div className="flex justify-between items-center flex-wrap gap-2">
          <div>
            <CardTitle>Praćenje ocjenjivanja u tijeku</CardTitle>
            <CardDescription>
              Ukupni napredak: {overallProgress}% završeno
            </CardDescription>
          </div>
          <div className="text-xs text-muted-foreground">
            Zadnje ažuriranje: {lastUpdated.toLocaleTimeString()}
            <button 
              onClick={() => fetchEvaluationsStatus()}
              className="ml-2 text-primary underline hover:text-primary/80"
            >
              Osvježi
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <Progress value={overallProgress} className="h-2" />
        </div>

        {productTypes.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {productTypes.map((productType) => (
              <div key={productType.id} className="border rounded-lg p-4">
                <h3 className="font-medium text-lg mb-3">{productType.name}</h3>
                
                <div className="grid grid-cols-12 gap-2 text-center font-medium border-b pb-2">
                  <div className="col-span-2">Ocjenjivač</div>
                  <div className="col-span-10">Uzorci</div>
                </div>
                
                {evaluationsStatus.map((evaluator) => {
                  const productTypeData = evaluator.completedSamples.find(
                    pt => pt.productTypeId === productType.id
                  );

                  if (!productTypeData) return null;

                  return (
                    <div key={`${evaluator.userId}-${productType.id}`} className="grid grid-cols-12 gap-2 py-2 border-b">
                      <div className="col-span-2 flex items-center">
                        <div className="px-2 py-1 rounded-lg bg-muted">
                          {evaluator.position}
                        </div>
                      </div>
                      <div className="col-span-10 flex flex-wrap gap-2">
                        {productTypeData.samples.map((sample) => (
                          <Badge 
                            key={sample.sampleId}
                            variant={sample.isCompleted ? "default" : "outline"}
                            className="flex items-center gap-1"
                          >
                            {sample.isCompleted && <Check className="h-3 w-3" />}
                            <span>{sample.blindCode}</span>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            Nema podataka o ocjenjivanju za ovaj događaj.
          </div>
        )}
      </CardContent>
    </Card>
  );
}
