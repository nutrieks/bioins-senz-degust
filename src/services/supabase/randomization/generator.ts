
export function generateLatinSquare(n: number): number[][] {
  const square: number[][] = [];
  
  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    for (let j = 0; j < n; j++) {
      row.push(((i + j) % n) + 1);
    }
    square.push(row);
  }
  
  return square;
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Note: generateRandomizedOrder and generateBlindCode are no longer used
// Blind codes are now managed by the samples.ts service when creating samples
// This ensures consistency and prevents overwriting existing blind codes
