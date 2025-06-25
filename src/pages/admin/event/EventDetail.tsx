
import React from "react";
import { useParams } from "react-router-dom";
import { AdminLayout } from "@/components/layout/AdminLayout";
import { EventInfoCard } from "@/components/admin/event/EventInfoCard";
import { EventDetailHeader } from "@/components/admin/event/EventDetailHeader";
import { EventDetailTabs } from "@/components/admin/event/EventDetailTabs";
import { EventDetailError } from "@/components/admin/event/EventDetailError";
import { EventDetailLoading } from "@/components/admin/event/EventDetailLoading";
import { EventNotFound } from "@/components/admin/event/EventNotFound";
import { useEventDetailQueries } from "@/hooks/useEventDetailQueries";
import { useEventDetailHandlers } from "@/hooks/useEventDetailHandlers";
import { formatDate } from "@/utils/dateUtils";

export default function EventDetail() {
  const { eventId } = useParams<{ eventId: string }>();

  const {
    event,
    productTypes,
    isLoading,
    hasError,
    eventError,
    productTypesError,
    eventErrorMessage,
    productTypesErrorMessage,
  } = useEventDetailQueries(eventId);

  const {
    updateStatusMutation,
    generateRandomizationMutation,
    handleUpdateStatus,
    handleDeleteEvent,
    handleGenerateRandomization,
    refreshEventData,
    getStatusLabel,
  } = useEventDetailHandlers(eventId);

  // Error handling
  if (hasError) {
    return (
      <EventDetailError
        eventId={eventId}
        eventError={eventError}
        productTypesError={productTypesError}
        eventErrorMessage={eventErrorMessage}
        productTypesErrorMessage={productTypesErrorMessage}
      />
    );
  }

  // Loading state
  if (isLoading) {
    return <EventDetailLoading />;
  }

  // Event not found
  if (!event) {
    return <EventNotFound />;
  }

  const eventWithProductTypes = { ...event, productTypes };

  const generatingRandomization = generateRandomizationMutation.isPending ? 
    { [generateRandomizationMutation.variables || '']: true } : {};

  return (
    <AdminLayout>
      <div className="container mx-auto py-10">
        <EventDetailHeader />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <EventInfoCard
            event={eventWithProductTypes}
            isUpdating={updateStatusMutation.isPending}
            onUpdateStatus={(status) => handleUpdateStatus(status, productTypes)}
            onDeleteEvent={handleDeleteEvent}
            formatDate={formatDate}
            getStatusLabel={getStatusLabel}
          />
        </div>

        <EventDetailTabs
          productTypes={productTypes}
          eventId={eventId}
          refreshEventData={refreshEventData}
          generatingRandomization={generatingRandomization}
          onGenerateRandomization={handleGenerateRandomization}
        />
      </div>
    </AdminLayout>
  );
}
