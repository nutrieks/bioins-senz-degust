
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, Clock } from "lucide-react";

interface RandomizationStatusIndicatorProps {
  hasRandomization: boolean;
  isGenerating?: boolean;
  productTypeName: string;
}

export function RandomizationStatusIndicator({ 
  hasRandomization, 
  isGenerating = false,
  productTypeName 
}: RandomizationStatusIndicatorProps) {
  if (isGenerating) {
    return (
      <Badge variant="secondary" className="flex items-center space-x-1">
        <Clock className="h-3 w-3" />
        <span>Generiranje...</span>
      </Badge>
    );
  }

  if (hasRandomization) {
    return (
      <Badge variant="default" className="flex items-center space-x-1 bg-green-100 text-green-800 hover:bg-green-100">
        <CheckCircle className="h-3 w-3" />
        <span>Generirano</span>
      </Badge>
    );
  }

  return (
    <Badge variant="destructive" className="flex items-center space-x-1">
      <AlertCircle className="h-3 w-3" />
      <span>Potrebno generirati</span>
    </Badge>
  );
}
