// Fisher-Yates shuffle algorithm
export function shuffle(array: any[]): any[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

import { productTypes } from './productTypes';

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
