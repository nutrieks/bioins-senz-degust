
import { 
  User, Event, ProductType, Sample, JARAttribute, 
  Randomization, Evaluation, HedonicScale, JARRating,
  HedonicReport, JARReport, EventStatus, RetailerCode, BaseProductType, UserRole
} from "../types";
import { 
  users, events, productTypes, samples, jarAttributes, 
  randomizations, evaluations, baseProductTypes
} from "./mock";
import { generateRandomizationTable, getNextSample } from "./mock/utils";

// Helper function for delaying operations (for simulating network requests)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Authentication
export async function login(username: string, password: string): Promise<User | null> {
  const user = users.find(u => u.username === username);
  return user || null;
}

// Event Management
export async function getEvents(): Promise<Event[]> {
  return [...events];
}

export async function getEvent(eventId: string): Promise<Event | null> {
  return events.find(e => e.id === eventId) || null;
}

export async function createEvent(date: string): Promise<Event> {
  const newEvent: Event = {
    id: `event_${Date.now()}`,
    date,
    status: EventStatus.PREPARATION,
    productTypes: [],
    createdAt: new Date().toISOString(),
    randomizationComplete: false
  };
  
  events.push(newEvent);
  return newEvent;
}

export async function updateEventStatus(eventId: string, status: EventStatus): Promise<boolean> {
  const event = events.find(e => e.id === eventId);
  if (!event) return false;
  
  event.status = status;
  return true;
}

// Base Product Type Management (for reuse across events)
export async function getAllProductTypes(): Promise<BaseProductType[]> {
  return [...baseProductTypes];
}

export async function getBaseProductType(productTypeId: string): Promise<BaseProductType | null> {
  const productType = baseProductTypes.find(pt => pt.id === productTypeId);
  console.log("Retrieved base product type:", productTypeId, productType);
  return productType || null;
}

export async function createBaseProductType(
  productName: string,
  jarAttributes: JARAttribute[]
): Promise<BaseProductType> {
  const now = new Date().toISOString();
  const id = `base_product_${Date.now()}`;
  
  const attributes = jarAttributes.map(attr => ({
    ...attr,
    id: `attr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    productTypeId: id,
    scaleHR: attr.scaleHR as [string, string, string, string, string],
    scaleEN: attr.scaleEN as [string, string, string, string, string]
  }));
  
  const newBaseProductType: BaseProductType = {
    id,
    productName,
    jarAttributes: attributes,
    createdAt: now
  };
  
  baseProductTypes.push(newBaseProductType);
  return newBaseProductType;
}

export async function updateBaseProductType(
  productTypeId: string,
  productName: string,
  jarAttributes: JARAttribute[]
): Promise<boolean> {
  const index = baseProductTypes.findIndex(pt => pt.id === productTypeId);
  if (index === -1) return false;
  
  const updatedAttributes = jarAttributes.map(attr => ({
    ...attr,
    productTypeId,
    scaleHR: attr.scaleHR as [string, string, string, string, string],
    scaleEN: attr.scaleEN as [string, string, string, string, string]
  }));
  
  baseProductTypes[index] = {
    ...baseProductTypes[index],
    productName,
    jarAttributes: updatedAttributes
  };
  
  return true;
}

export async function deleteProductType(productTypeId: string): Promise<boolean> {
  const index = baseProductTypes.findIndex(pt => pt.id === productTypeId);
  if (index === -1) return false;
  
  const isUsed = productTypes.some(pt => pt.baseProductTypeId === productTypeId);
  if (isUsed) {
    console.warn("Deleting a product type that is used in events. This could cause issues.");
  }
  
  baseProductTypes.splice(index, 1);
  return true;
}

// Product Type Management (within events)
export async function getProductTypes(eventId: string): Promise<ProductType[]> {
  return productTypes.filter(pt => pt.eventId === eventId);
}

export async function createProductType(
  eventId: string, 
  customerCode: string, 
  baseProductTypeId: string, 
  baseCode: string,
  displayOrder: number
): Promise<ProductType> {
  const baseType = baseProductTypes.find(pt => pt.id === baseProductTypeId);
  if (!baseType) throw new Error("Base product type not found");
  
  const newProductTypeId = `product_${Date.now()}`;
  
  const jarAttributesCopy = baseType.jarAttributes.map(attr => ({
    ...attr,
    id: `attr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    productTypeId: newProductTypeId,
    scaleHR: [...attr.scaleHR] as [string, string, string, string, string],
    scaleEN: [...attr.scaleEN] as [string, string, string, string, string]
  }));
  
  const newProductType: ProductType = {
    id: newProductTypeId,
    eventId,
    customerCode,
    productName: baseType.productName,
    baseCode,
    samples: [],
    jarAttributes: jarAttributesCopy,
    displayOrder,
    baseProductTypeId
  };
  
  productTypes.push(newProductType);
  
  const event = events.find(e => e.id === eventId);
  if (event) {
    event.productTypes.push(newProductType);
  }
  
  return newProductType;
}

