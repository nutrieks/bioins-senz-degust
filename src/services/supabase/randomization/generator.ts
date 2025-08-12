
export function generateLatinSquare(n: number): number[][] {
  // Start with a base Latin square and then apply random permutations
  const base: number[][] = [];
  // Random offset to vary starting symbol
  const offset = Math.floor(Math.random() * n);

  for (let i = 0; i < n; i++) {
    const row: number[] = [];
    for (let j = 0; j < n; j++) {
      row.push(((i + j + offset) % n) + 1);
    }
    base.push(row);
  }

  // Apply random row and column permutations
  const rowOrder = shuffleArray(Array.from({ length: n }, (_, i) => i));
  const colOrder = shuffleArray(Array.from({ length: n }, (_, i) => i));

  const rowPermuted = rowOrder.map((r) => base[r]);
  const colPermuted = rowPermuted.map((row) => colOrder.map((c) => row[c]));

  // Apply a random symbol permutation (1..n)
  const symbolOrder = shuffleArray(Array.from({ length: n }, (_, i) => i + 1));
  const symbolMap = new Map(symbolOrder.map((newSym, idx) => [idx + 1, newSym]));

  const randomized = colPermuted.map((row) => row.map((val) => symbolMap.get(val)!));
  return randomized;
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
