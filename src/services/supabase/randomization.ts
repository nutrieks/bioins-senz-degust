
import { supabase } from '@/integrations/supabase/client'
import { Randomization } from '@/types'

// Generate randomization table logic (moved from mock utils)
function generateRandomizationTable(samples: any[]): Record<number, Record<number, string>> {
  const numSamples = samples.length;
  const numPositions = 12;
  const table: Record<number, Record<number, string>> = {};

  // Initialize table
  for (let position = 1; position <= numPositions; position++) {
    table[position] = {};
  }

  // Latin square generation for balanced design
  for (let round = 1; round <= numSamples; round++) {
    const sampleOrder = [];
    
    // Generate order for this round using Latin square principles
    for (let i = 0; i < numSamples; i++) {
      sampleOrder.push(samples[(i + round - 1) % numSamples].blindCode);
    }
    
    // Assign to positions
    for (let position = 1; position <= numPositions; position++) {
      const sampleIndex = (position - 1) % numSamples;
      table[position][round] = sampleOrder[sampleIndex];
    }
  }

  return table;
}

export async function getRandomization(productTypeId: string): Promise<Randomization | null> {
  try {
    console.log('=== SUPABASE getRandomization ===');
    console.log('Product Type ID:', productTypeId);
    
    const { data, error } = await supabase
      .from('randomizations')
      .select('*')
      .eq('product_type_id', productTypeId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching randomization:', error);
      throw error;
    }

    if (!data) {
      console.log('No randomization found for product type:', productTypeId);
      return null;
    }

    console.log('Randomization found:', data);
    
    return {
      id: data.id,
      productTypeId: data.product_type_id,
      table: data.randomization_table,
      createdAt: data.created_at
    };
  } catch (error) {
    console.error('=== ERROR getRandomization ===');
    console.error('Error details:', error);
    return null;
  }
}

export async function createRandomization(productTypeId: string): Promise<Randomization | null> {
  try {
    console.log('=== SUPABASE createRandomization ===');
    console.log('Product Type ID:', productTypeId);
    
    // First get the product type and its samples
    const { data: productType, error: productError } = await supabase
      .from('product_types')
      .select(`
        *,
        samples (*)
      `)
      .eq('id', productTypeId)
      .single();

    if (productError || !productType) {
      console.error('Error fetching product type:', productError);
      throw new Error('Product type not found');
    }

    if (!productType.samples || productType.samples.length === 0) {
      console.error('No samples found for product type');
      throw new Error('No samples found for this product type');
    }

    console.log('Product type samples:', productType.samples.length);

    // Generate randomization table
    const randomizationTable = generateRandomizationTable(productType.samples);
    console.log('Generated randomization table:', randomizationTable);

    // Save to database
    const { data: randomization, error: insertError } = await supabase
      .from('randomizations')
      .insert({
        product_type_id: productTypeId,
        randomization_table: randomizationTable
      })
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting randomization:', insertError);
      throw insertError;
    }

    // Update product type to mark it has randomization
    const { error: updateError } = await supabase
      .from('product_types')
      .update({ has_randomization: true })
      .eq('id', productTypeId);

    if (updateError) {
      console.error('Error updating product type randomization flag:', updateError);
      // Don't throw here, randomization was created successfully
    }

    console.log('Randomization created successfully:', randomization);

    return {
      id: randomization.id,
      productTypeId: randomization.product_type_id,
      table: randomization.randomization_table,
      createdAt: randomization.created_at
    };
  } catch (error) {
    console.error('=== ERROR createRandomization ===');
    console.error('Error details:', error);
    return null;
  }
}

export async function getNextSample(
  productTypeId: string,
  evaluatorPosition: number
): Promise<{ sampleId: string; blindCode: string } | null> {
  try {
    console.log('=== SUPABASE getNextSample ===');
    console.log('Product Type ID:', productTypeId);
    console.log('Evaluator Position:', evaluatorPosition);
    
    // Get randomization for this product type
    const randomization = await getRandomization(productTypeId);
    if (!randomization) {
      console.error('No randomization found');
      return null;
    }

    // Get samples for this product type
    const { data: samples, error: samplesError } = await supabase
      .from('samples')
      .select('*')
      .eq('product_type_id', productTypeId);

    if (samplesError || !samples) {
      console.error('Error fetching samples:', samplesError);
      return null;
    }

    // Get completed evaluations for this user and product type
    const { data: evaluations, error: evalError } = await supabase
      .from('evaluations')
      .select('sample_id')
      .eq('product_type_id', productTypeId)
      .eq('user_id', 'current_user_id'); // This would need actual user ID

    if (evalError) {
      console.error('Error fetching evaluations:', evalError);
      return null;
    }

    const completedSampleIds = new Set((evaluations || []).map(e => e.sample_id));

    // Find next sample from randomization table
    const positionSchedule = randomization.table[evaluatorPosition] || {};
    
    for (let round = 1; round <= samples.length; round++) {
      const blindCode = positionSchedule[round];
      if (!blindCode) continue;
      
      const sample = samples.find(s => s.blind_code === blindCode);
      if (!sample) continue;
      
      if (!completedSampleIds.has(sample.id)) {
        console.log('Next sample found:', sample.id, blindCode);
        return {
          sampleId: sample.id,
          blindCode: blindCode
        };
      }
    }

    console.log('No more samples to evaluate');
    return null;
  } catch (error) {
    console.error('=== ERROR getNextSample ===');
    console.error('Error details:', error);
    return null;
  }
}
