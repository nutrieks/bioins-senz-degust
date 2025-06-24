
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getEvents, deleteEvent } from "@/services/dataService";
import { Event, EventStatus } from "@/types";
import { EventCard } from "@/components/admin/EventCard";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: events = [], isLoading, isError, error } = useQuery({
    queryKey: ['events'],
    queryFn: getEvents,
  });

  const deleteEventMutation = useMutation({
    mutationFn: deleteEvent,
    onSuccess: () => {
      toast({
        title: "Uspješno",
        description: "Događaj je uspješno obrisan.",
      });
      queryClient.invalidateQueries({ queryKey: ['events'] });
    },
    onError: (error: Error) => {
      console.error('Error deleting event:', error);
      toast({
        title: "Greška",
        description: "Došlo je do greške prilikom brisanja događaja.",
        variant: "destructive",
      });
    },
  });

  // Handle query errors
  if (isError) {
    toast({
      title: "Greška",
      description: `Nije moguće dohvatiti događaje: ${error?.message || 'Nepoznata greška'}`,
      variant: "destructive"
    });
  }

  // Sort events by date descending
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
    queryClient.invalidateQueries({ queryKey: ['events'] });
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
                <div className="text-center p-4">Učitavanje...</div>
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
                <div className="text-center p-4">Učitavanje...</div>
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
