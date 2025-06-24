
import { EvaluatorLayout } from "@/components/layout/EvaluatorLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { getEvents } from "@/services/dataService";
import { Event, EventStatus } from "@/types";
import { Calendar, ClipboardCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

export default function EvaluatorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: allEvents = [], isLoading, isError, error } = useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes for evaluators
    retry: 3,
    retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // Robust error handling
  if (isError) {
    return (
      <EvaluatorLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-4">
              Greška pri dohvaćanju događaja
            </h2>
            <p className="text-muted-foreground mb-4">
              {error?.message || 'Nepoznata greška'}
            </p>
            <Button 
              onClick={() => queryClient.invalidateQueries({ queryKey: ['events'] })}
              variant="outline"
            >
              Pokušaj ponovno
            </Button>
          </div>
        </div>
      </EvaluatorLayout>
    );
  }

  // Filter only active events
  const activeEvents = allEvents.filter((event) => event.status === EventStatus.ACTIVE);

  const handleStartEvaluation = (eventId: string) => {
    navigate(`/evaluator/evaluate/${eventId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("hr-HR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const getProductCountText = (count: number) => {
    if (count === 1) return "proizvod";
    if (count < 5) return "proizvoda";
    return "proizvoda";
  };

  return (
    <EvaluatorLayout>
      <div className="max-w-3xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">
            Dobrodošli, {user?.username}
          </h1>
          <p className="text-muted-foreground">
            Ocjenjivačko mjesto: {user?.evaluatorPosition || "-"}
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-center">
              <Calendar className="mr-2 h-5 w-5" />
              Aktivni događaji
            </CardTitle>
            <CardDescription className="text-center">
              Odaberite događaj za početak ocjenjivanja
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="ml-2">Učitavanje...</span>
              </div>
            ) : activeEvents.length > 0 ? (
              <div className="space-y-4">
                {activeEvents.map((event) => {
                  const productCount = event.productTypesCount || 0;
                  return (
                    <Card key={event.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{formatDate(event.date)}</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-muted-foreground">
                          {productCount} {getProductCountText(productCount)}
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full"
                          onClick={() => handleStartEvaluation(event.id)}
                        >
                          <ClipboardCheck className="mr-2 h-4 w-4" />
                          Započni ocjenjivanje
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center p-8">
                <p>Nema aktivnih događaja za ocjenjivanje.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Molimo kontaktirajte administratora.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator className="my-8" />

        <div className="text-center space-y-2">
          <h2 className="text-lg font-medium">Upute za ocjenjivanje</h2>
          <p className="text-sm text-muted-foreground">
            Molimo pažljivo ocijenite svaki uzorak prema zadanim kriterijima.
            Ocjenjivanje je sekvencijalno i ne možete se vraćati na prethodne uzorke.
          </p>
        </div>
      </div>
    </EvaluatorLayout>
  );
}
