
import { supabase } from '@/integrations/supabase/client';

export async function getRandomization(productTypeId: string): Promise<any> {
  try {
    console.log('Getting randomization for product type:', productTypeId);
    
    const { data, error } = await supabase
      .from('randomizations')
      .select('*')
      .eq('product_type_id', productTypeId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('No randomization found for product type:', productTypeId);
        return null;
      }
      throw error;
    }

    console.log('Found randomization:', data);
    return data;
  } catch (error) {
    console.error('Error getting randomization:', error);
    return null;
  }
}

export async function createRandomizationRecord(productTypeId: string, randomizationTable: any): Promise<any> {
  try {
    console.log('Creating randomization record for product type:', productTypeId);
    
    const { data, error } = await supabase
      .from('randomizations')
      .insert({
        product_type_id: productTypeId,
        randomization_table: randomizationTable
      })
      .select()
      .single();

    if (error) throw error;

    console.log('Randomization record created:', data);
    return data;
  } catch (error) {
    console.error('Error creating randomization record:', error);
    throw error;
  }
}
