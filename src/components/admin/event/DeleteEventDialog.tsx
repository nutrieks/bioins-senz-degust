
import React from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteEventDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  eventDate: string;
}

export function DeleteEventDialog({
  open,
  onOpenChange,
  onConfirm,
  eventDate,
}: DeleteEventDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Obriši događaj</AlertDialogTitle>
          <AlertDialogDescription>
            Jeste li sigurni da želite obrisati događaj od {eventDate}?
            <br />
            <br />
            <strong>Ova akcija će trajno obrisati:</strong>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Sve tipove proizvoda povezane s ovim događajem</li>
              <li>Sve uzorke i njihove slike</li>
              <li>Sve ocjene ocjenitelja</li>
              <li>Sve randomizacijske tablice</li>
              <li>Sve JAR atribute</li>
            </ul>
            <br />
            <strong className="text-destructive">
              Ova akcija se ne može poništiti!
            </strong>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Odustani</AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            Da, obriši događaj
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
