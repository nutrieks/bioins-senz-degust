
import { supabase } from '@/integrations/supabase/client';
import { getRandomization, createRandomizationRecord } from './randomization/core';
import { generateLatinSquare, shuffleArray } from './randomization/generator';

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

    // Get samples for this product type s retry logikom
    let samples = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`Fetching samples attempt ${attempt}/3`);
      const { data, error } = await supabase
        .from('samples')
        .select('*')
        .eq('product_type_id', productTypeId);

      if (!error && data) {
        samples = data;
        break;
      }
      
      if (attempt === 3) {
        throw error || new Error('Failed to fetch samples after 3 attempts');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    if (!samples || samples.length === 0) {
      console.log('No samples found for product type:', productTypeId);
      throw new Error('No samples found for this product type');
    }

    console.log('Found samples:', samples.length);
    console.log('Sample blind codes:', samples.map(s => s.blind_code));

    // Create randomization table using existing blind codes
    const randomizationTable = await createRandomizationTable(samples);
    
    // Save randomization to database s retry logikom
    let randomizationRecord = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`Creating randomization record attempt ${attempt}/3`);
      try {
        randomizationRecord = await createRandomizationRecord(
          productTypeId, 
          randomizationTable
        );
        break;
      } catch (error) {
        console.error(`Randomization creation attempt ${attempt} failed:`, error);
        if (attempt === 3) throw error;
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Update product type to mark it has randomization s retry logikom
    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`Updating product type attempt ${attempt}/3`);
      const { error } = await supabase
        .from('product_types')
        .update({ has_randomization: true })
        .eq('id', productTypeId);

      if (!error) break;
      
      if (attempt === 3) {
        console.error('Failed to update product type after 3 attempts:', error);
        // Ne blokiraj cijeli proces zbog ovoga
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

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
  
  // Create randomization table in DUAL format - both for evaluators AND table display
  const randomizationTable: any = {
    samples: samples.map((sample, index) => ({
      id: sample.id,
      brand: sample.brand,
      retailerCode: sample.retailer_code,
      blindCode: sample.blind_code,
      position: index + 1
    })),
    evaluators: [],
    // Add table format that frontend components expect (position -> round -> blindCode)
    table: {}
  };

  console.log('Using existing blind codes from samples:', randomizationTable.samples.map(s => s.blindCode));

  // Initialize table structure for frontend display
  for (let position = 1; position <= numEvaluators; position++) {
    randomizationTable.table[position] = {};
  }

  // Create evaluator assignments AND fill table structure
  for (let evaluatorPos = 1; evaluatorPos <= numEvaluators; evaluatorPos++) {
    const evaluatorAssignment: any = {
      evaluatorPosition: evaluatorPos,
      sampleOrder: []
    };

    // Use Latin Square to determine sample order for this evaluator
    const baseRow = latinSquare[evaluatorPos - 1];
    
    // Create sample order for this evaluator AND fill table
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

      // Fill table format for frontend (position -> round -> blindCode)
      const round = sampleIndex + 1;
      randomizationTable.table[evaluatorPos][round] = sample.blindCode;
    }

    randomizationTable.evaluators.push(evaluatorAssignment);
  }

  console.log('Randomization table created successfully with dual format');
  console.log('Table format sample:', randomizationTable.table[1]);
  console.log('First evaluator sample order:', randomizationTable.evaluators[0]?.sampleOrder);
  
  // Validate the structure before returning
  if (!randomizationTable.table || !randomizationTable.evaluators || randomizationTable.evaluators.length === 0) {
    throw new Error('Invalid randomization table structure created');
  }
  
  return randomizationTable;
}

