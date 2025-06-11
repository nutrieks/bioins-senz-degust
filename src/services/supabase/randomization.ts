import { supabase } from '@/integrations/supabase/client';
import { getRandomization, createRandomizationRecord } from './randomization/core';
import { generateLatinSquare, shuffleArray, generateRandomizedOrder } from './randomization/generator';

export { getRandomization };

export async function createRandomization(productTypeId: string): Promise<any> {
  try {
    console.log('=== CREATING RANDOMIZATION FOR PRODUCT TYPE ===');
    console.log('Product Type ID:', productTypeId);

    // Check if randomization already exists
    const existingRandomization = await getRandomization(productTypeId);
    if (existingRandomization) {
      console.log('Randomization already exists for this product type');
      return existingRandomization;
    }

    // Get samples for this product type
    const { data: samples, error: samplesError } = await supabase
      .from('samples')
      .select('*')
      .eq('product_type_id', productTypeId);

    if (samplesError) throw samplesError;

    if (!samples || samples.length === 0) {
      console.log('No samples found for product type:', productTypeId);
      throw new Error('No samples found for this product type');
    }

    console.log('Found samples:', samples.length);

    // Create randomization table
    const randomizationTable = await createRandomizationTable(samples);
    
    // Save randomization to database
    const randomizationRecord = await createRandomizationRecord(
      productTypeId, 
      randomizationTable
    );
    
    // Update samples with blind codes
    await updateSamplesWithBlindCodes(samples, randomizationTable);
    
    // Update product type to mark it has randomization
    await supabase
      .from('product_types')
      .update({ has_randomization: true })
      .eq('id', productTypeId);

    console.log('=== RANDOMIZATION CREATION COMPLETE ===');
    return randomizationRecord;
  } catch (error) {
    console.error('=== ERROR CREATING RANDOMIZATION ===');
    console.error('Error details:', error);
    throw error;
  }
}

async function createRandomizationTable(samples: any[]): Promise<any> {
  const numSamples = samples.length;
  const numEvaluators = 12;

  console.log(`Creating randomization table for ${numSamples} samples and ${numEvaluators} evaluators`);

  if (numSamples > numEvaluators) {
    throw new Error(`Cannot randomize ${numSamples} samples with only ${numEvaluators} evaluators. Maximum samples: ${numEvaluators}`);
  }

  // Generate Latin Square for randomization
  const latinSquare = generateLatinSquare(numEvaluators);
  
  // Create randomization table
  const randomizationTable: any = {
    samples: samples.map((sample, index) => ({
      id: sample.id,
      brand: sample.brand,
      retailerCode: sample.retailer_code,
      blindCode: `${101 + index}`,
      position: index + 1
    })),
    evaluators: []
  };

  // Create evaluator assignments
  for (let evaluatorPos = 1; evaluatorPos <= numEvaluators; evaluatorPos++) {
    const evaluatorAssignment: any = {
      evaluatorPosition: evaluatorPos,
      sampleOrder: []
    };

    // Use Latin Square to determine sample order for this evaluator
    const baseRow = latinSquare[evaluatorPos - 1];
    
    // Create sample order for this evaluator
    for (let sampleIndex = 0; sampleIndex < numSamples; sampleIndex++) {
      const latinSquareValue = baseRow[sampleIndex];
      const actualSampleIndex = (latinSquareValue - 1) % numSamples;
      const sample = randomizationTable.samples[actualSampleIndex];
      
      evaluatorAssignment.sampleOrder.push({
        sampleId: sample.id,
        blindCode: sample.blindCode,
        presentationOrder: sampleIndex + 1,
        brand: sample.brand
      });
    }

    randomizationTable.evaluators.push(evaluatorAssignment);
  }

  console.log('Randomization table created successfully');
  return randomizationTable;
}

