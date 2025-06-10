
import { useEffect, useState } from "react";
import { EvaluatorLayout } from "@/components/layout/EvaluatorLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { getEvents } from "@/services/dataService";
import { Event, EventStatus } from "@/types";
import { Calendar, ClipboardCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function EvaluatorDashboard() {
  const { user } = useAuth();
  const [activeEvents, setActiveEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const events = await getEvents();
        console.log("Fetched events with product counts:", events);
        // Filter only active events
        const active = events.filter((event) => event.status === EventStatus.ACTIVE);
        setActiveEvents(active);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const handleStartEvaluation = (eventId: string) => {
    navigate(`/evaluator/evaluate/${eventId}`);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("hr-HR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const getProductCountText = (count: number) => {
    if (count === 1) return "proizvod";
    if (count < 5) return "proizvoda";
    return "proizvoda";
  };

  return (
    <EvaluatorLayout>
      <div className="max-w-3xl mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold">
            Dobrodošli, {user?.username}
          </h1>
          <p className="text-muted-foreground">
            Ocjenjivačko mjesto: {user?.evaluatorPosition || "-"}
          </p>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-center">
              <Calendar className="mr-2 h-5 w-5" />
              Aktivni događaji
            </CardTitle>
            <CardDescription className="text-center">
              Odaberite događaj za početak ocjenjivanja
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center p-4">Učitavanje...</div>
            ) : activeEvents.length > 0 ? (
              <div className="space-y-4">
                {activeEvents.map((event) => {
                  const productCount = event.productTypesCount || 0;
                  return (
                    <Card key={event.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{formatDate(event.date)}</CardTitle>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <p className="text-sm text-muted-foreground">
                          {productCount} {getProductCountText(productCount)}
                        </p>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          className="w-full"
                          onClick={() => handleStartEvaluation(event.id)}
                        >
                          <ClipboardCheck className="mr-2 h-4 w-4" />
                          Započni ocjenjivanje
                        </Button>
                      </CardFooter>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center p-8">
                <p>Nema aktivnih događaja za ocjenjivanje.</p>
                <p className="text-sm text-muted-foreground mt-2">
                  Molimo kontaktirajte administratora.
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Separator className="my-8" />

        <div className="text-center space-y-2">
          <h2 className="text-lg font-medium">Upute za ocjenjivanje</h2>
          <p className="text-sm text-muted-foreground">
            Molimo pažljivo ocijenite svaki uzorak prema zadanim kriterijima.
            Ocjenjivanje je sekvencijalno i ne možete se vraćati na prethodne uzorke.
          </p>
        </div>
      </div>
    </EvaluatorLayout>
  );
}
