// This is the main entry point for data services
// It re-exports all services using Supabase instead of mock data

// Auth services
export {
  loginWithSupabase as login,
  getUsers,
  createUser,
  updateUserStatus,
  updateUserPassword
} from './supabase/auth';

// Event services
export {
  delay,
  getEvents,
  getEvent,
  createEvent,
  updateEventStatus
} from './supabase/events';

// Product Type services
export {
  getAllProductTypes,
  getBaseProductType,
  createBaseProductType,
  updateBaseProductType,
  deleteProductType,
  getProductTypes,
  createProductType
} from './supabase/productTypes';

// Sample services - keeping mock for now, will implement next
export {
  getSamples,
  createSample,
  updateSampleImages
} from './api/samples';

// JAR Attribute services - keeping mock for now, will implement next
export {
  getJARAttributes,
  createJARAttribute
} from './api/jarAttributes';

// Randomization services - keeping mock for now, will implement next
export {
  getRandomization,
  createRandomization,
  getNextSample
} from './api/randomization';

// Evaluation services - keeping mock for now, will implement next
export {
  getCompletedEvaluations,
  submitEvaluation,
  getEvaluationsStatus
} from './api/evaluations';

// Reporting services - keeping mock for now, will implement next
export {
  generateHedonicReport,
  generateJARReport,
  getRawData
} from './api/reports';
