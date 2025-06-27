
import { CardContent, CardDescription } from "@/components/ui/card";
import { Event, EventStatus } from "@/types";

interface EventCardContentProps {
  event: Event;
}

export function EventCardContent({ event }: EventCardContentProps) {
  const getStatusText = (status: EventStatus) => {
    switch (status) {
      case EventStatus.PREPARATION:
        return "Priprema";
      case EventStatus.ACTIVE:
        return "Aktivan";
      case EventStatus.COMPLETED:
        return "Završen";
      case EventStatus.ARCHIVED:
        return "Arhiviran";
      default:
        return status;
    }
  };

  return (
    <CardContent className="p-4">
      <CardDescription className="text-gray-600">
        Status: {getStatusText(event.status)}
      </CardDescription>
    </CardContent>
  );
}