async function updateSamplesWithBlindCodes(samples: any[], randomizationTable: any): Promise<void> {
  console.log('=== UPDATING SAMPLES WITH BLIND CODES ===');
  console.log('Samples to update:', samples.length);
  console.log('Randomization table samples:', randomizationTable.samples.length);
  
  for (const sampleData of randomizationTable.samples) {
    console.log(`Updating sample ${sampleData.id} with blind code ${sampleData.blindCode}`);
    
    const { error } = await supabase
      .from('samples')
      .update({ blind_code: sampleData.blindCode })
      .eq('id', sampleData.id);

    if (error) {
      console.error('Error updating sample blind code:', error);
      throw error;
    }
  }
  
  console.log('=== SAMPLES UPDATED WITH BLIND CODES ===');
}

export async function getNextSample(
  userId: string, 
  eventId: string, 
  productTypeId?: string, 
  completedSampleIds?: string[]
): Promise<any> {
  try {
    console.log('=== GETTING NEXT SAMPLE ===');
    console.log('User ID:', userId);
    console.log('Event ID:', eventId);
    console.log('Product Type ID:', productTypeId);
    console.log('Completed Sample IDs:', completedSampleIds);

    // Get user's evaluator position
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('evaluator_position')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      throw new Error('User not found or not an evaluator');
    }

    const evaluatorPosition = user.evaluator_position;
    console.log('Evaluator position:', evaluatorPosition);

    // Get product types for this event (if not specified)
    let productTypesToCheck = [];
    
    if (productTypeId) {
      const { data: specificProductType, error: ptError } = await supabase
        .from('product_types')
        .select('*')
        .eq('id', productTypeId)
        .eq('event_id', eventId)
        .single();
        
      if (ptError) throw ptError;
      productTypesToCheck = [specificProductType];
    } else {
      const { data: allProductTypes, error: ptError } = await supabase
        .from('product_types')
        .select('*')
        .eq('event_id', eventId)
        .order('display_order');
        
      if (ptError) throw ptError;
      productTypesToCheck = allProductTypes || [];
    }

    console.log('Product types to check:', productTypesToCheck.length);

    // Get completed evaluations if not provided
    if (!completedSampleIds) {
      const { data: evaluations, error: evalError } = await supabase
        .from('evaluations')
        .select('sample_id')
        .eq('user_id', userId)
        .eq('event_id', eventId);

      if (evalError) throw evalError;
      
      completedSampleIds = evaluations?.map(e => e.sample_id) || [];
    }

    console.log('Completed samples:', completedSampleIds.length);

    // Check each product type for the next sample
    for (const productType of productTypesToCheck) {
      console.log(`Checking product type: ${productType.product_name}`);
      
      // Get randomization for this product type
      const randomization = await getRandomization(productType.id);
      
      if (!randomization) {
        console.log('No randomization found for product type:', productType.id);
        continue;
      }

      // Find evaluator's assignment
      const evaluatorAssignment = randomization.randomization_table.evaluators.find(
        (e: any) => e.evaluatorPosition === evaluatorPosition
      );

      if (!evaluatorAssignment) {
        console.log('No assignment found for evaluator position:', evaluatorPosition);
        continue;
      }

      console.log('Found evaluator assignment with', evaluatorAssignment.sampleOrder.length, 'samples');

      // Find next uncompleted sample
      for (const sampleAssignment of evaluatorAssignment.sampleOrder) {
        if (!completedSampleIds.includes(sampleAssignment.sampleId)) {
          console.log('Found next sample:', sampleAssignment.sampleId);
          
          // Get full sample data
          const { data: sample, error: sampleError } = await supabase
            .from('samples')
            .select('*')
            .eq('id', sampleAssignment.sampleId)
            .single();

          if (sampleError) {
            console.error('Error fetching sample:', sampleError);
            continue;
          }

          const nextSample = {
            ...sample,
            productTypeId: productType.id,
            productTypeName: productType.product_name,
            presentationOrder: sampleAssignment.presentationOrder,
            blindCode: sampleAssignment.blindCode
          };

          console.log('=== NEXT SAMPLE FOUND ===');
          console.log('Sample:', nextSample);
          return nextSample;
        }
      }
    }

    console.log('=== NO MORE SAMPLES ===');
    return null;
  } catch (error) {
    console.error('=== ERROR GETTING NEXT SAMPLE ===');
    console.error('Error details:', error);
    throw error;
  }
}
