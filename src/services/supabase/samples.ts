import { supabase } from "@/integrations/supabase/client";
import { Sample, RetailerCode } from "@/types";

// Generate blind code for a sample (e.g., A1, A2, B1, B2...)
function generateBlindCode(baseCode: string, sampleIndex: number): string {
  return `${baseCode}${sampleIndex + 1}`;
}

export async function getSamples(productTypeId: string): Promise<Sample[]> {
  const { data, error } = await supabase
    .from('samples')
    .select('*')
    .eq('product_type_id', productTypeId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching samples:', error);
    throw error;
  }

  return (data || []).map(sample => ({
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
  console.log('Creating sample for product type:', productTypeId, 'brand:', brand);
  
  // Get existing samples for this product type to determine the blind code
  const existingSamples = await getSamples(productTypeId);
  console.log('Existing samples count:', existingSamples.length);
  
  // Get the product type to get the base code
  const { data: productType, error: productTypeError } = await supabase
    .from('product_types')
    .select('base_code')
    .eq('id', productTypeId)
    .single();

  if (productTypeError) {
    console.error('Error fetching product type:', productTypeError);
    console.error('Product type ID:', productTypeId);
    throw new Error(`Ne mogu pronaći tip proizvoda s ID: ${productTypeId}`);
  }

  if (!productType || !productType.base_code) {
    console.error('Product type not found or missing base_code:', productType);
    throw new Error('Tip proizvoda nema definiran base_code');
  }

  const blindCode = generateBlindCode(productType.base_code, existingSamples.length);
  console.log('Generated blind code:', blindCode);

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
    throw new Error(`Greška prilikom kreiranja uzorka: ${error.message}`);
  }

  console.log('Sample created successfully:', data);

  // After creating a sample, mark product type as needing new randomization
  const { error: updateError } = await supabase
    .from('product_types')
    .update({ has_randomization: false })
    .eq('id', productTypeId);

  if (updateError) {
    console.warn('Could not update product type randomization flag:', updateError);
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
