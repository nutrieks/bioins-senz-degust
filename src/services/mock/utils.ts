
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
  const allPositions = Array.from({ length: 12 }, (_, i) => i + 1);
  
  // Create a master pattern for how samples are distributed
  // This will help ensure the distribution is varied across positions
  const masterDistribution = [];
  
  // For each sample, create a different shuffled order of positions
  for (let i = 0; i < sampleCount; i++) {
    const shuffledPositions = shuffle([...allPositions]);
    masterDistribution.push(shuffledPositions);
  }
  
  // For each position (1-12)
  for (let posIndex = 0; posIndex < 12; posIndex++) {
    const position = posIndex + 1;
    table[position] = {};
    
    // Get the product type to access its base code
    const productType = productTypes.find(pt => pt.id === productTypeId);
    if (!productType) continue;
    
    const baseCode = productType?.baseCode || "X";
    
    // Create an array of samples (1 to sampleCount)
    const sampleIndices = Array.from({ length: sampleCount }, (_, i) => i);
    
    // Determine the sample for each round based on where this position appears in masterDistribution
    const positionSamples = [];
    for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex++) {
      // Find where this position is in the distribution list for this sample
      const positionInList = masterDistribution[sampleIndex].indexOf(position);
      // Map this to a sample ID - ensuring varied distribution
      // We use modulo to ensure we stay within valid sample indices
      const mappedSampleIndex = (positionInList + sampleIndex) % sampleCount;
      positionSamples.push(mappedSampleIndex);
    }
    
    // Ensure no position has the same sample order by shuffling again if needed
    let needShuffle = true;
    let attemptCount = 0;
    let shuffledSamples;

    // Try different shuffles to find one that isn't uniform with others
    while (needShuffle && attemptCount < 10) {
      shuffledSamples = shuffle([...positionSamples]);
      
      // Check if the first sample starts with sampleIndex 0
      // We don't want the first round to consistently be sample 1
      if (posIndex > 0 && shuffledSamples[0] === 0 && sampleCount > 1) {
        // If so, swap with a random non-first position
        const swapTarget = 1 + Math.floor(Math.random() * (shuffledSamples.length - 1));
        [shuffledSamples[0], shuffledSamples[swapTarget]] = [shuffledSamples[swapTarget], shuffledSamples[0]];
      }
      
      // Introduce more diversity by swapping elements randomly
      if (sampleCount > 2 && Math.random() > 0.5) {
        const idx1 = Math.floor(Math.random() * shuffledSamples.length);
        let idx2 = Math.floor(Math.random() * shuffledSamples.length);
        while (idx2 === idx1) {
          idx2 = Math.floor(Math.random() * shuffledSamples.length);
        }
        [shuffledSamples[idx1], shuffledSamples[idx2]] = [shuffledSamples[idx2], shuffledSamples[idx1]];
      }
      
      needShuffle = false;
      attemptCount++;
    }
    
    // Assign blind codes to each round
    shuffledSamples.forEach((sampleIndex, roundIndex) => {
      const round = roundIndex + 1;
      table[position][round] = `${baseCode}${sampleIndex + 1}`;
    });
  }
  
  // Post-processing step: Analyze and fix patterns if they occur
  const patternCheck = checkForPatterns(table, sampleCount);
  if (patternCheck.hasPattern) {
    // Fix some identified patterns by swapping rounds
    for (const position of patternCheck.fixPositions) {
      if (position <= 0 || position > 12) continue;
      
      // Find two rounds to swap
      let round1 = Math.floor(Math.random() * sampleCount) + 1;
      let round2 = Math.floor(Math.random() * sampleCount) + 1;
      
      // Make sure they're different rounds
      while (round1 === round2) {
        round2 = Math.floor(Math.random() * sampleCount) + 1;
      }
      
      // Swap the samples between these rounds
      const temp = table[position][round1];
      table[position][round1] = table[position][round2];
      table[position][round2] = temp;
    }
  }
  
  const randomizationId = `rand_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  return {
    id: randomizationId,
    productTypeId,
    table
  };
}

// Helper function to analyze patterns in the table
function checkForPatterns(table: any, sampleCount: number): { hasPattern: boolean; fixPositions: number[] } {
  const fixPositions: number[] = [];
  let hasPattern = false;
  
  // Check for identical rows
  const rowPatterns: string[] = [];
  for (let position = 1; position <= 12; position++) {
    const row = table[position];
    const pattern = Object.values(row).join('-');
    rowPatterns.push(pattern);
  }
  
  // Count repeated patterns
  const patternCounts = new Map<string, number>();
  rowPatterns.forEach(pattern => {
    patternCounts.set(pattern, (patternCounts.get(pattern) || 0) + 1);
  });
  
  // Identify rows with repeated patterns that should be fixed
  let maxCount = 0;
  patternCounts.forEach(count => {
    if (count > maxCount) {
      maxCount = count;
    }
  });
  
  // If we have too many identical patterns, flag them for fixing
  if (maxCount > 4) {
    hasPattern = true;
    
    // Find the positions with these patterns that should be fixed
    const patternToFix = [...patternCounts.entries()]
      .find(([_, count]) => count === maxCount)?.[0];
      
    if (patternToFix) {
      rowPatterns.forEach((pattern, index) => {
        if (pattern === patternToFix && index < 8) { // Only fix some instances
          fixPositions.push(index + 1); // +1 because positions are 1-based
        }
      });
    }
  }
  
  // Check for column patterns where the same sample appears in too many consecutive positions
  for (let round = 1; round <= sampleCount; round++) {
    const sampleCounts = new Map<string, number>();
    
    for (let position = 1; position <= 12; position++) {
      const sample = table[position][round];
      sampleCounts.set(sample, (sampleCounts.get(sample) || 0) + 1);
    }
    
    sampleCounts.forEach((count, sample) => {
      if (count > 6) { // If a sample appears more than half the time in a round
        hasPattern = true;
        // Add some random positions to fix
        for (let i = 0; i < 3; i++) {
          fixPositions.push(Math.floor(Math.random() * 12) + 1);
        }
      }
    });
  }
  
  return { hasPattern, fixPositions };
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
