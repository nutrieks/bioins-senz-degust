
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getEvents } from "@/services/dataService";
import { Event, EventStatus } from "@/types";
import { EventCard } from "@/components/admin/EventCard";
import { Calendar, PlusCircle } from "lucide-react";

export default function AdminDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const eventsData = await getEvents();
      // Sort by date descending
      eventsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setEvents(eventsData);
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const activeEvents = events.filter(
    (event) => event.status === EventStatus.ACTIVE || event.status === EventStatus.PREPARATION
  );
  
  const pastEvents = events.filter(
    (event) => event.status === EventStatus.COMPLETED || event.status === EventStatus.ARCHIVED
  );

  const handleCreateEvent = () => {
    navigate("/admin/events/new");
  };

  // Handle event updates by refreshing the events list
  const handleEventUpdated = () => {
    fetchEvents();
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Administracija</h1>
          <Button onClick={handleCreateEvent}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novi događaj
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Aktivni događaji</CardTitle>
              <CardDescription>
                Pregled trenutno aktivnih događaja i događaja u pripremi.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center p-4">Učitavanje...</div>
              ) : activeEvents.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {activeEvents.map((event) => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      onEventUpdated={handleEventUpdated} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center p-4 text-muted-foreground">
                  Nema aktivnih događaja.
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Završeni događaji</CardTitle>
              <CardDescription>
                Pregled završenih i arhiviranih događaja.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center p-4">Učitavanje...</div>
              ) : pastEvents.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {pastEvents.map((event) => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      onEventUpdated={handleEventUpdated} 
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center p-4 text-muted-foreground">
                  Nema završenih događaja.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
