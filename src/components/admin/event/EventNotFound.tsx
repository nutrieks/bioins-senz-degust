
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { AdminLayout } from "@/components/layout/AdminLayout";

export function EventNotFound() {
  const navigate = useNavigate();

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
