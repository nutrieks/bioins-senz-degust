
import { supabase } from '@/integrations/supabase/client';
import { getRandomization, createRandomizationRecord } from './randomization/core';
import { generateSamplePermutations, shuffleArray } from './randomization/generator';

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

  // Generate sample permutations - svaki evaluator dobije svaki uzorak točno jednom
  console.log('🎲 Generating sample permutations for balanced randomization');
  const samplePermutations = generateSamplePermutations(numSamples, numEvaluators);
  
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

  // Create evaluator assignments AND fill table structure using balanced permutations
  for (let evaluatorPos = 1; evaluatorPos <= numEvaluators; evaluatorPos++) {
    const evaluatorAssignment: any = {
      evaluatorPosition: evaluatorPos,
      sampleOrder: []
    };

    // Get the permutation for this evaluator (array of sample numbers 1,2,3...)
    const sampleOrder = samplePermutations[evaluatorPos - 1];
    
    console.log(`📋 Evaluator ${evaluatorPos}: sample order [${sampleOrder.join(', ')}]`);
    
    // Create sample order for this evaluator - svaki uzorak točno jednom
    for (let orderIndex = 0; orderIndex < sampleOrder.length; orderIndex++) {
      const sampleNumber = sampleOrder[orderIndex]; // 1, 2, 3, etc.
      const sampleIndex = sampleNumber - 1; // Convert to 0-based index
      const sample = randomizationTable.samples[sampleIndex];
      
      if (!sample) {
        console.error(`❌ Sample not found for position ${sampleNumber}`);
        throw new Error(`Sample not found for position ${sampleNumber}`);
      }
      
      evaluatorAssignment.sampleOrder.push({
        sampleId: sample.id,
        blindCode: sample.blindCode,
        presentationOrder: orderIndex + 1,
        brand: sample.brand
      });

      // Fill table format for frontend (position -> round -> blindCode)
      const round = orderIndex + 1;
      randomizationTable.table[evaluatorPos][round] = sample.blindCode;
    }

    // Validacija - provjeri da evaluator ima točno numSamples uzoraka i nema duplikata
    const blindCodes = evaluatorAssignment.sampleOrder.map((s: any) => s.blindCode);
    const uniqueBlindCodes = new Set(blindCodes);
    
    if (uniqueBlindCodes.size !== numSamples) {
      console.error(`❌ Evaluator ${evaluatorPos} has duplicate blind codes:`, blindCodes);
      throw new Error(`Evaluator ${evaluatorPos} has duplicate samples`);
    }
    
    console.log(`✅ Evaluator ${evaluatorPos}: ${blindCodes.join(' → ')}`);
    randomizationTable.evaluators.push(evaluatorAssignment);
  }
  
  console.log('🎯 Final validation: checking all evaluators have unique sample sequences');
  // Dodatna validacija - isprintaj sve evaluatore za pregled
  for (let i = 0; i < randomizationTable.evaluators.length; i++) {
    const evaluator = randomizationTable.evaluators[i];
    const sequence = evaluator.sampleOrder.map((s: any) => s.blindCode);
    console.log(`Evaluator ${i + 1}: ${sequence.join(' → ')}`);
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
    console.log('🎯 BULLETPROOF getNextSample START');
    console.log('📊 Parameters:', { userId, eventId, productTypeId, completedCount: completedSampleIds?.length });

    // STEP 1: Get user data - SIMPLIFIED
    console.log('👤 Getting user data...');
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('evaluator_position, username, role')
      .eq('id', userId)
      .single();

    if (userError || !user) {
      console.error('❌ User lookup failed:', userError);
      throw new Error('User not found');
    }

    const evaluatorPosition = user.evaluator_position;
    console.log('✅ User found:', { username: user.username, evaluatorPosition });

    if (!evaluatorPosition) {
      console.error('❌ No evaluator position');
      throw new Error('User has no evaluator position');
    }

    // STEP 2: Get product types - SIMPLIFIED
    console.log('📦 Getting product types...');
    let productTypesToCheck = [];
    
    if (productTypeId) {
      const { data: specificProductType, error } = await supabase
        .from('product_types')
        .select('*')
        .eq('id', productTypeId)
        .eq('event_id', eventId)
        .single();
          
      if (error || !specificProductType) {
        console.error('❌ Specific product type not found:', error);
        throw new Error('Product type not found');
      }
      
      productTypesToCheck = [specificProductType];
      console.log('✅ Specific product type:', specificProductType.product_name);
    } else {
      const { data: allProductTypes, error } = await supabase
        .from('product_types')
        .select('*')
        .eq('event_id', eventId)
        .order('display_order');
          
      if (error || !allProductTypes) {
        console.error('❌ Product types lookup failed:', error);
        throw new Error('Could not fetch product types');
      }
      
      productTypesToCheck = allProductTypes;
      console.log('✅ All product types found:', allProductTypes.length);
    }

    if (productTypesToCheck.length === 0) {
      console.error('❌ No product types found for event');
      return { sample: null, isComplete: true };
    }

    // STEP 3: Get completed evaluations - SIMPLIFIED
    if (!completedSampleIds) {
      console.log('📋 Getting completed evaluations...');
      const { data: evaluations, error } = await supabase
        .from('evaluations')
        .select('sample_id')
        .eq('user_id', userId)
        .eq('event_id', eventId);

      if (error) {
        console.error('❌ Evaluations lookup failed:', error);
        throw new Error('Could not fetch completed evaluations');
      }
      
      completedSampleIds = evaluations?.map(e => e.sample_id) || [];
      console.log('✅ Completed evaluations:', completedSampleIds.length);
    }

    // STEP 4: Check each product type for next sample
    console.log('🔍 Checking product types for next sample...');
    for (const [index, productType] of productTypesToCheck.entries()) {
      console.log(`\n📂 Checking product type ${index + 1}/${productTypesToCheck.length}: ${productType.product_name}`);
      
      // Get randomization - SIMPLIFIED
      const randomization = await getRandomization(productType.id);
      
      if (!randomization) {
        console.log('❌ No randomization found - skipping');
        continue;
      }
      
      console.log('✅ Randomization found');

      // Validate and find evaluator assignment
      if (!randomization.randomization_table?.evaluators) {
        console.error('❌ Invalid randomization structure');
        continue;
      }

      const evaluatorAssignment = randomization.randomization_table.evaluators.find(
        (e: any) => e.evaluatorPosition === evaluatorPosition
      );

      if (!evaluatorAssignment?.sampleOrder?.length) {
        console.log('❌ No assignment for evaluator position:', evaluatorPosition);
        continue;
      }

      console.log('✅ Found assignment with', evaluatorAssignment.sampleOrder.length, 'samples');

      // Find next uncompleted sample
      for (const [sampleIndex, sampleAssignment] of evaluatorAssignment.sampleOrder.entries()) {
        const isCompleted = completedSampleIds?.includes(sampleAssignment.sampleId);
        console.log(`🔍 Sample ${sampleIndex + 1}: ${sampleAssignment.blindCode} - ${isCompleted ? 'COMPLETED' : 'PENDING'}`);
        
        if (!isCompleted) {
          console.log('🎯 Found next sample:', sampleAssignment.sampleId);
          
          // Get full sample data - SIMPLIFIED
          const { data: sample, error } = await supabase
            .from('samples')
            .select('*')
            .eq('id', sampleAssignment.sampleId)
            .single();

          if (error || !sample) {
            console.error('❌ Could not fetch sample:', error);
            continue;
          }

          const nextSample = {
            ...sample,
            productTypeId: productType.id,
            productTypeName: productType.product_name,
            presentationOrder: sampleAssignment.presentationOrder,
            blindCode: sampleAssignment.blindCode
          };

          console.log('🎉 NEXT SAMPLE FOUND:', {
            id: nextSample.id,
            brand: nextSample.brand,
            blindCode: nextSample.blindCode,
            productType: nextSample.productTypeName
          });
          
          return { sample: nextSample, isComplete: false };
        }
      }

      console.log('✅ All samples completed for this product type');
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
