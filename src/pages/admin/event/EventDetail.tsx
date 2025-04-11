
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getEvent, updateEventStatus } from "@/services/dataService";
import { Event, EventStatus } from "@/types";
import { ArrowLeft, Calendar, CheckCircle, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>();
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchEvent = async () => {
    if (!eventId) return;
    try {
      setIsLoading(true);
      const eventData = await getEvent(eventId);
      setEvent(eventData);
    } catch (error) {
      console.error("Error fetching event:", error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom dohvaćanja podataka o događaju.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [eventId]);

  const handleUpdateStatus = async (status: EventStatus) => {
    if (!eventId) return;
    setIsUpdating(true);
    try {
      await updateEventStatus(eventId, status);
      await fetchEvent();
      toast({
        title: "Uspješno",
        description: `Status događaja je promijenjen na "${getStatusLabel(status)}".`,
      });
    } catch (error) {
      console.error("Error updating event status:", error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom ažuriranja statusa događaja.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusLabel = (status: EventStatus) => {
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
        return "Nepoznat";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("hr-HR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="text-center p-8">Učitavanje...</div>
      </AdminLayout>
    );
  }

  if (!event) {
    return (
      <AdminLayout>
        <div className="text-center p-8">
          <h2 className="text-xl font-bold mb-2">Događaj nije pronađen</h2>
          <p className="text-muted-foreground mb-4">Traženi događaj ne postoji ili je uklonjen.</p>
          <Button onClick={() => navigate("/admin")}>Povratak na početnu</Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="icon" onClick={() => navigate("/admin")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-2xl font-bold">Događaj: {formatDate(event.date)}</h1>
        </div>

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
                    onClick={() => handleUpdateStatus(EventStatus.ACTIVE)}
                    disabled={isUpdating || !event.randomizationComplete}
                  >
                    Aktiviraj događaj
                  </Button>
                )}
                
                {event.status === EventStatus.ACTIVE && (
                  <Button 
                    onClick={() => handleUpdateStatus(EventStatus.COMPLETED)}
                    disabled={isUpdating}
                  >
                    Završi događaj
                  </Button>
                )}
                
                {(event.status === EventStatus.COMPLETED || event.status === EventStatus.ACTIVE) && (
                  <Button 
                    variant="outline"
                    onClick={() => handleUpdateStatus(EventStatus.ARCHIVED)}
                    disabled={isUpdating}
                  >
                    Arhiviraj
                  </Button>
                )}
                
                {event.status === EventStatus.ARCHIVED && (
                  <Button 
                    variant="outline"
                    onClick={() => handleUpdateStatus(EventStatus.COMPLETED)}
                    disabled={isUpdating}
                  >
                    Vrati iz arhive
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="products">
          <TabsList className="mb-4">
            <TabsTrigger value="products">Tipovi proizvoda</TabsTrigger>
            <TabsTrigger value="reports">Izvještaji</TabsTrigger>
          </TabsList>
          
          <TabsContent value="products">
            <Card>
              <CardHeader>
                <CardTitle>Tipovi proizvoda</CardTitle>
                <CardDescription>
                  Upravljanje tipovima proizvoda i uzorcima za ovaj događaj.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {event.productTypes.length === 0 ? (
                  <div className="text-center p-6 border rounded-lg">
                    <p className="text-muted-foreground mb-4">Nema dodanih tipova proizvoda.</p>
                    <Button>Dodaj tip proizvoda</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <p>Uskoro implementacija prikaza tipova proizvoda...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Izvještaji</CardTitle>
                <CardDescription>
                  Pregled i generiranje izvještaja za ovaj događaj.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {event.status !== EventStatus.COMPLETED && event.status !== EventStatus.ARCHIVED ? (
                  <p className="text-muted-foreground">
                    Izvještaji će biti dostupni nakon što događaj bude završen.
                  </p>
                ) : (
                  <div className="space-y-4">
                    <p>Uskoro implementacija izvještaja...</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
}
