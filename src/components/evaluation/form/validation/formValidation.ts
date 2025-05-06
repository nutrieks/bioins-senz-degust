
import { FormData } from "../types";
import { JARAttribute } from "@/types";
import { UseFormReturn } from "react-hook-form";
import { toast } from "@/hooks/use-toast";

// Map hedonic fields to their Croatian names for error messages
const HEDONIC_FIELD_NAMES = {
  appearance: "Izgled",
  odor: "Miris",
  texture: "Tekstura",
  flavor: "Okus",
  overallLiking: "Ukupni dojam"
};

export function validateEvaluationForm(
  data: FormData, 
  form: UseFormReturn<FormData>, 
  currentJARAttributes?: JARAttribute[]
): { isValid: boolean; errorFields?: string } {
  // Validate all hedonic fields are filled
  const hedonicFields = ["appearance", "odor", "texture", "flavor", "overallLiking"];
  const emptyHedonicFields = hedonicFields.filter(field => !data.hedonic[field as keyof typeof data.hedonic]);
  
  // Validate all JAR fields are filled (if there are any)
  const emptyJarFields: string[] = [];
  if (currentJARAttributes && currentJARAttributes.length > 0) {
    currentJARAttributes.forEach(attr => {
      if (!data.jar[attr.id]) {
        emptyJarFields.push(attr.nameHR);
      }
    });
  }
  
  // If any fields are empty, show error and highlight them
  if (emptyHedonicFields.length > 0 || emptyJarFields.length > 0) {
    const emptyHedonicNames = emptyHedonicFields.map(
      field => HEDONIC_FIELD_NAMES[field as keyof typeof HEDONIC_FIELD_NAMES]
    );
    
    const errorFields = [...emptyHedonicNames, ...emptyJarFields].join(", ");
    
    // Manually trigger errors for empty hedonic fields
    emptyHedonicFields.forEach(field => {
      form.setError(`hedonic.${field}` as any, {
        type: "required",
        message: "Obavezno polje"
      });
    });
    
    // Manually trigger errors for empty JAR fields
    emptyJarFields.forEach((_, index) => {
      if (currentJARAttributes && currentJARAttributes[index]) {
        form.setError(`jar.${currentJARAttributes[index].id}` as any, {
          type: "required",
          message: "Obavezno polje"
        });
      }
    });
    
    return { isValid: false, errorFields };
  }
  
  return { isValid: true };
}
