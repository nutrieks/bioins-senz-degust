
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { EventInfoCard } from "@/components/admin/event/EventInfoCard";
import { ProductTypesTab } from "@/components/admin/event/ProductTypesTab";
import { RandomizationTab } from "@/components/admin/event/RandomizationTab";
import { ReportsTab } from "@/components/admin/event/ReportsTab";
import { AdminLayout } from "@/components/layout/AdminLayout";
import {
  getEvent,
  updateEventStatus,
  deleteEvent as deleteEventAPI,
} from "@/services/supabase/events";
import { getProductTypes } from "@/services/supabase/productTypes";
import { createRandomization, getRandomization } from "@/services/supabase/randomization";
import { formatDate } from "@/utils/dateUtils";
import { EventStatus, Event, ProductType } from "@/types";
import { useToast } from "@/hooks/use-toast";
import { checkAllRandomizationsGenerated, formatRandomizationErrorMessage } from "@/utils/randomizationUtils";

export default function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: event, isLoading: isLoadingEvent } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => getEvent(eventId!),
    enabled: !!eventId,
  });

  const { data: productTypes = [], isLoading: isLoadingProductTypes } = useQuery({
    queryKey: ['productTypes', eventId],
    queryFn: async () => {
      const types = await getProductTypes(eventId!);
      // Update hasRandomization flag for each product type
      const updatedProductTypes = await Promise.all(
        types.map(async (pt) => {
          const randomizationData = await getRandomization(pt.id);
          return {
            ...pt,
            hasRandomization: !!randomizationData
          };
        })
      );
      return updatedProductTypes;
    },
    enabled: !!eventId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ eventId, status }: { eventId: string; status: EventStatus }) => 
      updateEventStatus(eventId, status),
    onSuccess: (success, { status }) => {
      if (success) {
        toast({
          title: "Uspjeh",
          description: `Status događaja promijenjen u ${getStatusLabel(status)}.`,
        });
        queryClient.invalidateQueries({ queryKey: ['event', eventId] });
        queryClient.invalidateQueries({ queryKey: ['events'] });
      } else {
        throw new Error("Failed to update event status");
      }
    },
    onError: (error) => {
      console.error("Error updating event status:", error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom ažuriranja statusa događaja.",
        variant: "destructive",
      });
    },
  });

  const deleteEventMutation = useMutation({
    mutationFn: deleteEventAPI,
    onSuccess: (success) => {
      if (success) {
        toast({
          title: "Uspjeh",
          description: "Događaj je uspješno obrisan.",
        });
        navigate("/admin/events");
      } else {
        throw new Error("Failed to delete event");
      }
    },
    onError: (error) => {
      console.error("Error deleting event:", error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom brisanja događaja.",
        variant: "destructive",
      });
    },
  });

  const generateRandomizationMutation = useMutation({
    mutationFn: createRandomization,
    onSuccess: () => {
      toast({
        title: "Uspjeh",
        description: "Randomizacija je uspješno generirana.",
      });
      queryClient.invalidateQueries({ queryKey: ['productTypes', eventId] });
    },
    onError: (error) => {
      console.error('Error generating randomization:', error);
      toast({
        title: "Greška",
        description: "Došlo je do pogreške prilikom generiranja randomizacije.",
        variant: "destructive",
      });
    },
  });

  const isLoading = isLoadingEvent || isLoadingProductTypes;

  const handleUpdateStatus = async (status: EventStatus) => {
    if (!eventId) return;

    // Add validation for ACTIVE status
    if (status === EventStatus.ACTIVE) {
      const { allGenerated, missingProductTypes } = checkAllRandomizationsGenerated(productTypes);
      
      if (!allGenerated) {
        const errorMessage = formatRandomizationErrorMessage(missingProductTypes);
        toast({
          title: "Nemožete aktivirati događaj",
          description: errorMessage,
          variant: "destructive",
        });
        return;
      }
    }

    updateStatusMutation.mutate({ eventId, status });
  };

  const handleDeleteEvent = async (): Promise<void> => {
    if (!eventId) return;
    deleteEventMutation.mutate(eventId);
  };

  const handleGenerateRandomization = async (productTypeId: string): Promise<void> => {
    generateRandomizationMutation.mutate(productTypeId);
  };

  const refreshEventData = async (): Promise<void> => {
    await queryClient.invalidateQueries({ queryKey: ['event', eventId] });
    await queryClient.invalidateQueries({ queryKey: ['productTypes', eventId] });
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
          <p>Događaj nije pronađen.</p>
          <Button onClick={() => navigate("/admin/events")} className="mt-4">
            Povratak na listu događaja
          </Button>
        </div>
      </AdminLayout>
    );
  }

  // Create event with productTypes for compatibility
  const eventWithProductTypes = { ...event, productTypes };

  return (
    <AdminLayout>
      <div className="container mx-auto py-10">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate("/admin/events")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Povratak na listu događaja
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EventInfoCard
            event={eventWithProductTypes}
            isUpdating={updateStatusMutation.isPending}
            onUpdateStatus={handleUpdateStatus}
            onDeleteEvent={handleDeleteEvent}
            formatDate={formatDate}
            getStatusLabel={getStatusLabel}
          />
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
                productTypes={productTypes} 
                refreshEventData={refreshEventData}
                eventId={eventId}
              />
            </TabsContent>
            <TabsContent value="randomization">
              <RandomizationTab
                productTypes={productTypes}
                generatingRandomization={generateRandomizationMutation.isPending ? 
                  { [generateRandomizationMutation.variables || '']: true } : {}
                }
                onGenerateRandomization={handleGenerateRandomization}
              />
            </TabsContent>
            <TabsContent value="reports">
              <ReportsTab eventId={eventId} />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AdminLayout>
  );
}
