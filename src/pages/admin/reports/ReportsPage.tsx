
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEvents } from "@/services/dataService";
import { Event, EventStatus } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { RandomizationTab } from "./components/RandomizationTab";
import { ComingSoonTab } from "./components/ComingSoonTab";

export default function ReportsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch all events
  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const fetchedEvents = await getEvents();
      // Filter only completed or archived events
      const filteredEvents = fetchedEvents.filter(
        event => event.status === EventStatus.COMPLETED || event.status === EventStatus.ARCHIVED
      );
      setEvents(filteredEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom dohvaćanja podataka o događajima.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

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
