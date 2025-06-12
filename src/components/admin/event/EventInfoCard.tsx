
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { EventStatus, Event } from "@/types";
import { CalendarClock, Users, Calendar, Package, Trash2, AlertTriangle } from "lucide-react";
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
        // Check if all product types have randomization generated
        const allRandomized = event.productTypes.every(pt => pt.hasRandomization);
        const hasProductTypes = event.productTypes.length > 0;
        
        return {
          label: "Započni ocjenjivanje",
          status: EventStatus.ACTIVE,
          disabled: !hasProductTypes || !allRandomized,
          reason: !hasProductTypes 
            ? "Dodajte tipove proizvoda prije aktivacije"
            : !allRandomized 
            ? "Generirajte randomizacije za sve tipove proizvoda"
            : undefined
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

  // Count how many product types don't have randomization
  const productTypesWithoutRandomization = event.productTypes.filter(pt => !pt.hasRandomization);

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
                {event.status === EventStatus.PREPARATION && productTypesWithoutRandomization.length > 0 && (
                  <div className="flex items-center space-x-1 mt-1">
                    <AlertTriangle className="h-4 w-4 text-amber-500" />
                    <p className="text-xs text-amber-600">
                      {productTypesWithoutRandomization.length} bez randomizacije
                    </p>
                  </div>
                )}
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

        {/* Show warning if trying to activate without all randomizations */}
        {event.status === EventStatus.PREPARATION && productTypesWithoutRandomization.length > 0 && (
          <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">Potrebno generirati randomizacije</p>
                <p className="text-sm text-amber-700 mt-1">
                  Prije aktivacije događaja morate generirati randomizacije za sve tipove proizvoda. 
                  Idite na tab "Randomizacija" i generirajte randomizacije za:
                </p>
                <ul className="text-sm text-amber-700 mt-2 ml-4 list-disc">
                  {productTypesWithoutRandomization.map(pt => (
                    <li key={pt.id}>{pt.productName} ({pt.customerCode})</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

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
            <div className="flex flex-col items-end space-y-2">
              <Button
                onClick={() => onUpdateStatus(nextAction.status)}
                disabled={isUpdating || nextAction.disabled}
                title={nextAction.reason}
              >
                {isUpdating ? "Ažuriranje..." : nextAction.label}
              </Button>
              {nextAction.disabled && nextAction.reason && (
                <p className="text-xs text-muted-foreground text-right max-w-48">
                  {nextAction.reason}
                </p>
              )}
            </div>
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
