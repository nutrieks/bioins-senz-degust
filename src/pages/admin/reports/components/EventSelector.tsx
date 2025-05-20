
import { useState, useEffect } from "react";
import { Event } from "@/types";
import { Calendar } from "lucide-react";

interface EventSelectorProps {
  events: Event[];
  selectedEvent: Event | null;
  onEventSelect: (event: Event) => void;
  isLoading: boolean;
}

export function EventSelector({ 
  events, 
  selectedEvent, 
  onEventSelect,
  isLoading 
}: EventSelectorProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("hr-HR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  if (isLoading) {
    return <div className="text-center p-4">Učitavanje...</div>;
  }

  if (events.length === 0) {
    return (
      <div className="text-center p-6 border rounded-lg">
        <p className="text-muted-foreground">
          Nema završenih događaja za koje bi se mogli prikazati izvještaji.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full sm:w-64 p-4 border rounded-md">
      <h3 className="text-lg font-medium mb-3">Događaji</h3>
      <div className="space-y-2">
        {events.map((event) => (
          <button
            key={event.id}
            onClick={() => onEventSelect(event)}
            className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
              selectedEvent?.id === event.id 
                ? "bg-primary text-primary-foreground" 
                : "hover:bg-muted"
            }`}
          >
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              {formatDate(event.date)}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
