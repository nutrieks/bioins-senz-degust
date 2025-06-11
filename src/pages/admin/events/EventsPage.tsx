
import { useEffect, useState } from "react";
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
import { getEvents, deleteEvent } from "@/services/dataService";
import { Event, EventStatus } from "@/types";
import { EventCard } from "@/components/admin/EventCard";
import { PlusCircle, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchEvents = async () => {
    try {
      setIsLoading(true);
      const eventsData = await getEvents();
      // Sort by date descending
      eventsData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setEvents(eventsData);
      setFilteredEvents(eventsData);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast({
        title: "Greška",
        description: "Došlo je do greške prilikom dohvaćanja događaja.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    let result = events;
    
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

  const handleCreateEvent = () => {
    navigate("/admin/events/new");
  };

  const handleEventUpdated = () => {
    fetchEvents();
  };

  const handleDeleteEvent = async (eventId: string) => {
    try {
      console.log('Deleting event:', eventId);
      const success = await deleteEvent(eventId);
      
      if (success) {
        toast({
          title: "Uspjeh",
          description: "Događaj je uspješno obrisan.",
        });
        fetchEvents(); // Refresh the events list
      } else {
        throw new Error('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      toast({
        title: "Greška",
        description: "Došlo je do greške prilikom brisanja događaja.",
        variant: "destructive",
      });
    }
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
