
import { supabase } from '@/integrations/supabase/client'
import { JARAttribute } from '@/types'

export async function getJARAttributes(productTypeId: string): Promise<JARAttribute[]> {
  try {
    console.log('=== SUPABASE getJARAttributes ===');
    console.log('Product Type ID:', productTypeId);
    
    const { data, error } = await supabase
      .from('jar_attributes')
      .select('*')
      .eq('product_type_id', productTypeId)
      .order('name_en');

    if (error) {
      console.error('Error fetching JAR attributes:', error);
      throw error;
    }

    console.log('JAR attributes fetched:', data?.length || 0);

    return (data || []).map((item: any) => ({
      id: item.id,
      productTypeId: item.product_type_id,
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
