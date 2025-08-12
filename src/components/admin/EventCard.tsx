
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
    <Card className="bg-card border rounded-lg overflow-hidden shadow-sm transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:ring-1 hover:ring-primary/10">
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
