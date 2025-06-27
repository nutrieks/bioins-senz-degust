
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Event, EventStatus } from "@/types";
import { EventCard } from "@/components/admin/EventCard";
import { PlusCircle, Search } from "lucide-react";
import { useEvents, useDeleteEvent } from "@/hooks/useEvents";

export default function EventsPage() {
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const navigate = useNavigate();
  
  const { data: events = [], isLoading, isError, error } = useEvents();
  const deleteEventMutation = useDeleteEvent();

  useEffect(() => {
    let result = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    // Apply status filter
    if (statusFilter !== "all") {
      result = result.filter(event => {
        if (statusFilter === "active") {
          return event.status === EventStatus.ACTIVE;
        } else if (statusFilter === "preparation") {
          return event.status === EventStatus.PREPARATION;
        } else if (statusFilter === "completed") {
          return event.status === EventStatus.COMPLETED;
        } else if (statusFilter === "archived") {
          return event.status === EventStatus.ARCHIVED;
        }
        return true;
      });
    }
    
    // Apply search filter if there's a search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(event => {
        const date = new Date(event.date);
        const formattedDate = date.toLocaleDateString();
        return formattedDate.includes(term);
      });
    }
    
    setFilteredEvents(result);
  }, [events, statusFilter, searchTerm]);

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

  const handleCreateEvent = () => {
    navigate("/admin/events/new");
  };

  const handleEventUpdated = () => {
    // React Query handles this automatically
  };

  const handleDeleteEvent = async (eventId: string) => {
    deleteEventMutation.mutate(eventId);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">Pregled događaja</h1>
          <Button onClick={handleCreateEvent}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novi događaj
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Pretraži po datumu..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={setStatusFilter}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter po statusu" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Svi statusi</SelectItem>
              <SelectItem value="preparation">Priprema</SelectItem>
              <SelectItem value="active">Aktivni</SelectItem>
              <SelectItem value="completed">Završeni</SelectItem>
              <SelectItem value="archived">Arhivirani</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {isLoading ? (
          <div className="text-center p-4">Učitavanje...</div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
            {filteredEvents.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                onEventUpdated={handleEventUpdated}
                onEventDeleted={() => handleDeleteEvent(event.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center p-8 border rounded-lg">
            <p className="text-muted-foreground">Nema pronađenih događaja.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
