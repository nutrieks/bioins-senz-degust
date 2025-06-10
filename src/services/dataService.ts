import { 
  BaseProductType, 
  ProductType, 
  JARAttribute 
} from "@/types";
import { createBaseJARAttribute, getJARAttributes as getJARAttributesSupabase } from './supabase/jarAttributes';
import { supabase } from '@/integrations/supabase/client';
import { 
  createEvent as createEventSupabase, 
  getEvents as getEventsSupabase, 
  getEvent as getEventSupabase,
  updateEventStatus as updateEventStatusSupabase 
} from './supabase/events';
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
  getSamples as getSamplesSupabase, 
  createSample as createSampleSupabase, 
  updateSampleImages as updateSampleImagesSupabase 
} from './supabase/samples';
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
  return await createBaseJARAttribute(baseProductTypeId, nameHR, nameEN, scaleHR, scaleEN);
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

// Event Management
export async function createEvent(date: string) {
  return await createEventSupabase(date);
}

export async function getEvent(eventId: string): Promise<any> {
  return await getEventSupabase(eventId);
}

export async function getEvents(): Promise<any[]> {
  return await getEventsSupabase();
}

export async function updateEventStatus(eventId: string, status: string): Promise<boolean> {
  return await updateEventStatusSupabase(eventId, status as any);
}

// Sample Management
export async function getSamples(productTypeId: string): Promise<any[]> {
  return await getSamplesSupabase(productTypeId);
}

export async function createSample(productTypeId: string, brand: string, retailerCode: string): Promise<any> {
  return await createSampleSupabase(productTypeId, brand, retailerCode as any);
}

export async function updateSampleImages(sampleId: string, images: any): Promise<boolean> {
  const { preparedImage, packagingImage, detailImages } = images;
  return await updateSampleImagesSupabase(sampleId, preparedImage, packagingImage, detailImages);
}

// Evaluation Management
export async function submitEvaluation(evaluationData: any): Promise<any> {
  const { userId, sampleId, productTypeId, eventId, hedonic, jar } = evaluationData;
  return await submitEvaluationSupabase(userId, sampleId, productTypeId, eventId, hedonic, jar);
}

export async function getCompletedEvaluations(eventId: string, userId: string): Promise<any[]> {
  return await getCompletedEvaluationsSupabase(userId, eventId);
}

export async function getEvaluationsStatus(eventId: string): Promise<any> {
  return await getEvaluationsStatusSupabase(eventId);
}

export async function getNextSample(userId: string, eventId: string, productTypeId?: string, completedSampleIds?: string[]): Promise<any> {
  return await getNextSampleSupabase(userId, eventId, productTypeId, completedSampleIds);
}

// Randomization Management
export async function createRandomization(eventId: string): Promise<any> {
  return await createRandomizationSupabase(eventId);
}

export async function getRandomization(eventId: string): Promise<any> {
  return await getRandomizationSupabase(eventId);
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

// User Management - Using Supabase
export async function getUsers(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('username');
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching users:', error);
    return [];
  }
}

export async function updateUserPassword(userId: string, password: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ password })
      .eq('id', userId);
    
    return !error;
  } catch (error) {
    console.error('Error updating user password:', error);
    return false;
  }
}

export async function updateUserStatus(userId: string, isActive: boolean): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ is_active: isActive })
      .eq('id', userId);
    
    return !error;
  } catch (error) {
    console.error('Error updating user status:', error);
    return false;
  }
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
