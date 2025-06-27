
import { Card } from "@/components/ui/card";
import { Event } from "@/types";
import { useState } from "react";
import { EventCardHeader } from "./event/EventCardHeader";
import { EventCardContent } from "./event/EventCardContent";
import { EventCardFooter } from "./event/EventCardFooter";

interface EventCardProps {
  event: Event;
  onEventUpdated: () => void;
  onEventDeleted: () => Promise<void>;
}

export function EventCard({ event, onEventUpdated, onEventDeleted }: EventCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);

  return (
    <Card className="bg-white shadow-md rounded-lg overflow-hidden">
      <EventCardHeader
        event={event}
        isUpdating={isUpdating}
        onEventUpdated={onEventUpdated}
        onEventDeleted={onEventDeleted}
      />
      <EventCardContent event={event} />
      <EventCardFooter event={event} />
    </Card>
  );
}
