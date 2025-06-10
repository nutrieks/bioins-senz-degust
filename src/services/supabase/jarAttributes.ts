
import { supabase } from '@/integrations/supabase/client'
import { JARAttribute } from '@/types'

export async function getJARAttributes(productTypeId: string): Promise<JARAttribute[]> {
  try {
    console.log('=== SUPABASE getJARAttributes ===');
    console.log('Product Type ID:', productTypeId);
    
    // First try to get JAR attributes directly linked to this product type
    const { data: directAttributes, error: directError } = await supabase
      .from('jar_attributes')
      .select('*')
      .eq('product_type_id', productTypeId)
      .order('name_en');

    if (directError) {
      console.error('Error fetching direct JAR attributes:', directError);
    }

    console.log('Direct JAR attributes found:', directAttributes?.length || 0);
    if (directAttributes && directAttributes.length > 0) {
      console.log('Direct attributes data:', directAttributes);
    }

    // If we found direct attributes, return them
    if (directAttributes && directAttributes.length > 0) {
      return directAttributes.map((item: any) => ({
        id: item.id,
        productTypeId: item.product_type_id,
        nameHR: item.name_hr,
        nameEN: item.name_en,
        scaleHR: item.scale_hr as [string, string, string, string, string],
        scaleEN: item.scale_en as [string, string, string, string, string]
      }));
    }

    // If no direct attributes, try to get them via base product type
    console.log('No direct attributes found, checking base product type...');
    
    // Get the product type to find its base_product_type_id
    const { data: productType, error: productTypeError } = await supabase
      .from('product_types')
      .select('base_product_type_id, product_name')
      .eq('id', productTypeId)
      .single();

    if (productTypeError) {
      console.error('Error fetching product type:', productTypeError);
      return [];
    }

    console.log('Product type data:', productType);

    if (!productType?.base_product_type_id) {
      console.log('No base product type found for this product type');
      return [];
    }

    console.log('Base Product Type ID:', productType.base_product_type_id);

    // Get JAR attributes from the base product type
    const { data: baseAttributes, error: baseError } = await supabase
      .from('jar_attributes')
      .select('*')
      .eq('base_product_type_id', productType.base_product_type_id)
      .order('name_en');

    if (baseError) {
      console.error('Error fetching base JAR attributes:', baseError);
      return [];
    }

    console.log('Base JAR attributes found:', baseAttributes?.length || 0);
    if (baseAttributes && baseAttributes.length > 0) {
      console.log('Base attributes data:', baseAttributes);
    }

    return (baseAttributes || []).map((item: any) => ({
      id: item.id,
      productTypeId: productTypeId, // Use the current product type ID
      nameHR: item.name_hr,
      nameEN: item.name_en,
      scaleHR: item.scale_hr as [string, string, string, string, string],
      scaleEN: item.scale_en as [string, string, string, string, string]
    }));
  } catch (error) {
    console.error('=== ERROR getJARAttributes ===');
    console.error('Error details:', error);
    return [];
  }
}

export async function createJARAttribute(
  productTypeId: string,
  nameHR: string,
  nameEN: string,
  scaleHR: [string, string, string, string, string],
  scaleEN: [string, string, string, string, string]
): Promise<JARAttribute | null> {
  try {
    console.log('=== SUPABASE createJARAttribute ===');
    console.log('Product Type ID:', productTypeId);
    console.log('Name HR:', nameHR);
    console.log('Name EN:', nameEN);
    
    const { data, error } = await supabase
      .from('jar_attributes')
      .insert({
        product_type_id: productTypeId,
        name_hr: nameHR,
        name_en: nameEN,
        scale_hr: scaleHR,
        scale_en: scaleEN
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating JAR attribute:', error);
      throw error;
    }

    console.log('JAR attribute created:', data);

    return {
      id: data.id,
      productTypeId: data.product_type_id,
      nameHR: data.name_hr,
      nameEN: data.name_en,
      scaleHR: data.scale_hr as [string, string, string, string, string],
      scaleEN: data.scale_en as [string, string, string, string, string]
    };
  } catch (error) {
    console.error('=== ERROR createJARAttribute ===');
    console.error('Error details:', error);
    return null;
  }
}

// Nova funkcija za dohvaćanje JAR atributa za base product type
export async function getBaseJARAttributes(baseProductTypeId: string): Promise<JARAttribute[]> {
  try {
    console.log('=== SUPABASE getBaseJARAttributes ===');
    console.log('Base Product Type ID:', baseProductTypeId);
    
    const { data, error } = await supabase
      .from('jar_attributes')
      .select('*')
      .eq('base_product_type_id', baseProductTypeId)
      .order('name_en');

    if (error) {
      console.error('Error fetching base JAR attributes:', error);
      throw error;
    }

    console.log('Base JAR attributes fetched:', data?.length || 0);

    return (data || []).map((item: any) => ({
      id: item.id,
      productTypeId: item.base_product_type_id, // Koristimo base_product_type_id kao productTypeId
      nameHR: item.name_hr,
      nameEN: item.name_en,
      scaleHR: item.scale_hr as [string, string, string, string, string],
      scaleEN: item.scale_en as [string, string, string, string, string]
    }));
  } catch (error) {
    console.error('=== ERROR getBaseJARAttributes ===');
    console.error('Error details:', error);
    return [];
  }
}
