
import { supabase } from "@/lib/supabase";
import { Sample, RetailerCode } from "@/types";

// Generate blind code for a sample (e.g., A1, A2, B1, B2...)
function generateBlindCode(baseCode: string, sampleIndex: number): string {
  return `${baseCode}${sampleIndex + 1}`;
}

export async function getSamples(productTypeId: string): Promise<Sample[]> {
  const { data, error } = await supabase
    .from('samples')
    .select('*')
    .eq('product_type_id', productTypeId);

  if (error) {
    console.error('Error fetching samples:', error);
    throw error;
  }

  return data.map(sample => ({
    id: sample.id,
    productTypeId: sample.product_type_id,
    brand: sample.brand,
    retailerCode: sample.retailer_code as RetailerCode,
    images: {
      prepared: sample.images_prepared || undefined,
      packaging: sample.images_packaging || undefined,
      details: sample.images_details || []
    },
    blindCode: sample.blind_code || undefined
  }));
}

export async function createSample(
  productTypeId: string,
  brand: string,
  retailerCode: RetailerCode
): Promise<Sample> {
  // Get existing samples for this product type to determine the blind code
  const existingSamples = await getSamples(productTypeId);
  
  // Get the product type to get the base code
  const { data: productType, error: productTypeError } = await supabase
    .from('product_types')
    .select('base_code')
    .eq('id', productTypeId)
    .single();

  if (productTypeError) {
    console.error('Error fetching product type:', productTypeError);
    throw productTypeError;
  }

  const blindCode = generateBlindCode(productType.base_code, existingSamples.length);

  const { data, error } = await supabase
    .from('samples')
    .insert({
      product_type_id: productTypeId,
      brand,
      retailer_code: retailerCode,
      blind_code: blindCode,
      images_details: []
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating sample:', error);
    throw error;
  }

  return {
    id: data.id,
    productTypeId: data.product_type_id,
    brand: data.brand,
    retailerCode: data.retailer_code as RetailerCode,
    images: {
      prepared: data.images_prepared || undefined,
      packaging: data.images_packaging || undefined,
      details: data.images_details || []
    },
    blindCode: data.blind_code || undefined
  };
}

export async function updateSampleImages(
  sampleId: string,
  preparedImage?: string,
  packagingImage?: string,
  detailImages?: string[]
): Promise<boolean> {
  const updateData: any = {};
  
  if (preparedImage !== undefined) {
    updateData.images_prepared = preparedImage;
  }
  
  if (packagingImage !== undefined) {
    updateData.images_packaging = packagingImage;
  }
  
  if (detailImages !== undefined) {
    updateData.images_details = detailImages;
  }

  const { error } = await supabase
    .from('samples')
    .update(updateData)
    .eq('id', sampleId);

  if (error) {
    console.error('Error updating sample images:', error);
    throw error;
  }

  return true;
}
