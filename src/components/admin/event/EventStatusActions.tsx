
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Event, EventStatus } from "@/types";
import { updateEventStatus } from "@/services/dataService";
import { toast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { DeleteEventDialog } from "./DeleteEventDialog";

interface EventStatusActionsProps {
  event: Event;
  isUpdating: boolean;
  onEventUpdated: () => void;
  onEventDeleted: () => Promise<void>;
}

export function EventStatusActions({
  event,
  isUpdating,
  onEventUpdated,
  onEventDeleted,
}: EventStatusActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleActivate = async () => {
    setIsProcessing(true);
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
      setIsProcessing(false);
    }
  };

  const handleComplete = async () => {
    setIsProcessing(true);
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
      setIsProcessing(false);
    }
  };

  const handleArchive = async () => {
    setIsProcessing(true);
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
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    try {
      await onEventDeleted();
      setShowDeleteDialog(false);
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom brisanja događaja.",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
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
    <div className="flex items-center space-x-2">
      {event.status === EventStatus.PREPARATION && (
        <Button
          variant="default"
          size="sm"
          onClick={handleActivate}
          disabled={isUpdating || isProcessing}
        >
          Aktiviraj
        </Button>
      )}
      
      {event.status === EventStatus.ACTIVE && (
        <Button
          variant="default"
          size="sm"
          onClick={handleComplete}
          disabled={isUpdating || isProcessing}
        >
          Završi
        </Button>
      )}
      
      {(event.status === EventStatus.COMPLETED || event.status === EventStatus.ACTIVE) && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={isUpdating || isProcessing}>
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
                <Button type="button" variant="secondary">
                  Odustani
                </Button>
              </DialogClose>
              <Button 
                type="submit" 
                variant="default" 
                onClick={handleArchive}
                disabled={isProcessing}
              >
                Arhiviraj
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      <Button
        variant="destructive"
        size="sm"
        disabled={isUpdating || isProcessing}
        onClick={() => setShowDeleteDialog(true)}
      >
        <Trash2 className="h-4 w-4" />
      </Button>

      <DeleteEventDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        onConfirm={handleDelete}
        eventDate={formatDate(event.date)}
      />
    </div>
  );
}
