import { useNavigate } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Event, EventStatus } from "@/types";
import { EventCard } from "@/components/admin/EventCard";
import { PlusCircle, Calendar, Users, BarChart3, TrendingUp } from "lucide-react";
import { useEvents, useDeleteEvent } from "@/hooks/useEvents";
import { MetricsCard } from "@/components/admin/MetricsCard";
export default function AdminDashboard() {
  const navigate = useNavigate();
  const {
    data: events = [],
    isLoading,
    isError,
    error
  } = useEvents();
  const deleteEventMutation = useDeleteEvent();
  if (isError) {
    return <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-4">
              Greška pri dohvaćanju događaja
            </h2>
            <p className="text-muted-foreground mb-4">
              {error?.message || 'Nepoznata greška'}
            </p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Pokušaj ponovno
            </Button>
          </div>
        </div>
      </AdminLayout>;
  }
  const sortedEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const activeEvents = sortedEvents.filter(event => event.status === EventStatus.ACTIVE || event.status === EventStatus.PREPARATION);
  const pastEvents = sortedEvents.filter(event => event.status === EventStatus.COMPLETED || event.status === EventStatus.ARCHIVED);
  const handleCreateEvent = () => {
    navigate("/admin/events/new");
  };
  const handleEventUpdated = () => {
    // React Query will handle this automatically through cache invalidation
  };
  const handleDeleteEvent = async (eventId: string) => {
    deleteEventMutation.mutate(eventId);
  };
  return <AdminLayout>
      <div className="space-y-8">
        {/* Header with gradient background */}
        <div className="admin-gradient-bg rounded-lg p-6 shadow-2xl admin-glow-border">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white mb-2">
                Admin Dashboard
              </h1>
              <p className="text-white/80">
                Upravljanje događajima i senzorskim analizama
              </p>
            </div>
            <Button onClick={handleCreateEvent} className="bg-white text-primary hover:bg-white/90 shadow-lg">
              <PlusCircle className="mr-2 h-4 w-4" />
              Novi događaj
            </Button>
          </div>
        </div>

        {/* Metrics Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <MetricsCard
            title="Ukupno događaja"
            value={events.length}
            icon={Calendar}
            trend={{ value: 12, isPositive: true }}
            description="Svi događaji u sustavu"
          />
          <MetricsCard
            title="Aktivni događaji"
            value={activeEvents.length}
            icon={TrendingUp}
            trend={{ value: 8, isPositive: true }}
            description="Trenutno aktivni"
          />
          <MetricsCard
            title="Završeni događaji"
            value={pastEvents.length}
            icon={BarChart3}
            description="Kompletni događaji"
          />
          <MetricsCard
            title="Evaluatori"
            value="24"
            icon={Users}
            trend={{ value: -2, isPositive: false }}
            description="Registrirani korisnici"
          />
        </div>

        <div className="grid gap-6">
          <Card className="admin-metrics-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Aktivni događaji
              </CardTitle>
              <CardDescription>
                Pregled trenutno aktivnih događaja i događaja u pripremi.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2 text-muted-foreground">Učitavanje...</span>
                </div> : activeEvents.length > 0 ? <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {activeEvents.map(event => <EventCard key={event.id} event={event} onEventUpdated={handleEventUpdated} onEventDeleted={() => handleDeleteEvent(event.id)} />)}
                </div> : <div className="text-center p-8 text-muted-foreground">
                  <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nema aktivnih događaja.</p>
                </div>}
            </CardContent>
          </Card>

          <Card className="admin-metrics-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Završeni događaji
              </CardTitle>
              <CardDescription>
                Pregled završenih i arhiviranih događaja.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? <div className="flex justify-center items-center p-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  <span className="ml-2 text-muted-foreground">Učitavanje...</span>
                </div> : pastEvents.length > 0 ? <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                  {pastEvents.map(event => <EventCard key={event.id} event={event} onEventUpdated={handleEventUpdated} onEventDeleted={() => handleDeleteEvent(event.id)} />)}
                </div> : <div className="text-center p-8 text-muted-foreground">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nema završenih događaja.</p>
                </div>}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>;
}