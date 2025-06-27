
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Event, EventStatus } from "@/types";
import { EventCard } from "@/components/admin/EventCard";
import { PlusCircle } from "lucide-react";
import { useEvents, useDeleteEvent } from "@/hooks/useEvents";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { data: events = [], isLoading, isError, error } = useEvents();
  const deleteEventMutation = useDeleteEvent();

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

  const sortedEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const activeEvents = sortedEvents.filter(
    (event) => event.status === EventStatus.ACTIVE || event.status === EventStatus.PREPARATION
  );
  
  const pastEvents = sortedEvents.filter(
    (event) => event.status === EventStatus.COMPLETED || event.status === EventStatus.ARCHIVED
  );

  const handleCreateEvent = () => {
    navigate("/admin/events/new");
  };

  const handleEventUpdated = () => {
    // React Query will handle this automatically through cache invalidation
  };

  const handleDeleteEvent = async (eventId: string) => {
    deleteEventMutation.mutate(eventId);
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
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Učitavanje...</span>
                </div>
              ) : activeEvents.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {activeEvents.map((event) => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      onEventUpdated={handleEventUpdated}
                      onEventDeleted={() => handleDeleteEvent(event.id)}
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
                <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2">Učitavanje...</span>
                </div>
              ) : pastEvents.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {pastEvents.map((event) => (
                    <EventCard 
                      key={event.id} 
                      event={event} 
                      onEventUpdated={handleEventUpdated}
                      onEventDeleted={() => handleDeleteEvent(event.id)}
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
