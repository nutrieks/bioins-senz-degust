
import { 
  getSamples as getSamplesSupabase, 
  createSample as createSampleSupabase, 
  updateSampleImages as updateSampleImagesSupabase 
} from './supabase/samples';

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
