
import { 
  Evaluation, 
  HedonicScale, 
  JARRating,
  HedonicReport,
  JARReport,
  UserRole
} from "../../types";
import { 
  evaluations, 
  users, 
  samples, 
  productTypes, 
  jarAttributes,
  events 
} from "../mock";
import { delay } from "./events";

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
