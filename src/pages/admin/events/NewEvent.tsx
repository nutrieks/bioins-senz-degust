
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useCreateEvent } from "@/hooks/useEvents";

export default function NewEvent() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const navigate = useNavigate();
  const createEventMutation = useCreateEvent();

  // Handle navigation after successful creation with proper cache validation
  useEffect(() => {
    if (createEventMutation.isSuccess && createEventMutation.data) {
      console.log("Event created successfully:", createEventMutation.data);
      
      // Wait for event to be properly cached before navigation
      const waitForEventAndNavigate = async () => {
        try {
          // Import here to avoid circular dependencies
          const { centralizedEventService } = await import("@/services/centralizedEventService");
          
          // Wait for the event to be available in cache
          const cachedEvent = await centralizedEventService.waitForEventInCache(
            createEventMutation.data.id, 
            3000 // Wait up to 3 seconds
          );
          
          if (cachedEvent) {
            console.log("Event confirmed in cache, navigating:", cachedEvent.id);
            navigate(`/admin/events/${cachedEvent.id}`);
          } else {
            console.log("Event not found in cache, navigating anyway with fallback");
            // Navigate anyway - the EventDetail component will handle the fallback
            navigate(`/admin/events/${createEventMutation.data.id}`);
          }
        } catch (error) {
          console.error("Error waiting for event cache:", error);
          // Fallback navigation
          navigate(`/admin/events/${createEventMutation.data.id}`);
        }
      };
      
      waitForEventAndNavigate();
    }
  }, [createEventMutation.isSuccess, createEventMutation.data, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      return;
    }
    
    const formattedDate = format(date, "yyyy-MM-dd");
    createEventMutation.mutate(formattedDate);
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Novi događaj</h1>
        
        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Osnovne informacije</CardTitle>
              <CardDescription>
                Unesite osnovne informacije o novom događaju. Nakon kreiranja događaja, moći ćete dodati tipove proizvoda i uzorke.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Datum događaja</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                      disabled={createEventMutation.isPending}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "dd.MM.yyyy") : "Odaberite datum"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/admin")}
                disabled={createEventMutation.isPending}
              >
                Odustani
              </Button>
              <Button 
                type="submit" 
                disabled={createEventMutation.isPending || !date}
              >
                {createEventMutation.isPending ? "Kreiranje..." : "Kreiraj događaj"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AdminLayout>
  );
}
