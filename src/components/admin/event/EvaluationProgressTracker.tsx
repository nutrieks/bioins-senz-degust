
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { RefreshCw, Users, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getEvaluationsStatus } from "@/services/dataService";
import { EvaluationStatus } from "@/types";
import { useQuery } from "@tanstack/react-query";

interface EvaluationProgressTrackerProps {
  eventId: string;
}

export function EvaluationProgressTracker({ eventId }: EvaluationProgressTrackerProps) {
  const { data: evaluationStatus = [], isLoading, refetch } = useQuery({
    queryKey: ['evaluationStatus', eventId],
    queryFn: () => getEvaluationsStatus(eventId),
    enabled: !!eventId,
    refetchInterval: 5000,
    refetchIntervalInBackground: false,
    staleTime: 1000 * 2,
  });

  const handleRefresh = () => {
    refetch();
  };

  const getTotalProgress = () => {
    const totalSamples = evaluationStatus.reduce((sum, user) => sum + user.totalSamples, 0);
    const totalCompleted = evaluationStatus.reduce((sum, user) => sum + user.totalCompleted, 0);
    return totalSamples > 0 ? (totalCompleted / totalSamples) * 100 : 0;
  };

  const getUserProgressPercentage = (user: EvaluationStatus) => {
    return user.totalSamples > 0 ? (user.totalCompleted / user.totalSamples) * 100 : 0;
  };

  const getProgressColor = (percentage: number) => {
    if (percentage === 100) return "bg-green-500";
    if (percentage >= 50) return "bg-yellow-500";
    return "bg-blue-500";
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold flex items-center">
          <Users className="mr-2 h-5 w-5" />
          Napredak evaluatora
        </CardTitle>
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            Automatsko osvježavanje
          </Badge>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && evaluationStatus.length === 0 ? (
          <div className="text-center py-4">Učitavanje...</div>
        ) : evaluationStatus.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            Nema podataka o napretku evaluatora
          </div>
        ) : (
          <div className="space-y-6">
            <div className="border-b pb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Ukupan napredak</h3>
                <span className="text-sm font-mono">
                  {evaluationStatus.reduce((sum, user) => sum + user.totalCompleted, 0)} / 
                  {evaluationStatus.reduce((sum, user) => sum + user.totalSamples, 0)}
                </span>
              </div>
              <Progress 
                value={getTotalProgress()} 
                className="h-2"
              />
              <p className="text-sm text-muted-foreground mt-1">
                {getTotalProgress().toFixed(1)}% završeno
              </p>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Napredak po evaluatoru</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {evaluationStatus
                  .sort((a, b) => a.position - b.position)
                  .map((user) => {
                    const percentage = getUserProgressPercentage(user);
                    return (
                      <div key={user.userId} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{user.username}</span>
                            <Badge variant="secondary" className="text-xs">
                              Pozicija {user.position}
                            </Badge>
                            {percentage === 100 && (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            )}
                          </div>
                          <span className="text-sm font-mono">
                            {user.totalCompleted} / {user.totalSamples}
                          </span>
                        </div>
                        <Progress 
                          value={percentage} 
                          className={`h-2 ${getProgressColor(percentage)}`}
                        />
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-sm text-muted-foreground">
                            {percentage.toFixed(1)}% završeno
                          </p>
                          {percentage === 100 && (
                            <Badge variant="default" className="bg-green-500">
                              Završeno
                            </Badge>
                          )}
                        </div>

                        <div className="mt-3 space-y-1">
                          {user.completedSamples.map((productType, index) => (
                            <div key={index} className="text-xs">
                              <span className="font-medium">{productType.productTypeName}:</span>
                              <span className="ml-2">
                                {productType.samples.filter(s => s.isCompleted).length} / {productType.samples.length} uzoraka
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
