
import { 
  HedonicReport, 
  JARReport, 
  ProductType, 
  Sample,
  JARAttribute,
  Evaluation,
  RetailerCode
} from "../../types";
import { 
  evaluations, 
  samples, 
  jarAttributes, 
  productTypes 
} from "../mock";
import { users } from "../mock/users";
import { delay } from "./events";

// Reporting
export async function generateHedonicReport(productTypeId: string): Promise<HedonicReport> {
  await delay(800);
  
  const productType = productTypes.find(pt => pt.id === productTypeId);
  if (!productType) {
    throw new Error("Product type not found");
  }

  const productSamples = samples.filter(s => s.productTypeId === productTypeId);
  const productEvaluations = evaluations.filter(e => e.productTypeId === productTypeId);

  const report: HedonicReport = {};

  productSamples.forEach(sample => {
    const sampleEvals = productEvaluations.filter(e => e.sampleId === sample.id);
    
    if (sampleEvals.length > 0) {
      const avgAppearance = sampleEvals.reduce((sum, e) => sum + e.hedonic.appearance, 0) / sampleEvals.length;
      const avgOdor = sampleEvals.reduce((sum, e) => sum + e.hedonic.odor, 0) / sampleEvals.length;
      const avgTexture = sampleEvals.reduce((sum, e) => sum + e.hedonic.texture, 0) / sampleEvals.length;
      const avgFlavor = sampleEvals.reduce((sum, e) => sum + e.hedonic.flavor, 0) / sampleEvals.length;
      const avgOverall = sampleEvals.reduce((sum, e) => sum + e.hedonic.overallLiking, 0) / sampleEvals.length;

      report[sample.id] = {
        brand: sample.brand,
        retailerCode: sample.retailerCode,
        blindCode: sample.blindCode || '',
        hedonic: {
          appearance: Math.round(avgAppearance * 100) / 100,
          odor: Math.round(avgOdor * 100) / 100,
          texture: Math.round(avgTexture * 100) / 100,
          flavor: Math.round(avgFlavor * 100) / 100,
          overallLiking: Math.round(avgOverall * 100) / 100
        }
      };
    }
  });

  return report;
}

export async function generateJARReport(productTypeId: string): Promise<JARReport> {
  await delay(800);
  
  console.log("Generating JAR report for productTypeId:", productTypeId);
  
  const productType = productTypes.find(pt => pt.id === productTypeId);
  if (!productType) {
    throw new Error("Product type not found");
  }

  const productSamples = samples.filter(s => s.productTypeId === productTypeId);
  const productJARAttributes = jarAttributes.filter(ja => ja.productTypeId === productTypeId);
  const productEvaluations = evaluations.filter(e => e.productTypeId === productTypeId);

  console.log("Found samples:", productSamples);
  console.log("Found JAR attributes:", productJARAttributes);
  console.log("Found evaluations:", productEvaluations);

  const report: JARReport = {};

  productJARAttributes.forEach(attribute => {
    console.log(`Processing JAR attribute: ${attribute.nameEN} (${attribute.id})`);
    
    const sampleResults: any = {};
    
    productSamples.forEach(sample => {
      console.log(`Processing sample: ${sample.brand} (${sample.id})`);
      
      const sampleEvals = productEvaluations.filter(e => e.sampleId === sample.id);
      console.log(`Found ${sampleEvals.length} evaluations for sample ${sample.id}`);
      
      if (sampleEvals.length > 0) {
        // Initialize frequency array [1,2,3,4,5] -> [0,0,0,0,0]
        const frequencies = [0, 0, 0, 0, 0];
        
        // Count frequencies for this attribute
        sampleEvals.forEach(evaluation => {
          const jarValue = evaluation.jar[attribute.id];
          if (jarValue && jarValue >= 1 && jarValue <= 5) {
            frequencies[jarValue - 1]++; // Convert 1-5 to 0-4 index
          }
        });
        
        console.log(`Sample ${sample.brand} frequencies for ${attribute.nameEN}:`, frequencies);
        
        sampleResults[sample.id] = {
          brand: sample.brand,
          retailerCode: sample.retailerCode,
          blindCode: sample.blindCode || '',
          frequencies: frequencies as [number, number, number, number, number]
        };
      }
    });
    
    report[attribute.id] = {
      nameEN: attribute.nameEN,
      nameHR: attribute.nameHR,
      scaleEN: attribute.scaleEN,
      scaleHR: attribute.scaleHR,
      results: sampleResults
    };
    
    console.log(`JAR attribute ${attribute.nameEN} results:`, report[attribute.id]);
  });

  console.log("Final JAR report:", report);
  return report;
}

export async function getRawData(eventId: string): Promise<any[]> {
  try {
    const eventEvaluations = evaluations.filter(e => e.eventId === eventId);
    
    if (eventEvaluations.length === 0) {
      return [];
    }
    
    return eventEvaluations.map(evaluation => {
      const sample = samples.find(s => s.id === evaluation.sampleId);
      const user = users.find(u => u.id === evaluation.userId);
      const productType = productTypes.find(pt => pt.id === evaluation.productTypeId);
      
      const baseData = {
        timestamp: evaluation.timestamp,
        evaluator: user?.username || 'Unknown',
        evaluatorPosition: user?.evaluatorPosition || 0,
        eventId: evaluation.eventId,
        productType: productType?.productName || 'Unknown',
        customerCode: productType?.customerCode || 'Unknown',
        sampleId: evaluation.sampleId,
        brand: sample?.brand || 'Unknown',
        retailerCode: sample?.retailerCode || 'Unknown',
        blindCode: sample?.blindCode || 'Unknown',
        appearance: evaluation.hedonic.appearance,
        odor: evaluation.hedonic.odor,
        texture: evaluation.hedonic.texture,
        flavor: evaluation.hedonic.flavor,
        overallLiking: evaluation.hedonic.overallLiking,
      };
      
      const jarRatings = { ...evaluation.jar };
      
      return { ...baseData, ...jarRatings };
    });
  } catch (error) {
    console.error("Error getting raw data:", error);
    return [];
  }
}
