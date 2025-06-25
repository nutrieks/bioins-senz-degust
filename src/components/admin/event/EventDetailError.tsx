
import React from "react";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/layout/AdminLayout";

interface EventDetailErrorProps {
  eventId: string | undefined;
  eventError: boolean;
  productTypesError: boolean;
  eventErrorMessage: any;
  productTypesErrorMessage: any;
}

export function EventDetailError({
  eventId,
  eventError,
  productTypesError,
  eventErrorMessage,
  productTypesErrorMessage,
}: EventDetailErrorProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return (
    <AdminLayout>
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-4">
            Greška pri dohvaćanju podataka
          </h2>
          <p className="text-muted-foreground mb-4">
            {eventError ? `Događaj: ${eventErrorMessage?.message || 'Nepoznata greška'}` : ''}
            {productTypesError ? `Tipovi proizvoda: ${productTypesErrorMessage?.message || 'Nepoznata greška'}` : ''}
          </p>
          <div className="space-x-2">
            <Button 
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['event', eventId] });
                queryClient.invalidateQueries({ queryKey: ['productTypes', eventId] });
              }}
              variant="outline"
            >
              Pokušaj ponovno
            </Button>
            <Button onClick={() => navigate("/admin/events")}>
              Povratak na listu događaja
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
