import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, ClipboardList, Settings } from "lucide-react";
import { Link } from "react-router-dom";
import { Event, EventStatus } from "@/types";
import { updateEventStatus } from "@/services/dataService";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface EventCardProps {
  event: Event;
  onEventUpdated: () => void;
}

export function EventCard({ event, onEventUpdated }: EventCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleActivate = async () => {
    setIsUpdating(true);
    try {
      await updateEventStatus(event.id, EventStatus.ACTIVE);
      toast({
        title: "Događaj aktiviran",
        description: "Događaj je uspješno aktiviran.",
      });
      onEventUpdated();
    } catch (error) {
      console.error("Error activating event:", error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom aktiviranja događaja.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleComplete = async () => {
    setIsUpdating(true);
    try {
      await updateEventStatus(event.id, EventStatus.COMPLETED);
      toast({
        title: "Događaj završen",
        description: "Događaj je uspješno završen.",
      });
      onEventUpdated();
    } catch (error) {
      console.error("Error completing event:", error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom završavanja događaja.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleArchive = async () => {
    setIsUpdating(true);
    try {
      await updateEventStatus(event.id, EventStatus.ARCHIVED);
      toast({
        title: "Događaj arhiviran",
        description: "Događaj je uspješno arhiviran.",
      });
      onEventUpdated();
    } catch (error) {
      console.error("Error archiving event:", error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom arhiviranja događaja.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("hr-HR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  return (
    <Card className="bg-white shadow-md rounded-lg overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Calendar className="mr-2 h-5 w-5 text-gray-500" />
          {formatDate(event.date)}
        </CardTitle>
        <div className="flex items-center space-x-2">
          {event.status === EventStatus.PREPARATION && (
            <Button
              variant="default"
              size="sm"
              onClick={handleActivate}
              disabled={isUpdating}
            >
              Aktiviraj
            </Button>
          )}
          {event.status === EventStatus.ACTIVE && (
            <Button
              variant="default"
              size="sm"
              onClick={handleComplete}
              disabled={isUpdating}
            >
              Završi
            </Button>
          )}
          {(event.status === EventStatus.COMPLETED ||
            event.status === EventStatus.ACTIVE) && (
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    Arhiviraj
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Arhiviraj događaj</DialogTitle>
                    <DialogDescription>
                      Jeste li sigurni da želite arhivirati ovaj događaj?
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button type="button" variant="secondary">Odustani</Button>
                    </DialogClose>
                    <Button type="submit" variant="default" onClick={handleArchive}>
                      Arhiviraj
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <CardDescription className="text-gray-600">
          Status:{" "}
          {event.status === EventStatus.PREPARATION
            ? "Priprema"
            : event.status === EventStatus.ACTIVE
            ? "Aktivan"
            : event.status === EventStatus.COMPLETED
            ? "Završen"
            : "Arhiviran"}
        </CardDescription>
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4">
        <Link to={`/admin/event/${event.id}`} className="text-blue-500 hover:underline flex items-center">
          <Settings className="mr-2 h-4 w-4" />
          Upravljanje
        </Link>
        <div className="text-sm text-gray-500">
          Kreirano: {new Date(event.createdAt).toLocaleDateString()}
        </div>
      </CardFooter>
    </Card>
  );
}
