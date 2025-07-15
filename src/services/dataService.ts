
import { 
  BaseProductType, 
  ProductType, 
  JARAttribute 
} from "@/types";
import { supabase } from '@/integrations/supabase/client';
import { createBaseJARAttribute, getJARAttributes as getJARAttributesSupabase } from './supabase/jarAttributes';
import { 
  getAllProductTypes as getAllProductTypesSupabase,
  getProductTypes as getProductTypesSupabase,
  createProductType as createProductTypeSupabase,
  getBaseProductType as getBaseProductTypeSupabase,
  updateBaseProductType as updateBaseProductTypeSupabase,
  deleteProductType as deleteProductTypeSupabase,
  createBaseProductType as createBaseProductTypeSupabase
} from './supabase/productTypes';
import { 
  submitEvaluation as submitEvaluationSupabase,
  getCompletedEvaluations as getCompletedEvaluationsSupabase,
  getEvaluationsStatus as getEvaluationsStatusSupabase
} from './supabase/evaluations';
import { 
  createRandomization as createRandomizationSupabase,
  getRandomization as getRandomizationSupabase,
  getNextSample as getNextSampleSupabase
} from './supabase/randomization';
import { 
  generateHedonicReport as generateHedonicReportSupabase,
  generateJARReport as generateJARReportSupabase,
  getRawData as getRawDataSupabase
} from './supabase/reports';

// Re-export from new service modules
export { 
  createEvent, 
  getEvent, 
  getEvents, 
  updateEventStatus, 
  deleteEvent 
} from './events';

export { 
  getUsers, 
  updateUserPassword as updateUserPassword, 
  updateUserStatus as updateUserStatus 
} from './users';

export { 
  getSamples, 
  createSample, 
  updateSampleImages 
} from './samples';

// JAR Attribute Management
export async function getJARAttributes(productTypeId: string): Promise<JARAttribute[]> {
  return await getJARAttributesSupabase(productTypeId);
}

export async function createJARAttribute(
  baseProductTypeId: string,
  nameHR: string,
  nameEN: string,
  scaleHR: [string, string, string, string, string],
  scaleEN: [string, string, string, string, string]
): Promise<JARAttribute> {
  const result = await createBaseJARAttribute(baseProductTypeId, nameHR, nameEN, scaleHR, scaleEN);
  if (!result) {
    throw new Error('Failed to create JAR attribute');
  }
  return result;
}

// Base Product Type Management
export async function getAllProductTypes(): Promise<BaseProductType[]> {
  return await getAllProductTypesSupabase();
}

export async function getBaseProductType(productTypeId: string): Promise<BaseProductType | null> {
  return await getBaseProductTypeSupabase(productTypeId);
}

export async function createBaseProductType(
  productName: string,
  jarAttributes: JARAttribute[]
): Promise<BaseProductType> {
  return await createBaseProductTypeSupabase(productName, jarAttributes);
}

export async function updateBaseProductType(
  productTypeId: string,
  productName: string,
  jarAttributes: JARAttribute[]
): Promise<boolean> {
  return await updateBaseProductTypeSupabase(productTypeId, productName, jarAttributes);
}

export async function deleteProductType(productTypeId: string): Promise<boolean> {
  return await deleteProductTypeSupabase(productTypeId);
}

// Product Type Management (within events)
export async function getProductTypes(eventId: string): Promise<ProductType[]> {
  return await getProductTypesSupabase(eventId);
}

export async function createProductType(
  eventId: string, 
  customerCode: string, 
  baseProductTypeId: string, 
  baseCode: string,
  displayOrder: number
): Promise<ProductType> {
  return await createProductTypeSupabase(eventId, customerCode, baseProductTypeId, baseCode, displayOrder);
}

// Evaluation Management
export async function submitEvaluation(evaluationData: any): Promise<any> {
  console.log("=== DATA SERVICE submitEvaluation ===");
  console.log("Received evaluation data:", evaluationData);
  
  // Validate required fields
  if (!evaluationData) {
    throw new Error("Evaluation data is missing");
  }
  
  const { userId, sampleId, productTypeId, eventId, hedonicRatings, jarRatings } = evaluationData;
  
  // Validate all required fields
  if (!userId) {
    throw new Error("User ID is required");
  }
  
  if (!sampleId) {
    throw new Error("Sample ID is required");
  }
  
  if (!productTypeId) {
    throw new Error("Product Type ID is required");
  }
  
  if (!eventId) {
    throw new Error("Event ID is required");
  }
  
  if (!hedonicRatings || typeof hedonicRatings !== 'object') {
    throw new Error("Hedonic ratings are required and must be an object");
  }
  
  // Validate hedonic ratings structure
  const requiredHedonicFields = ['appearance', 'odor', 'texture', 'flavor', 'overallLiking'];
  for (const field of requiredHedonicFields) {
    if (!(field in hedonicRatings) || typeof hedonicRatings[field] !== 'number') {
      throw new Error(`Hedonic rating for ${field} is missing or invalid`);
    }
  }
  
  console.log("Data validation passed, calling Supabase service");
  
  // Call Supabase service with properly structured data
  return await submitEvaluationSupabase({
    userId,
    sampleId,
    productTypeId,
    eventId,
    hedonicRatings,
    jarRatings: jarRatings || {}
  });
}

export async function getCompletedEvaluations(eventId: string, userId: string): Promise<any[]> {
  return await getCompletedEvaluationsSupabase(userId, eventId);
}

export async function getEvaluationsStatus(eventId: string): Promise<any> {
  return await getEvaluationsStatusSupabase(eventId);
}

// Legacy wrapper - REMOVED to prevent double wrapping
// useEvaluationFlow now calls getNextSampleSupabase directly

// Randomization Management - Updated to work with productTypeId
export async function createRandomization(productTypeId: string): Promise<any> {
  return await createRandomizationSupabase(productTypeId);
}

export async function getRandomization(productTypeId: string): Promise<any> {
  return await getRandomizationSupabase(productTypeId);
}

// Check if all product types have randomizations
export async function checkRandomizationsComplete(eventId: string): Promise<boolean> {
  try {
    console.log('Checking if all product types have randomizations for event:', eventId);
    
    const productTypes = await getProductTypesSupabase(eventId);
    
    if (productTypes.length === 0) {
      console.log('No product types found for event');
      return false;
    }
    
    for (const productType of productTypes) {
      const randomization = await getRandomizationSupabase(productType.id);
      if (!randomization) {
        console.log(`No randomization found for product type: ${productType.id}`);
        return false;
      }
    }
    
    console.log('All product types have randomizations');
    return true;
  } catch (error) {
    console.error('Error checking randomizations:', error);
    return false;
  }
}

// Reports Management
export async function generateHedonicReport(eventId: string): Promise<any> {
  return await generateHedonicReportSupabase(eventId);
}

export async function generateJARReport(eventId: string): Promise<any> {
  return await generateJARReportSupabase(eventId);
}

export async function getRawData(eventId: string): Promise<any> {
  return await getRawDataSupabase(eventId);
}

// Legacy aliases for backwards compatibility
export const deleteEventProductType = deleteProductType;
export const updateEventProductType = async (
  productTypeId: string,
  customerCode: string,
  baseCode: string
): Promise<boolean> => {
  try {
    console.log("updateEventProductType - updating product type in Supabase");
    
    const { error } = await supabase
      .from('product_types')
      .update({ 
        customer_code: customerCode,
        base_code: baseCode
      })
      .eq('id', productTypeId);
    
    return !error;
  } catch (error) {
    console.error('Error updating product type:', error);
    return false;
  }
};
