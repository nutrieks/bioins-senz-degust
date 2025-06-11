
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EventStatus, Event } from "@/types";
import { CalendarClock, Users, Calendar, Package, Trash2 } from "lucide-react";
import { EvaluationProgressTracker } from "./EvaluationProgressTracker";
import { DeleteEventDialog } from "./DeleteEventDialog";

interface EventInfoCardProps {
  event: Event;
  isUpdating: boolean;
  onUpdateStatus: (status: EventStatus) => Promise<void>;
  onDeleteEvent: () => Promise<void>;
  formatDate: (date: string) => string;
  getStatusLabel: (status: EventStatus) => string;
}

export function EventInfoCard({
  event,
  isUpdating,
  onUpdateStatus,
  onDeleteEvent,
  formatDate,
  getStatusLabel,
}: EventInfoCardProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const statusColor = {
    [EventStatus.PREPARATION]: "bg-blue-100 text-blue-800",
    [EventStatus.ACTIVE]: "bg-green-100 text-green-800",
    [EventStatus.COMPLETED]: "bg-orange-100 text-orange-800",
    [EventStatus.ARCHIVED]: "bg-gray-100 text-gray-800",
  };

  const getNextStatusAction = (currentStatus: EventStatus) => {
    switch (currentStatus) {
      case EventStatus.PREPARATION:
        return {
          label: "Započni ocjenjivanje",
          status: EventStatus.ACTIVE,
          disabled: event.productTypes.length === 0,
        };
      case EventStatus.ACTIVE:
        return {
          label: "Završi ocjenjivanje",
          status: EventStatus.COMPLETED,
          disabled: false,
        };
      case EventStatus.COMPLETED:
        return {
          label: "Arhiviraj",
          status: EventStatus.ARCHIVED,
          disabled: false,
        };
      default:
        return null;
    }
  };

  const nextAction = getNextStatusAction(event.status);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informacije o događaju</CardTitle>
        <CardDescription>Osnovni podaci o događaju</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Datum događaja</p>
                <p className="text-sm text-muted-foreground">{formatDate(event.date)}</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <CalendarClock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Status</p>
                <div className="flex items-center space-x-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${statusColor[event.status]}`}>
                    {getStatusLabel(event.status)}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-start space-x-2">
              <Package className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Tipovi proizvoda</p>
                <p className="text-sm text-muted-foreground">
                  {event.productTypes.length} {event.productTypes.length === 1 ? "proizvod" : "proizvoda"}
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium">Broj ocjenitelja</p>
                <p className="text-sm text-muted-foreground">12 ocjenitelja</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-between items-center">
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setShowDeleteDialog(true)}
            disabled={isUpdating}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Obriši događaj
          </Button>

          {nextAction && (
            <Button
              onClick={() => onUpdateStatus(nextAction.status)}
              disabled={isUpdating || nextAction.disabled}
            >
              {isUpdating ? "Ažuriranje..." : nextAction.label}
            </Button>
          )}
        </div>
        
        {event.status === EventStatus.ACTIVE && (
          <EvaluationProgressTracker eventId={event.id} />
        )}

        <DeleteEventDialog
          open={showDeleteDialog}
          onOpenChange={setShowDeleteDialog}
          onConfirm={async () => {
            await onDeleteEvent();
            setShowDeleteDialog(false);
          }}
          eventDate={formatDate(event.date)}
        />
      </CardContent>
    </Card>
  );
}
