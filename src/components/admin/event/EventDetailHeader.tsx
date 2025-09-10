import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
export function EventDetailHeader() {
  const navigate = useNavigate();
  return <div className="mb-6">
      <Button variant="ghost" onClick={() => navigate("/admin/events")} className="text-slate-50">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Povratak na listu događaja
      </Button>
    </div>;
}