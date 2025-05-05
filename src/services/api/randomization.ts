
import { Randomization } from "../../types";
import { randomizations, productTypes, events, samples } from "../mock";
import { generateRandomizationTable, getNextSample } from "../mock/utils";

// Randomization Management
export async function getRandomization(productTypeId: string): Promise<Randomization | null> {
  return randomizations.find(r => r.productTypeId === productTypeId) || null;
}

export async function createRandomization(productTypeId: string): Promise<Randomization | null> {
  const productType = productTypes.find(pt => pt.id === productTypeId);
  if (!productType) return null;
  
  const sampleCount = productType.samples.length;
  if (sampleCount === 0) return null;
  
  const randomization = generateRandomizationTable(productTypeId, sampleCount);
  
  productType.samples.forEach((sample, index) => {
    sample.blindCode = `${productType.baseCode}${index + 1}`;
  });
  
  randomizations.push(randomization);
  
  productType.hasRandomization = true;
  
  const event = events.find(e => e.id === productType.eventId);
  if (event) {
    const allRandomized = productTypes
      .filter(pt => pt.eventId === event.id)
      .every(pt => pt.hasRandomization);
    
    if (allRandomized) {
      event.randomizationComplete = true;
    }
  }
  
  return randomization;
}

// Export the getNextSample function from mock/utils
export { getNextSample };
