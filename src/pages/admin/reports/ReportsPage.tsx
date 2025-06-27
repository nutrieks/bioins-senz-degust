
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Event as AppEvent, EventStatus } from "@/types";
import { RandomizationTab } from "./components/RandomizationTab";
import { ComingSoonTab } from "./components/ComingSoonTab";
import { useEvents } from "@/hooks/useEvents";
import { Button } from "@/components/ui/button";

export default function ReportsPage() {
  const { data: allEvents = [], isLoading, isError, error } = useEvents();

  if (isError) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-4">
              Greška pri dohvaćanju događaja
            </h2>
            <p className="text-muted-foreground mb-4">
              {error?.message || 'Nepoznata greška'}
            </p>
            <Button 
              onClick={() => window.location.reload()}
              variant="outline"
            >
              Pokušaj ponovno
            </Button>
          </div>
        </div>
      </AdminLayout>
    );
  }

  // Filter only completed or archived events
  const events = allEvents.filter(
    event => event.status === EventStatus.COMPLETED || event.status === EventStatus.ARCHIVED
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Izvještaji</h1>
        
        <Tabs defaultValue="randomization">
          <TabsList className="mb-4">
            <TabsTrigger value="randomization">Randomizacija</TabsTrigger>
            <TabsTrigger value="hedonic">Hedonika</TabsTrigger>
            <TabsTrigger value="jar">JAR</TabsTrigger>
          </TabsList>
          
          <TabsContent value="randomization">
            <RandomizationTab events={events} isLoading={isLoading} />
          </TabsContent>
          
          <TabsContent value="hedonic">
            <ComingSoonTab 
              title="Hedonički izvještaji"
              description="Pregled hedoničkih izvještaja za sve događaje."
            />
          </TabsContent>
          
          <TabsContent value="jar">
            <ComingSoonTab 
              title="JAR izvještaji"
              description="Pregled JAR (Just About Right) izvještaja za sve događaje."
            />
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