// Sample Management
export async function getSamples(productTypeId: string): Promise<Sample[]> {
  return samples.filter(s => s.productTypeId === productTypeId);
}

export async function createSample(
  productTypeId: string,
  brand: string,
  retailerCode: RetailerCode
): Promise<Sample> {
  const newSample: Sample = {
    id: `sample_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    productTypeId,
    brand,
    retailerCode,
    images: {
      details: []
    }
  };
  
  samples.push(newSample);
  
  const productType = productTypes.find(pt => pt.id === productTypeId);
  if (productType) {
    productType.samples.push(newSample);
  }
  
  return newSample;
}

export async function updateSampleImages(
  sampleId: string,
  preparedImage?: string,
  packagingImage?: string,
  detailImages?: string[]
): Promise<boolean> {
  const sample = samples.find(s => s.id === sampleId);
  if (!sample) return false;
  
  if (preparedImage) {
    sample.images.prepared = preparedImage;
  }
  
  if (packagingImage) {
    sample.images.packaging = packagingImage;
  }
  
  if (detailImages) {
    sample.images.details = detailImages;
  }
  
  return true;
}

// JAR Attribute Management
export async function getJARAttributes(productTypeId: string): Promise<JARAttribute[]> {
  const attributes = jarAttributes.filter(ja => ja.productTypeId === productTypeId);
  console.log(`Getting JAR attributes for productTypeId ${productTypeId}:`, attributes);
  return attributes;
}

export async function createJARAttribute(
  productTypeId: string,
  nameHR: string,
  nameEN: string,
  scaleHR: [string, string, string, string, string],
  scaleEN: [string, string, string, string, string]
): Promise<JARAttribute> {
  const newAttribute: JARAttribute = {
    id: `attr_${Date.now()}`,
    productTypeId,
    nameHR,
    nameEN,
    scaleHR,
    scaleEN
  };
  
  jarAttributes.push(newAttribute);
  
  const productType = productTypes.find(pt => pt.id === productTypeId);
  if (productType) {
    productType.jarAttributes.push(newAttribute);
  }
  
  return newAttribute;
}

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

// Evaluation Management
export async function getCompletedEvaluations(
  userId: string, 
  eventId: string, 
  productTypeId?: string
): Promise<string[]> {
  let query = evaluations.filter(e => 
    e.userId === userId && e.eventId === eventId
  );
  
  if (productTypeId) {
    query = query.filter(e => e.productTypeId === productTypeId);
  }
  
  return query.map(e => e.sampleId);
}

export { getNextSample };

export async function submitEvaluation(
  userId: string,
  sampleId: string,
  productTypeId: string,
  eventId: string,
  hedonic: HedonicScale,
  jar: JARRating
): Promise<boolean> {
  const newEvaluation: Evaluation = {
    id: `eval_${Date.now()}`,
    userId,
    sampleId,
    productTypeId,
    eventId,
    hedonic,
    jar,
    timestamp: new Date().toISOString()
  };
  
  evaluations.push(newEvaluation);
  return true;
}

// Evaluation status tracking
export async function getEvaluationsStatus(eventId: string) {
  // Mock implementation for now - would be replaced with actual API call
  try {
    await delay(500); // Simulate network delay
    
    const event = events.find(e => e.id === eventId);
    if (!event) throw new Error("Event not found");
    
    // Get all users who are evaluators (not admins)
    const evaluators = users.filter(user => user.role === UserRole.EVALUATOR);
    
    // Get all product types for this event
    const eventProductTypes = productTypes.filter(pt => pt.eventId === eventId);
    
    // Get all samples for these product types
    const allSamples = eventProductTypes.flatMap(pt => 
      samples.filter(s => s.productTypeId === pt.id)
    );
    
    // For each evaluator, check which samples they've completed
    const evaluationStatus = evaluators.map(evaluator => {
      const userEvaluations = evaluations.filter(
        e => e.userId === evaluator.id && e.eventId === eventId
      );
      
      const completedSamples = eventProductTypes.map(productType => {
        const productTypeEvaluations = userEvaluations.filter(
          e => e.productTypeId === productType.id
        );
        
        const productTypeSamples = samples.filter(
          s => s.productTypeId === productType.id
        );
        
        return {
          productTypeName: productType.productName,
          productTypeId: productType.id,
          samples: productTypeSamples.map(sample => {
            const isCompleted = productTypeEvaluations.some(
              e => e.sampleId === sample.id
            );
            
            return {
              sampleId: sample.id,
              blindCode: sample.blindCode,
              isCompleted
            };
          })
        };
      });
      
      // Calculate total completed samples and total samples for this user
      const totalCompleted = completedSamples.reduce(
        (acc, curr) => acc + curr.samples.filter(s => s.isCompleted).length, 
        0
      );
      
      const totalSamples = completedSamples.reduce(
        (acc, curr) => acc + curr.samples.length, 
        0
      );
      
      return {
        userId: evaluator.id,
        username: evaluator.username,
        position: evaluator.evaluatorPosition || 0,
        completedSamples,
        totalCompleted,
        totalSamples
      };
    });
    
    return evaluationStatus;
  } catch (error) {
    console.error("Error getting evaluations status:", error);
    throw error;
  }
}

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
  const report: JARReport = {};
  
  const productAttributes = jarAttributes.filter(a => a.productTypeId === productTypeId);
  
  const productSamples = samples.filter(s => s.productTypeId === productTypeId);
  
  for (const attribute of productAttributes) {
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
      
      if (sampleEvaluations.length === 0) continue;
      
      const frequencies: [number, number, number, number, number] = [0, 0, 0, 0, 0];
      
      for (const evaluation of sampleEvaluations) {
        const rating = evaluation.jar[attribute.id];
        if (rating >= 1 && rating <= 5) {
          frequencies[rating - 1]++;
        }
      }
      
      report[attribute.id].results[sample.id] = {
        brand: sample.brand,
        retailerCode: sample.retailerCode,
        blindCode: sample.blindCode || "",
        frequencies
      };
    }
  }
  
  return report;
}

// User Management
export async function getUsers(): Promise<User[]> {
  return [...users];
}

export async function createUser(
  username: string,
  role: string,
  evaluatorPosition?: number
): Promise<User> {
  const newUser: User = {
    id: `user_${Date.now()}`,
    username,
    role: role as any,
    evaluatorPosition,
    isActive: true
  };
  
  users.push(newUser);
  return newUser;
}

export async function updateUserStatus(userId: string, isActive: boolean): Promise<boolean> {
  const user = users.find(u => u.id === userId);
  if (!user) return false;
  
  user.isActive = isActive;
  return true;
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
