
// Generira permutacije uzoraka za evaluatore - svaki evaluator dobije svaki uzorak točno jednom
export function generateSamplePermutations(numSamples: number, numEvaluators: number): number[][] {
  console.log(`🎲 Generating sample permutations: ${numSamples} samples for ${numEvaluators} evaluators`);
  
  if (numSamples > numEvaluators) {
    throw new Error(`Cannot assign ${numSamples} samples to only ${numEvaluators} evaluators`);
  }

  const permutations: number[][] = [];
  
  // Generiraj različite permutacije uzoraka za svaki evaluator
  for (let evaluator = 0; evaluator < numEvaluators; evaluator++) {
    // Kreiraj osnovni niz uzoraka (1, 2, 3, ... numSamples)
    const sampleOrder = Array.from({ length: numSamples }, (_, i) => i + 1);
    
    // Randomno promiješaj redoslijed za ovog evaluatora
    const shuffled = shuffleArray(sampleOrder);
    permutations.push(shuffled);
    
    console.log(`📋 Evaluator ${evaluator + 1}: ${shuffled.join(', ')}`);
  }
  
  // Validacija - provjeri da svaki evaluator ima svaki uzorak točno jednom
  for (let i = 0; i < permutations.length; i++) {
    const evaluatorSamples = permutations[i];
    const uniqueSamples = new Set(evaluatorSamples);
    
    if (uniqueSamples.size !== numSamples) {
      console.error(`❌ Evaluator ${i + 1} has duplicates:`, evaluatorSamples);
      throw new Error(`Evaluator ${i + 1} has duplicate samples`);
    }
    
    // Provjeri da su svi uzorci između 1 i numSamples
    for (const sample of evaluatorSamples) {
      if (sample < 1 || sample > numSamples) {
        throw new Error(`Invalid sample number ${sample} for evaluator ${i + 1}`);
      }
    }
  }
  
  console.log('✅ All permutations generated successfully - no duplicates');
  return permutations;
}

// Zastarjela funkcija - zadržana za kompatibilnost
export function generateLatinSquare(n: number): number[][] {
  console.warn('⚠️ generateLatinSquare is deprecated, use generateSamplePermutations instead');
  return generateSamplePermutations(n, n);
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
