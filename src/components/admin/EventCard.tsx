
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EventStatus, Event } from "@/types";
import { Calendar, ClipboardList, FileBarChart } from "lucide-react";
import { useNavigate } from "react-router-dom";

// Helper function to format date
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat("hr-HR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

// Helper function to get status badge variant
const getStatusBadge = (status: EventStatus) => {
  switch (status) {
    case EventStatus.PREPARATION:
      return { variant: "secondary" as const, label: "U pripremi" };
    case EventStatus.ACTIVE:
      return { variant: "default" as const, label: "Aktivan" };
    case EventStatus.COMPLETED:
      return { variant: "success" as const, label: "Završen" };
    case EventStatus.ARCHIVED:
      return { variant: "outline" as const, label: "Arhiviran" };
    default:
      return { variant: "outline" as const, label: status };
  }
};

interface EventCardProps {
  event: Event;
}

export function EventCard({ event }: EventCardProps) {
  const navigate = useNavigate();
  const badge = getStatusBadge(event.status);
  
  const handleNavigateToProducts = () => {
    navigate(`/admin/events/${event.id}/products`);
  };
  
  const handleNavigateToReports = () => {
    navigate(`/admin/events/${event.id}/reports`);
  };
  
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-4 w-4" />
              {formatDate(event.date)}
            </CardTitle>
            <CardDescription>
              {event.productTypes.length} {event.productTypes.length === 1 ? "proizvod" : 
                (event.productTypes.length > 1 && event.productTypes.length < 5) ? "proizvoda" : "proizvoda"}
            </CardDescription>
          </div>
          <Badge variant={badge.variant}>{badge.label}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="flex items-center text-sm">
            <span className="text-muted-foreground">Kreirano:</span>
            <span className="ml-auto">{formatDate(event.createdAt)}</span>
          </div>
          <div className="flex items-center text-sm">
            <span className="text-muted-foreground">Randomizacija:</span>
            <span className="ml-auto">
              {event.randomizationComplete ? "Dovršena" : "Nije dovršena"}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm" onClick={handleNavigateToProducts}>
          <ClipboardList className="mr-2 h-4 w-4" />
          Proizvodi
        </Button>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleNavigateToReports}
          disabled={event.status !== EventStatus.COMPLETED && event.status !== EventStatus.ARCHIVED}
        >
          <FileBarChart className="mr-2 h-4 w-4" />
          Izvještaji
        </Button>
      </CardFooter>
    </Card>
  );
}
