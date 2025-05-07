
// Fisher-Yates shuffle algorithm
export function shuffle(array: any[]): any[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

import { productTypes, samples, randomizations } from './index';

// Randomization Table Generator
export function generateRandomizationTable(productTypeId: string, sampleCount: number): { id: string; productTypeId: string; table: any } {
  const table: { [position: number]: { [round: number]: string } } = {};
  
  // Get the product type to access its base code
  const productType = productTypes.find(pt => pt.id === productTypeId);
  if (!productType) {
    throw new Error(`Product type ${productTypeId} not found`);
  }
  
  const baseCode = productType?.baseCode || "X";
  
  // Create arrays for all sample indices and their blind codes
  const sampleIndices = Array.from({ length: sampleCount }, (_, i) => i);
  const allBlindCodes = sampleIndices.map(i => `${baseCode}${i + 1}`);
  
  // Create a master distribution pattern that ensures good variability
  const masterDistribution: string[][] = [];
  
  for (let i = 0; i < sampleCount; i++) {
    // For each round, create a unique shuffled order of blind codes
    const roundCodes = shuffle([...allBlindCodes]);
    masterDistribution.push(roundCodes);
  }
  
  // For each position, assign samples based on a shifted version of the master pattern
  for (let position = 1; position <= 12; position++) {
    table[position] = {};
    
    // Generate a unique shifted pattern for this position
    // This creates more variability between positions
    const shift = (position - 1) % sampleCount;
    const positionPattern = [...masterDistribution];
    
    // Apply the shift to each round in the position pattern
    for (let round = 0; round < positionPattern.length; round++) {
      const shiftedCodes = [...positionPattern[round]];
      for (let i = 0; i < shiftedCodes.length; i++) {
        const newIndex = (i + shift) % shiftedCodes.length;
        shiftedCodes[i] = positionPattern[round][newIndex];
      }
      positionPattern[round] = shiftedCodes;
    }
    
    // Shuffle the order of rounds for this position to add more randomness
    const roundOrder = shuffle([...Array(sampleCount)].map((_, i) => i));
    
    // Assign blind codes to each round based on the shuffled position pattern
    for (let round = 1; round <= sampleCount; round++) {
      const patternIndex = roundOrder[round - 1];
      table[position][round] = positionPattern[patternIndex][position % sampleCount];
    }
  }
  
  // Check if any position's pattern has a blind code repeating across rounds
  for (let position = 1; position <= 12; position++) {
    const codesForThisPosition: string[] = [];
    for (let round = 1; round <= sampleCount; round++) {
      codesForThisPosition.push(table[position][round]);
    }
    
    // Check for duplicates in this position
    const uniqueCodes = new Set(codesForThisPosition);
    if (uniqueCodes.size < codesForThisPosition.length) {
      // If duplicates found, regenerate this position's distribution
      const uniqueBlindCodes = shuffle([...allBlindCodes]);
      for (let round = 1; round <= sampleCount; round++) {
        table[position][round] = uniqueBlindCodes[round - 1];
      }
    }
  }
  
  // Final validation check to ensure no position has duplicates
  for (let position = 1; position <= 12; position++) {
    const codesInThisPosition = Object.values(table[position]);
    const uniqueCodesInPosition = new Set(codesInThisPosition);
    if (uniqueCodesInPosition.size !== codesInThisPosition.length) {
      // This should never happen with the above fixes, but just in case
      // Create a completely fresh distribution for this position
      const freshCodes = shuffle([...allBlindCodes]);
      for (let round = 1; round <= sampleCount; round++) {
        table[position][round] = freshCodes[round - 1];
      }
    }
  }
  
  // Perform a pattern check across positions
  const patternCount = checkForPatternAcrossPositions(table, sampleCount);
  if (patternCount > 3) { // If too many positions have the same pattern
    // Fix by reshuffling some positions
    const positionsToReshuffle = [3, 7, 9]; // Choose some positions to reshuffle
    positionsToReshuffle.forEach(pos => {
      if (pos <= 12) {
        // Completely reshuffle this position's rounds
        const newShuffledCodes = shuffle([...allBlindCodes]);
        for (let round = 1; round <= sampleCount; round++) {
          table[pos][round] = newShuffledCodes[round - 1];
        }
      }
    });
  }
  
  const randomizationId = `rand_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  return {
    id: randomizationId,
    productTypeId,
    table
  };
}

// Helper function to check for patterns across positions
function checkForPatternAcrossPositions(table: any, sampleCount: number): number {
  const patterns = new Map<string, number>();
  
  // Generate a pattern string for each position
  for (let position = 1; position <= 12; position++) {
    const patternArray = [];
    for (let round = 1; round <= sampleCount; round++) {
      patternArray.push(table[position][round]);
    }
    const patternString = patternArray.join('-');
    patterns.set(patternString, (patterns.get(patternString) || 0) + 1);
  }
  
  // Find the most common pattern
  let maxCount = 0;
  patterns.forEach(count => {
    if (count > maxCount) {
      maxCount = count;
    }
  });
  
  return maxCount;
}

// Get next sample for evaluation
export function getNextSample(
  userId: string,
  eventId: string,
  productTypeId: string | undefined,
  completedSamples: string[]
): { sample: any; round: number; isComplete: boolean } {
  // Default return for no next sample
  const defaultReturn = { sample: null, round: 0, isComplete: true };
  
  // If no productTypeId provided, can't determine next sample
  if (!productTypeId) return defaultReturn;
  
  // Find the product type
  const productType = productTypes.find(pt => pt.id === productTypeId);
  if (!productType) return defaultReturn;
  
  // Get all samples for this product type
  const productSamples = samples.filter(s => s.productTypeId === productTypeId);
  if (productSamples.length === 0) return defaultReturn;
  
  // If the user has completed all samples, return isComplete
  if (completedSamples.length >= productSamples.length) {
    return defaultReturn;
  }
  
  // Find randomization for this product
  const randomization = randomizations.find(r => r.productTypeId === productTypeId);
  if (!randomization) {
    // If no randomization, just return first sample that's not completed
    const nextSample = productSamples.find(s => !completedSamples.includes(s.id));
    return {
      sample: nextSample || null,
      round: completedSamples.length + 1,
      isComplete: !nextSample
    };
  }
  
  // Get user's evaluator position (from 1-12)
  // This would come from user record in a real app
  const evaluatorPosition = parseInt(userId.replace("evaluator", "")) || 1;
  
  // Determine which round the user is on (1-based)
  const currentRound = completedSamples.length + 1;
  
  // Get blind code from randomization table
  const blindCode = randomization.table[evaluatorPosition]?.[currentRound];
  
  if (!blindCode) {
    // User has completed all rounds
    return defaultReturn;
  }
  
  // Find the sample with this blind code
  const nextSample = productSamples.find(s => s.blindCode === blindCode);
  
  return {
    sample: nextSample || null,
    round: currentRound,
    isComplete: !nextSample
  };
}