export async function getNextSample(
  userId: string, 
  eventId: string, 
  productTypeId?: string, 
  completedSampleIds?: string[]
): Promise<any> {
  try {
    console.log('=== GETTING NEXT SAMPLE ===');
    console.log('Parameters:', { userId, eventId, productTypeId, completedSampleIdsCount: completedSampleIds?.length });

    // Get user's evaluator position s dodatnim debug info i retry logikom
    let user = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      console.log(`User lookup attempt ${attempt}/3`);
      const { data, error } = await supabase
        .from('users')
        .select('evaluator_position, username, role')
        .eq('id', userId)
        .single();

      if (!error && data) {
        user = data;
        console.log('User found:', {
          username: user.username,
          role: user.role,
          evaluatorPosition: user.evaluator_position
        });
        break;
      }
      
      if (attempt === 3) {
        console.error('User lookup error after 3 attempts:', error);
        throw new Error('User not found or not an evaluator');
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    const evaluatorPosition = user.evaluator_position;

    if (!evaluatorPosition) {
      console.error('User has no evaluator position assigned');
      throw new Error('User is not assigned an evaluator position');
    }

    // Get product types for this event
    let productTypesToCheck = [];
    
    if (productTypeId) {
      console.log('Fetching specific product type:', productTypeId);
      for (let attempt = 1; attempt <= 3; attempt++) {
        const { data: specificProductType, error } = await supabase
          .from('product_types')
          .select('*')
          .eq('id', productTypeId)
          .eq('event_id', eventId)
          .single();
          
        if (!error && specificProductType) {
          productTypesToCheck = [specificProductType];
          console.log('Specific product type found:', specificProductType);
          break;
        }
        
        if (attempt === 3) {
          console.error('Product type lookup error after 3 attempts:', error);
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } else {
      console.log('Fetching all product types for event:', eventId);
      for (let attempt = 1; attempt <= 3; attempt++) {
        const { data: allProductTypes, error } = await supabase
          .from('product_types')
          .select('*')
          .eq('event_id', eventId)
          .order('display_order');
          
        if (!error && allProductTypes) {
          productTypesToCheck = allProductTypes;
          console.log('All product types found:', allProductTypes.length);
          break;
        }
        
        if (attempt === 3) {
          console.error('Product types lookup error after 3 attempts:', error);
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('Product types to check:', productTypesToCheck.length);

    // Get completed evaluations if not provided
    if (!completedSampleIds) {
      console.log('Fetching completed evaluations for user');
      for (let attempt = 1; attempt <= 3; attempt++) {
        const { data: evaluations, error } = await supabase
          .from('evaluations')
          .select('sample_id')
          .eq('user_id', userId)
          .eq('event_id', eventId);

        if (!error) {
          completedSampleIds = evaluations?.map(e => e.sample_id) || [];
          console.log('Completed evaluations found:', completedSampleIds.length);
          break;
        }
        
        if (attempt === 3) {
          console.error('Evaluations lookup error after 3 attempts:', error);
          throw error;
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Check each product type for the next sample
    for (const [index, productType] of productTypesToCheck.entries()) {
      console.log(`\n--- Checking product type ${index + 1}/${productTypesToCheck.length} ---`);
      console.log(`Product type: ${productType.product_name} (ID: ${productType.id})`);
      
      // Get randomization for this product type
      let randomization = null;
      for (let attempt = 1; attempt <= 3; attempt++) {
        console.log(`Randomization lookup attempt ${attempt}/3 for product type ${productType.id}`);
        randomization = await getRandomization(productType.id);
        
        if (randomization) {
          console.log('Randomization found');
          break;
        }
        
        if (attempt === 3) {
          console.log('No randomization found after 3 attempts for product type:', productType.id);
        } else {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
      
      if (!randomization) {
        console.log('Skipping product type - no randomization');
        continue;
      }

      // Validate randomization structure
      if (!randomization.randomization_table) {
        console.error('Invalid randomization - missing randomization_table');
        continue;
      }

      if (!randomization.randomization_table.evaluators) {
        console.error('Invalid randomization - missing evaluators array');
        continue;
      }

      console.log('Randomization structure:', {
        hasTable: !!randomization.randomization_table.table,
        hasEvaluators: !!randomization.randomization_table.evaluators,
        evaluatorsCount: randomization.randomization_table.evaluators?.length || 0
      });

      // Find evaluator's assignment
      const evaluatorAssignment = randomization.randomization_table.evaluators.find(
        (e: any) => e.evaluatorPosition === evaluatorPosition
      );

      if (!evaluatorAssignment) {
        console.log('No assignment found for evaluator position:', evaluatorPosition);
        console.log('Available evaluator positions:', 
          randomization.randomization_table.evaluators.map((e: any) => e.evaluatorPosition)
        );
        continue;
      }

      console.log('Evaluator assignment found:', {
        position: evaluatorAssignment.evaluatorPosition,
        samplesCount: evaluatorAssignment.sampleOrder?.length || 0
      });

      if (!evaluatorAssignment.sampleOrder || evaluatorAssignment.sampleOrder.length === 0) {
        console.error('No sample order found for evaluator');
        continue;
      }

      // Find next uncompleted sample
      for (const [sampleIndex, sampleAssignment] of evaluatorAssignment.sampleOrder.entries()) {
        console.log(`Checking sample ${sampleIndex + 1}/${evaluatorAssignment.sampleOrder.length}:`, {
          sampleId: sampleAssignment.sampleId,
          blindCode: sampleAssignment.blindCode,
          isCompleted: completedSampleIds?.includes(sampleAssignment.sampleId)
        });
        
        if (!completedSampleIds?.includes(sampleAssignment.sampleId)) {
          console.log('Found uncompleted sample:', sampleAssignment.sampleId);
          
          // Get full sample data
          let sample = null;
          for (let attempt = 1; attempt <= 3; attempt++) {
            const { data, error } = await supabase
              .from('samples')
              .select('*')
              .eq('id', sampleAssignment.sampleId)
              .single();

            if (!error && data) {
              sample = data;
              break;
            }
            
            if (attempt === 3) {
              console.error('Error fetching sample after 3 attempts:', error);
              break;
            }
            
            await new Promise(resolve => setTimeout(resolve, 1000));
          }

          if (!sample) {
            console.error('Could not fetch sample data for:', sampleAssignment.sampleId);
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
          console.log('Sample details:', {
            id: nextSample.id,
            brand: nextSample.brand,
            blindCode: nextSample.blindCode,
            presentationOrder: nextSample.presentationOrder,
            productType: nextSample.productTypeName
          });
          
          return { sample: nextSample, isComplete: false };
        }
      }

      console.log('All samples completed for this product type');
    }

    console.log('=== NO MORE SAMPLES AVAILABLE ===');
    console.log('All product types checked, no uncompleted samples found');
    return { sample: null, isComplete: true };
  } catch (error) {
    console.error('=== ERROR GETTING NEXT SAMPLE ===');
    console.error('Error details:', error);
    console.error('Stack trace:', error.stack);
    throw error;
  }
}
