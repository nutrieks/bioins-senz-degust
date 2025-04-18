
import { 
  User, Event, ProductType, Sample, JARAttribute, 
  Randomization, Evaluation, HedonicScale, JARRating,
  HedonicReport, JARReport, EventStatus, RetailerCode, BaseProductType
} from "../types";
import { 
  users, events, productTypes, samples, jarAttributes, 
  randomizations, evaluations, baseProductTypes
} from "./mock";
import { generateRandomizationTable, getNextSample } from "./mock/utils";

// Authentication
export async function login(username: string, password: string): Promise<User | null> {
  // In a real app, this would verify password against a hashed version
  // For this mock, we just check if username exists
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
  
  // Create attributes with the new productTypeId
  const attributes = jarAttributes.map(attr => ({
    ...attr,
    id: `attr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    productTypeId: id,
    // Ensure scaleHR and scaleEN are proper tuples with 5 elements
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
  
  // Ensure attributes have the correct productTypeId and proper tuple types
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
  
  // Check if this product type is used in any event
  const isUsed = productTypes.some(pt => pt.baseProductTypeId === productTypeId);
  if (isUsed) {
    // In a real app, you might want to handle this differently
    // For now, we'll allow deletion even if it's used (since we're using mock data)
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
  // Get the base product type to copy its attributes
  const baseType = baseProductTypes.find(pt => pt.id === baseProductTypeId);
  if (!baseType) throw new Error("Base product type not found");
  
  // Create a new ID for this product type instance
  const newProductTypeId = `product_${Date.now()}`;
  
  // Create copies of the JAR attributes with the new productTypeId
  const jarAttributesCopy = baseType.jarAttributes.map(attr => ({
    ...attr,
    id: `attr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    productTypeId: newProductTypeId,
    // Ensure we maintain the tuple types
    scaleHR: [...attr.scaleHR] as [string, string, string, string, string],
    scaleEN: [...attr.scaleEN] as [string, string, string, string, string]
  }));

  // Add the copied attributes to the global jarAttributes array so they can be queried
  jarAttributesCopy.forEach(attr => {
    jarAttributes.push(attr);
  });
  
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
  
  // Update event reference
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
  
  // Update product type reference
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
  
  // Update product type reference
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
  
  // Generate randomization table
  const randomization = generateRandomizationTable(productTypeId, sampleCount);
  
  // Assign blind codes to samples based on baseCode
  // Now supporting extended codes beyond A-Z
  productType.samples.forEach((sample, index) => {
    // Use a combination of the base code and index+1
    // If base code is multi-character, we can still append the index
    sample.blindCode = `${productType.baseCode}${index + 1}`;
  });
  
  randomizations.push(randomization);
  
  // Set the hasRandomization property on the product type
  productType.hasRandomization = true;
  
  // Update product's event status
  const event = events.find(e => e.id === productType.eventId);
  if (event) {
    // Check if all product types for this event have randomization
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
  // Return IDs of samples already evaluated by this user
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

// Reporting
export async function generateHedonicReport(
  eventId: string, 
  productTypeId: string
): Promise<HedonicReport> {
  const report: HedonicReport = {};
  
  // Get all samples for this product
  const productSamples = samples.filter(s => s.productTypeId === productTypeId);
  
  // For each sample, calculate average hedonic ratings
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
  
  // Get all JAR attributes for this product
  const productAttributes = jarAttributes.filter(a => a.productTypeId === productTypeId);
  
  // Get all samples for this product
  const productSamples = samples.filter(s => s.productTypeId === productTypeId);
  
  // For each attribute, calculate frequency distribution of ratings
  for (const attribute of productAttributes) {
    report[attribute.id] = {
      nameEN: attribute.nameEN,
      nameHR: attribute.nameHR,
      scaleEN: attribute.scaleEN,
      scaleHR: attribute.scaleHR,
      results: {}
    };
    
    // For each sample, calculate frequency distribution
    for (const sample of productSamples) {
      const sampleEvaluations = evaluations.filter(
        e => e.sampleId === sample.id && e.productTypeId === productTypeId && e.eventId === eventId
      );
      
      if (sampleEvaluations.length === 0) continue;
      
      // Initialize frequencies
      const frequencies: [number, number, number, number, number] = [0, 0, 0, 0, 0];
      
      // Count occurrences of each rating (1-5)
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
