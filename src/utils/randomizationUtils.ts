
// Utility functions for randomization data validation and transformation

export interface RandomizationTableFormat {
  [position: number]: {
    [round: number]: string;
  };
}

export interface EvaluatorFormat {
  evaluatorPosition: number;
  sampleOrder: Array<{
    sampleId: string;
    blindCode: string;
    presentationOrder: number;
    brand: string;
  }>;
}

export interface RandomizationData {
  samples: Array<{
    id: string;
    brand: string;
    retailerCode: string;
    blindCode: string;
    position: number;
  }>;
  evaluators: EvaluatorFormat[];
  table?: RandomizationTableFormat;
}

/**
 * Validates randomization data structure
 */
export function validateRandomizationData(data: any): boolean {
  console.log('Validating randomization data:', data);
  
  if (!data || typeof data !== 'object') {
    console.error('Randomization data is not an object');
    return false;
  }
  
  if (!data.evaluators || !Array.isArray(data.evaluators)) {
    console.error('Randomization data missing evaluators array');
    return false;
  }
  
  if (data.evaluators.length === 0) {
    console.error('Randomization data has no evaluators');
    return false;
  }
  
  // Check first evaluator structure
  const firstEvaluator = data.evaluators[0];
  if (!firstEvaluator.evaluatorPosition || !firstEvaluator.sampleOrder) {
    console.error('Invalid evaluator structure');
    return false;
  }
  
  console.log('Randomization data validation passed');
  return true;
}

/**
 * Transforms evaluator format to table format for display
 */
export function transformToTableFormat(data: RandomizationData): RandomizationTableFormat {
  console.log('Transforming to table format:', data);
  
  if (data.table) {
    console.log('Data already has table format');
    return data.table;
  }
  
  const table: RandomizationTableFormat = {};
  
  // Initialize 12 positions
  for (let position = 1; position <= 12; position++) {
    table[position] = {};
  }
  
  // Fill table from evaluators data
  data.evaluators.forEach((evaluator) => {
    const position = evaluator.evaluatorPosition;
    
    if (evaluator.sampleOrder) {
      evaluator.sampleOrder.forEach((sample, index) => {
        const round = index + 1;
        table[position][round] = sample.blindCode;
      });
    }
  });
  
  console.log('Table format created:', table);
  return table;
}

/**
 * Gets sample for specific evaluator and round
 */
export function getSampleForEvaluator(
  data: RandomizationData, 
  evaluatorPosition: number, 
  round: number
): string | null {
  console.log(`Getting sample for evaluator ${evaluatorPosition}, round ${round}`);
  
  const evaluator = data.evaluators.find(e => e.evaluatorPosition === evaluatorPosition);
  
  if (!evaluator || !evaluator.sampleOrder) {
    console.error(`No evaluator found for position ${evaluatorPosition}`);
    return null;
  }
  
  const sample = evaluator.sampleOrder[round - 1]; // Convert to 0-based index
  
  if (!sample) {
    console.error(`No sample found for evaluator ${evaluatorPosition}, round ${round}`);
    return null;
  }
  
  console.log(`Found sample: ${sample.blindCode} for evaluator ${evaluatorPosition}, round ${round}`);
  return sample.blindCode;
}

/**
 * Gets next uncompleted sample for evaluator
 */
export function getNextSampleForEvaluator(
  data: RandomizationData,
  evaluatorPosition: number,
  completedSampleIds: string[]
): any | null {
  console.log(`Getting next sample for evaluator ${evaluatorPosition}`);
  console.log('Completed sample IDs:', completedSampleIds);
  
  const evaluator = data.evaluators.find(e => e.evaluatorPosition === evaluatorPosition);
  
  if (!evaluator || !evaluator.sampleOrder) {
    console.error(`No evaluator found for position ${evaluatorPosition}`);
    return null;
  }
  
  // Find first uncompleted sample
  for (const sample of evaluator.sampleOrder) {
    if (!completedSampleIds.includes(sample.sampleId)) {
      console.log(`Next sample found: ${sample.blindCode} for evaluator ${evaluatorPosition}`);
      return sample;
    }
  }
  
  console.log(`No more samples for evaluator ${evaluatorPosition}`);
  return null;
}

/**
 * Checks if all product types in an event have randomization generated
 */
export function checkAllRandomizationsGenerated(productTypes: any[]): {
  allGenerated: boolean;
  missingCount: number;
  missingProductTypes: any[];
} {
  const missingProductTypes = productTypes.filter(pt => !pt.hasRandomization);
  
  return {
    allGenerated: missingProductTypes.length === 0,
    missingCount: missingProductTypes.length,
    missingProductTypes
  };
}

/**
 * Formats error message for missing randomizations
 */
export function formatRandomizationErrorMessage(missingProductTypes: any[]): string {
  if (missingProductTypes.length === 1) {
    return `Randomizacija nije generirana za tip proizvoda: ${missingProductTypes[0].productName}`;
  }
  
  return `Randomizacija nije generirana za ${missingProductTypes.length} tipova proizvoda. ` +
    `Generirajte randomizacije prije aktivacije događaja.`;
}
