import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus, ArrowLeft } from "lucide-react";
import { EventInfoCard } from "@/components/admin/event/EventInfoCard";
import { ProductTypesTab } from "@/components/admin/event/ProductTypesTab";
import { RandomizationTab } from "@/components/admin/event/RandomizationTab";
import { ReportsTab } from "@/components/admin/event/ReportsTab";
import {
  getEvent,
  updateEventStatus,
  deleteEvent as deleteEventAPI,
} from "@/services/supabase/events";
import { getProductTypes } from "@/services/supabase/productTypes";
import { createRandomization, getRandomization } from "@/services/supabase/randomization";
import { formatDate } from "@/utils";
import { EventStatus, Event, ProductType } from "@/types";
import { useToast } from "@/hooks/use-toast";

export default function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [event, setEvent] = useState<Event | null>(null);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [generatingRandomization, setGeneratingRandomization] = useState<{
    [productTypeId: string]: boolean;
  }>({});

  useEffect(() => {
    if (eventId) {
      refreshEventData();
    }
  }, [eventId]);

  const refreshEventData = async () => {
    if (!eventId) return;
    
    console.log('Refreshing event data...');
    try {
      const eventData = await getEvent(eventId);
      const productTypesData = await getProductTypes(eventId);
      
      if (eventData && productTypesData) {
        // Update hasRandomization flag for each product type
        const updatedProductTypes = await Promise.all(
          productTypesData.map(async (pt) => {
            const randomizationData = await getRandomization(pt.id);
            return {
              ...pt,
              hasRandomization: !!randomizationData
            };
          })
        );
        
        setEvent({ ...eventData, productTypes: updatedProductTypes });
        setProductTypes(updatedProductTypes);
        console.log('Event data refreshed successfully');
      }
    } catch (error) {
      console.error('Error refreshing event data:', error);
    }
  };

  const handleUpdateStatus = async (status: EventStatus) => {
    if (!eventId) return;

    setIsUpdating(true);
    try {
      const success = await updateEventStatus(eventId, status);
      if (success) {
        toast({
          title: "Uspjeh",
          description: `Status događaja promijenjen u ${getStatusLabel(status)}.`,
        });
        await refreshEventData();
      } else {
        throw new Error("Failed to update event status");
      }
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

  const handleDeleteEvent = async () => {
    if (!eventId) return;

    setIsDeleting(true);
    try {
      const success = await deleteEventAPI(eventId);
      if (success) {
        toast({
          title: "Uspjeh",
          description: "Događaj je uspješno obrisan.",
        });
        navigate("/admin/events");
      } else {
        throw new Error("Failed to delete event");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom brisanja događaja.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGenerateRandomization = async (productTypeId: string) => {
    try {
      setGeneratingRandomization(prev => ({ ...prev, [productTypeId]: true }));
      
      console.log('Generating randomization for product type:', productTypeId);
      const result = await createRandomization(productTypeId);
      
      if (result) {
        console.log('Randomization generated successfully');
        toast({
          title: "Uspjeh",
          description: "Randomizacija je uspješno generirana.",
        });
        
        // Refresh data to update hasRandomization flags
        await refreshEventData();
      } else {
        throw new Error('Failed to generate randomization');
      }
    } catch (error) {
      console.error('Error generating randomization:', error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom generiranja randomizacije.",
        variant: "destructive",
      });
    } finally {
      setGeneratingRandomization(prev => ({ ...prev, [productTypeId]: false }));
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

  if (!event) {
    return <div>Učitavanje...</div>;
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate("/admin/events")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Povratak na listu događaja
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <EventInfoCard
          event={event}
          isUpdating={isUpdating}
          onUpdateStatus={handleUpdateStatus}
          onDeleteEvent={handleDeleteEvent}
          formatDate={formatDate}
          getStatusLabel={getStatusLabel}
        />

        {/* Action card or additional info can go here */}
      </div>

      <div className="mt-12">
        <Tabs defaultValue="productTypes" className="w-full">
          <TabsList>
            <TabsTrigger value="productTypes">Tipovi proizvoda</TabsTrigger>
            <TabsTrigger value="randomization">Randomizacija</TabsTrigger>
            <TabsTrigger value="reports">Izvještaji</TabsTrigger>
          </TabsList>
          <TabsContent value="productTypes">
            <ProductTypesTab
              eventId={eventId}
              productTypes={productTypes}
              refreshEventData={refreshEventData}
            />
          </TabsContent>
          <TabsContent value="randomization">
            <RandomizationTab
              eventId={eventId}
              productTypes={productTypes}
              generatingRandomization={generatingRandomization}
              onGenerateRandomization={handleGenerateRandomization}
            />
          </TabsContent>
          <TabsContent value="reports">
            <ReportsTab eventId={eventId} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
