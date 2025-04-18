
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
  
  // For each position (1-12)
  for (let position = 1; position <= 12; position++) {
    table[position] = {};
    
    // Create an array of blind codes (e.g., A1, A2, etc.)
    const productType = productTypes.find(pt => pt.id === productTypeId);
    if (!productType) continue;
    
    const baseCode = productType?.baseCode || "X";
    
    // Create an array of sample indices (0, 1, 2, ...) to shuffle
    const sampleIndices = Array.from({ length: sampleCount }, (_, i) => i);
    
    // For the first distribution (round 1), ensure it doesn't start with "1"
    // by swapping the first element if it's 0 (which would become sampleIndex+1 = 1)
    const shuffledIndices = shuffle([...sampleIndices]);
    
    // Make sure the first position doesn't have sample 1 for the first round
    if (shuffledIndices[0] === 0 && sampleCount > 1) {
      const randomSwap = 1 + Math.floor(Math.random() * (shuffledIndices.length - 1));
      [shuffledIndices[0], shuffledIndices[randomSwap]] = [shuffledIndices[randomSwap], shuffledIndices[0]];
    }
    
    // Assign blind codes to each round
    shuffledIndices.forEach((sampleIndex, roundIndex) => {
      const round = roundIndex + 1;
      table[position][round] = `${baseCode}${sampleIndex + 1}`;
    });
  }
  
  const randomizationId = `rand_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  return {
    id: randomizationId,
    productTypeId,
    table
  };
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
