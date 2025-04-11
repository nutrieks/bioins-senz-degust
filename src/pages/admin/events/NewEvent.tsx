
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { createEvent } from "@/services/dataService";
import { useToast } from "@/hooks/use-toast";

export default function NewEvent() {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!date) {
      toast({
        title: "Greška",
        description: "Morate odabrati datum događaja.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    try {
      const formattedDate = format(date, "yyyy-MM-dd");
      const event = await createEvent(formattedDate);
      
      toast({
        title: "Uspješno",
        description: "Događaj je uspješno kreiran.",
      });
      
      navigate(`/admin/event/${event.id}`);
    } catch (error) {
      console.error("Error creating event:", error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom kreiranja događaja.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
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
                      disabled={isLoading}
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
                disabled={isLoading}
              >
                Odustani
              </Button>
              <Button type="submit" disabled={isLoading || !date}>
                {isLoading ? "Kreiranje..." : "Kreiraj događaj"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </AdminLayout>
  );
}
