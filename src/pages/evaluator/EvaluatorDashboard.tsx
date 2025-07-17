
import { EvaluatorLayout } from "@/components/layout/EvaluatorLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { EventStatus } from "@/types";
import { Calendar, ClipboardCheck, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useEvents } from "@/hooks/useEvents";
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from "@/hooks/use-toast";

export default function EvaluatorDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: allEvents = [], isLoading, isError, error } = useEvents();

  // DEBUG LOGGING - Track all events received
  console.log('[EvaluatorDashboard] === DEBUG START ===');
  console.log('[EvaluatorDashboard] Raw allEvents data:', allEvents);
  console.log('[EvaluatorDashboard] AllEvents length:', allEvents.length);
  console.log('[EvaluatorDashboard] AllEvents details:', allEvents.map(e => ({ 
    id: e.id, 
    date: e.date, 
    status: e.status 
  })));
  console.log('[EvaluatorDashboard] isLoading:', isLoading);
  console.log('[EvaluatorDashboard] isError:', isError);
  console.log('[EvaluatorDashboard] error:', error);
  console.log('[EvaluatorDashboard] === DEBUG END ===');

  const handleClearCache = async () => {
    console.log('[EvaluatorDashboard] Clearing all caches...');
    
    // Clear React Query cache
    await queryClient.invalidateQueries({ queryKey: ['events'] });
    await queryClient.invalidateQueries({ queryKey: ['event'] });
    await queryClient.removeQueries({ queryKey: ['events'] });
    await queryClient.removeQueries({ queryKey: ['event'] });
    
    // Clear browser storage
    localStorage.clear();
    sessionStorage.clear();
    
    toast({
      title: "Cache očišćen",
      description: "Svi cache-ovi su obrisani. Stranica će se osvježiti.",
    });
    
    // Force page reload
    setTimeout(() => window.location.reload(), 1000);
  };

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
            <div className="space-x-2">
              <Button 
                onClick={() => window.location.reload()}
                variant="outline"
              >
                Pokušaj ponovno
              </Button>
              <Button 
                onClick={handleClearCache}
                variant="outline"
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                Očisti Cache
              </Button>
            </div>
          </div>
        </div>
      </EvaluatorLayout>
    );
  }

  const activeEvents = allEvents.filter((event) => event.status === EventStatus.ACTIVE);

  // DEBUG LOGGING - Track filtered active events
  console.log('[EvaluatorDashboard] ActiveEvents filtered:', activeEvents);
  console.log('[EvaluatorDashboard] ActiveEvents count:', activeEvents.length);
  console.log('[EvaluatorDashboard] ActiveEvents IDs:', activeEvents.map(e => e.id));

  const handleStartEvaluation = (eventId: string) => {
    console.log('[EvaluatorDashboard] handleStartEvaluation called with eventId:', eventId);
    console.log('[EvaluatorDashboard] EventId type:', typeof eventId);
    console.log('[EvaluatorDashboard] Target URL will be:', `/evaluator/evaluate/${eventId}`);
    
    // Verify this eventId exists in our activeEvents
    const foundEvent = activeEvents.find(e => e.id === eventId);
    console.log('[EvaluatorDashboard] Found event for this ID:', foundEvent);
    
    if (!foundEvent) {
      console.error('[EvaluatorDashboard] ERROR: EventId not found in activeEvents!');
      toast({
        title: "Greška",
        description: "Događaj nije pronađen. Molimo osvježite stranicu.",
        variant: "destructive",
      });
      return;
    }
    
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

  const getSampleCountText = (count: number) => {
    if (count === 1) return "uzorak";
    if (count < 5) return "uzorka";
    return "uzoraka";
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
                  const samplesCount = event.samplesCount || 0;
                  console.log('[EvaluatorDashboard] Rendering event card:', { 
                    id: event.id, 
                    date: event.date, 
                    samplesCount 
                  });
                  
                  return (
                    <Card key={event.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{formatDate(event.date)}</CardTitle>
                        <CardDescription className="text-xs text-muted-foreground">
                          ID: {event.id}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-muted-foreground">
                          {samplesCount} {getSampleCountText(samplesCount)}
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
                <Button 
                  onClick={handleClearCache}
                  variant="outline"
                  className="mt-4"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Očisti Cache i Pokušaj Ponovno
                </Button>
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
