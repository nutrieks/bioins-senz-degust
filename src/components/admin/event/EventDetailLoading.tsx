
import React from "react";
import { AdminLayout } from "@/components/layout/AdminLayout";

export function EventDetailLoading() {
  return (
    <AdminLayout>
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-4 text-lg">Učitavanje podataka o događaju...</span>
      </div>
    </AdminLayout>
  );
}
