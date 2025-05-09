
import { 
  HedonicReport, 
  JARReport, 
  RetailerCode 
} from "../../types";
import { 
  samples, 
  evaluations, 
  jarAttributes,
  users,
  productTypes
} from "../mock";

// Reporting
export async function generateHedonicReport(
  eventId: string, 
  productTypeId: string
): Promise<HedonicReport> {
  const report: HedonicReport = {};
  
  const productSamples = samples.filter(s => s.productTypeId === productTypeId);
  
  for (const sample of productSamples) {
    const sampleEvaluations = evaluations.filter(
      e => e.sampleId === sample.id && e.productTypeId === productTypeId && e.eventId === eventId
    );
    
    if (sampleEvaluations.length === 0) continue;
    
    const appearance = sampleEvaluations.reduce((sum, e) => sum + e.hedonic.appearance, 0) / sampleEvaluations.length;
    const odor = sampleEvaluations.reduce((sum, e) => sum + e.hedonic.odor, 0) / sampleEvaluations.length;
    const texture = sampleEvaluations.reduce((sum, e) => sum + e.hedonic.texture, 0) / sampleEvaluations.length;
    const flavor = sampleEvaluations.reduce((sum, e) => sum + e.hedonic.flavor, 0) / sampleEvaluations.length;
    const overallLiking = sampleEvaluations.reduce((sum, e) => sum + e.hedonic.overallLiking, 0) / sampleEvaluations.length;
    
    report[sample.id] = {
      brand: sample.brand,
      retailerCode: sample.retailerCode,
      blindCode: sample.blindCode || "",
      hedonic: {
        appearance,
        odor,
        texture,
        flavor,
        overallLiking
      }
    };
  }
  
  return report;
}

export async function generateJARReport(
  eventId: string, 
  productTypeId: string
): Promise<JARReport> {
  console.log(`Generating JAR report for event ${eventId}, product type ${productTypeId}`);
  const report: JARReport = {};
  
  const productAttributes = jarAttributes.filter(a => a.productTypeId === productTypeId);
  console.log(`Found ${productAttributes.length} JAR attributes for product type ${productTypeId}`);
  
  const productSamples = samples.filter(s => s.productTypeId === productTypeId);
  console.log(`Found ${productSamples.length} samples for product type ${productTypeId}`);
  
  // If no attributes found, create a dummy one for testing/demo purposes
  if (productAttributes.length === 0) {
    console.log("No real JAR attributes found, adding a sample attribute for demo");
    const dummyAttributeId = "dummyAttr1";
    report[dummyAttributeId] = {
      nameEN: "Sweetness",
      nameHR: "Slatkoća",
      scaleEN: ["Much too weak", "Too weak", "Just about right", "Too strong", "Much too strong"],
      scaleHR: ["Premalo", "Slabo", "Taman", "Prejako", "Daleko prejako"],
      results: {}
    };
    
    for (const sample of productSamples) {
      // Create dummy JAR frequency data for each sample
      report[dummyAttributeId].results[sample.id] = {
        brand: sample.brand,
        retailerCode: sample.retailerCode,
        blindCode: sample.blindCode || "",
        frequencies: [2, 3, 5, 2, 0] // Example frequency distribution
      };
    }
    
    return report;
  }
  
  for (const attribute of productAttributes) {
    console.log(`Processing attribute ${attribute.nameEN}`);
    report[attribute.id] = {
      nameEN: attribute.nameEN,
      nameHR: attribute.nameHR,
      scaleEN: attribute.scaleEN,
      scaleHR: attribute.scaleHR,
      results: {}
    };
    
    for (const sample of productSamples) {
      const sampleEvaluations = evaluations.filter(
        e => e.sampleId === sample.id && e.productTypeId === productTypeId && e.eventId === eventId
      );
      
      if (sampleEvaluations.length === 0) {
        console.log(`No evaluations found for sample ${sample.id}`);
        continue;
      }
      
      const frequencies: [number, number, number, number, number] = [0, 0, 0, 0, 0];
      
      for (const evaluation of sampleEvaluations) {
        const rating = evaluation.jar[attribute.id];
        if (rating >= 1 && rating <= 5) {
          frequencies[rating - 1]++;
        }
      }
      
      console.log(`Sample ${sample.brand}: JAR frequencies = [${frequencies.join(', ')}]`);
      
      report[attribute.id].results[sample.id] = {
        brand: sample.brand,
        retailerCode: sample.retailerCode,
        blindCode: sample.blindCode || "",
        frequencies
      };
    }
  }
  
  console.log("Final JAR report:", Object.keys(report).length, "attributes");
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
