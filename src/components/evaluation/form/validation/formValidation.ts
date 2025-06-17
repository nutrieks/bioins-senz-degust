
import { FormData } from "../types";
import { JARAttribute } from "@/types";
import { UseFormReturn } from "react-hook-form";

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
  console.log("=== FORM VALIDATION ===");
  console.log("Form data:", data);
  console.log("JAR attributes:", currentJARAttributes);

  // Validate data structure first
  if (!data) {
    console.error("Form data is missing");
    return { isValid: false, errorFields: "Podaci obrasca nedostaju" };
  }

  if (!data.hedonic) {
    console.error("Hedonic data is missing");
    return { isValid: false, errorFields: "Hedonistički podaci nedostaju" };
  }

  // Validate all hedonic fields are filled
  const hedonicFields = ["appearance", "odor", "texture", "flavor", "overallLiking"];
  const emptyHedonicFields = hedonicFields.filter(field => {
    const value = data.hedonic[field as keyof typeof data.hedonic];
    return !value || value === '' || value === undefined;
  });
  
  console.log("Empty hedonic fields:", emptyHedonicFields);

  // Validate all JAR fields are filled (if there are any)
  const emptyJarFields: string[] = [];
  
  if (currentJARAttributes && currentJARAttributes.length > 0) {
    currentJARAttributes.forEach(attr => {
      if (!attr || !attr.id) {
        console.warn("Invalid JAR attribute:", attr);
        return;
      }

      // Check if the attribute has a value (including zero)
      // Note: We need to check for undefined, empty string, and also
      // make sure that zero (0) is considered a valid value
      const jarValue = data.jar ? data.jar[attr.id] : undefined;
      if (jarValue === undefined || jarValue === '' || jarValue === null) {
        emptyJarFields.push(attr.nameHR || attr.nameEN || attr.id);
      }
    });
    
    console.log("JAR validation check:", {
      attributes: currentJARAttributes.map(a => ({ id: a.id, nameHR: a.nameHR })),
      jarData: data.jar,
      emptyFields: emptyJarFields
    });
  }
  
  // If any fields are empty, show error and highlight them
  if (emptyHedonicFields.length > 0 || emptyJarFields.length > 0) {
    const emptyHedonicNames = emptyHedonicFields.map(
      field => HEDONIC_FIELD_NAMES[field as keyof typeof HEDONIC_FIELD_NAMES]
    ).filter(Boolean);
    
    const errorFields = [...emptyHedonicNames, ...emptyJarFields].join(", ");
    
    console.log("Validation failed, empty fields:", errorFields);
    
    // Manually trigger errors for empty hedonic fields
    emptyHedonicFields.forEach(field => {
      form.setError(`hedonic.${field}` as any, {
        type: "required",
        message: "Obavezno polje"
      });
    });
    
    // Manually trigger errors for empty JAR fields
    if (currentJARAttributes) {
      currentJARAttributes.forEach(attr => {
        if (!attr || !attr.id) return;
        
        const jarValue = data.jar ? data.jar[attr.id] : undefined;
        if (jarValue === undefined || jarValue === '' || jarValue === null) {
          form.setError(`jar.${attr.id}` as any, {
            type: "required",
            message: "Obavezno polje"
          });
        }
      });
    }
    
    return { isValid: false, errorFields };
  }
  
  console.log("Validation passed");
  return { isValid: true };
}
