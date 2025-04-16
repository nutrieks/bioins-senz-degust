
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, CheckCircle, XCircle } from "lucide-react";
import { Event, EventStatus } from "@/types";

interface EventInfoCardProps {
  event: Event;
  isUpdating: boolean;
  onUpdateStatus: (status: EventStatus) => void;
  formatDate: (date: string) => string;
  getStatusLabel: (status: EventStatus) => string;
}

export function EventInfoCard({
  event,
  isUpdating,
  onUpdateStatus,
  formatDate,
  getStatusLabel,
}: EventInfoCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>Informacije o događaju</CardTitle>
            <CardDescription>Osnovna svojstva događaja i upravljanje statusom</CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium">Status:</span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
              event.status === EventStatus.ACTIVE 
                ? "bg-green-100 text-green-800" 
                : event.status === EventStatus.PREPARATION 
                ? "bg-blue-100 text-blue-800"
                : event.status === EventStatus.COMPLETED
                ? "bg-yellow-100 text-yellow-800"
                : "bg-gray-100 text-gray-800"
            }`}>
              {getStatusLabel(event.status)}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Datum događaja</p>
              <p className="flex items-center mt-1">
                <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                {formatDate(event.date)}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Randomizacija</p>
              <p className="flex items-center mt-1">
                {event.randomizationComplete ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Dovršena
                  </>
                ) : (
                  <>
                    <XCircle className="mr-2 h-4 w-4 text-red-500" />
                    Nije dovršena
                  </>
                )}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-6">
            {event.status === EventStatus.PREPARATION && (
              <Button 
                onClick={() => onUpdateStatus(EventStatus.ACTIVE)}
                disabled={isUpdating || !event.randomizationComplete}
              >
                Aktiviraj događaj
              </Button>
            )}
            
            {event.status === EventStatus.ACTIVE && (
              <Button 
                onClick={() => onUpdateStatus(EventStatus.COMPLETED)}
                disabled={isUpdating}
              >
                Završi događaj
              </Button>
            )}
            
            {(event.status === EventStatus.COMPLETED || event.status === EventStatus.ACTIVE) && (
              <Button 
                variant="outline"
                onClick={() => onUpdateStatus(EventStatus.ARCHIVED)}
                disabled={isUpdating}
              >
                Arhiviraj
              </Button>
            )}
            
            {event.status === EventStatus.ARCHIVED && (
              <Button 
                variant="outline"
                onClick={() => onUpdateStatus(EventStatus.COMPLETED)}
                disabled={isUpdating}
              >
                Vrati iz arhive
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
