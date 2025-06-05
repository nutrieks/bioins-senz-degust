
// This is the main entry point for data services
// All services now use Supabase exclusively

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
  createProductType,
  deleteEventProductType,
  updateEventProductType
} from './supabase/productTypes';

// Sample services
export {
  getSamples,
  createSample,
  updateSampleImages
} from './supabase/samples';

// JAR Attribute services - now using Supabase
export {
  getJARAttributes,
  createJARAttribute
} from './supabase/jarAttributes';

// Randomization services - now using Supabase
export {
  getRandomization,
  createRandomization,
  getNextSample
} from './supabase/randomization';

// Evaluation services - now using Supabase
export {
  getCompletedEvaluations,
  submitEvaluation,
  getEvaluationsStatus
} from './supabase/evaluations';

// Reporting services - now using Supabase
export {
  generateHedonicReport,
  generateJARReport,
  getRawData
} from './supabase/reports';
