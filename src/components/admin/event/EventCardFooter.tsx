
import { Link } from "react-router-dom";
import { Settings } from "lucide-react";
import { CardFooter } from "@/components/ui/card";
import { Event } from "@/types";

interface EventCardFooterProps {
  event: Event;
}

export function EventCardFooter({ event }: EventCardFooterProps) {
  return (
    <CardFooter className="flex justify-between items-center p-4">
      <Link 
        to={`/admin/events/${event.id}`} 
        className="text-blue-500 hover:underline flex items-center"
      >
        <Settings className="mr-2 h-4 w-4" />
        Upravljanje
      </Link>
      <div className="text-sm text-gray-500">
        Kreirano: {new Date(event.createdAt).toLocaleDateString()}
      </div>
    </CardFooter>
  );
}
