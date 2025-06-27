
import { Calendar } from "lucide-react";
import { CardHeader, CardTitle } from "@/components/ui/card";
import { Event } from "@/types";
import { EventStatusActions } from "./EventStatusActions";

interface EventCardHeaderProps {
  event: Event;
  isUpdating: boolean;
  onEventUpdated: () => void;
  onEventDeleted: () => Promise<void>;
}

export function EventCardHeader({ 
  event, 
  isUpdating, 
  onEventUpdated, 
  onEventDeleted 
}: EventCardHeaderProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("hr-HR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  return (
    <CardHeader className="flex flex-row items-center justify-between p-4">
      <CardTitle className="text-lg font-semibold flex items-center">
        <Calendar className="mr-2 h-5 w-5 text-gray-500" />
        {formatDate(event.date)}
      </CardTitle>
      <EventStatusActions
        event={event}
        isUpdating={isUpdating}
        onEventUpdated={onEventUpdated}
        onEventDeleted={onEventDeleted}
      />
    </CardHeader>
  );
}
