
export enum UserRole {
  ADMIN = "ADMIN",
  EVALUATOR = "EVALUATOR"
}

export enum EventStatus {
  PREPARATION = "PREPARATION",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  ARCHIVED = "ARCHIVED"
}

export enum RetailerCode {
  LI = "LI",
  KL = "KL",
  KO = "KO",
  IS = "IS",
  PL = "PL",
  ES = "ES",
  M = "M",
  MI = "MI",
  TO = "TO",
  DU = "DU",
  VI = "VI",
  ME = "ME"
}

export type User = {
  id: string;
  username: string;
  role: UserRole;
  evaluatorPosition?: number; // 1-12, only for evaluators
  isActive: boolean;
  password: string;
};

export type Event = {
  id: string;
  date: string;
  status: EventStatus;
  productTypes: ProductType[];
  productTypesCount?: number; // Add optional count field
  createdAt: string;
  randomizationComplete: boolean;
};

export type ProductType = {
  id: string;
  eventId: string;
  customerCode: string; // 4-digit code
  productName: string;
  baseCode: string; // Single capital letter (A-Z)
  samples: Sample[];
  jarAttributes: JARAttribute[];
  displayOrder: number; // For ordering within an event
  baseProductTypeId?: string; // Reference to the base product type
  hasRandomization?: boolean; // Flag to indicate if randomization has been generated
};

export type BaseProductType = {
  id: string;
  productName: string; // General product type name (e.g., "Buđola", "Sir", "Čokolada")
  jarAttributes: JARAttribute[];
  createdAt: string;
};

export type Sample = {
  id: string;
  productTypeId: string;
  brand: string; // Manufacturer/brand name
  retailerCode: RetailerCode;
  images: {
    prepared?: string; // URL to prepared sample image
    packaging?: string; // URL to packaging image
    details: string[]; // URLs to detail images (1-3)
  };
  blindCode?: string; // e.g., "D1", "D2" - assigned during randomization
};

export type JARAttribute = {
  id: string;
  productTypeId: string;
  nameHR: string;
  nameEN: string;
  scaleHR: [string, string, string, string, string]; // 5 descriptions in Croatian
  scaleEN: [string, string, string, string, string]; // 5 descriptions in English
};

export type Randomization = {
  id: string;
  productTypeId: string;
  table: {
    [position: number]: { // Evaluator position (1-12)
      [round: number]: string; // Sample blind code for each round
    };
  };
  createdAt?: string;
};

export type HedonicScale = {
  appearance: number; // 1-9
  odor: number; // 1-9
  texture: number; // 1-9
  flavor: number; // 1-9
  overallLiking: number; // 1-9
};

export type JARRating = {
  [attributeId: string]: number; // 1-5 for each attribute
};

export type Evaluation = {
  id: string;
  userId: string;
  sampleId: string;
  productTypeId: string;
  eventId: string;
  hedonic: HedonicScale;
  jar: JARRating;
  timestamp: string;
};

export type EvaluationSubmission = {
  userId: string;
  sampleId: string;
  productTypeId: string;
  eventId: string;
  hedonicRatings: HedonicScale;
  jarRatings: JARRating;
};

// Updated HedonicReport to match Supabase structure
export type HedonicReport = {
  [sampleId: string]: {
    sampleId: string;
    brand: string;
    blindCode: string;
    retailerCode: RetailerCode; // Added missing retailerCode
    appearance: { ratings: number[]; mean: number };
    odor: { ratings: number[]; mean: number };
    texture: { ratings: number[]; mean: number };
    flavor: { ratings: number[]; mean: number };
    overallLiking: { ratings: number[]; mean: number };
  };
};

export type JARReport = {
  [attributeId: string]: {
    attributeId: string;
    nameEN: string;
    nameHR: string;
    scaleEN: [string, string, string, string, string];
    scaleHR: [string, string, string, string, string];
    samples: {
      [sampleId: string]: {
        sampleId: string;
        brand: string;
        blindCode: string;
        retailerCode: RetailerCode; // Added missing retailerCode
        ratings: number[];
        distribution: [number, number, number, number, number]; // Count of ratings 1-5
        mean: number;
      };
    };
  };
};

export type EvaluationStatus = {
  userId: string;
  username: string;
  position: number;
  completedSamples: {
    productTypeName: string;
    productTypeId: string;
    samples: {
      sampleId: string;
      blindCode: string;
      isCompleted: boolean;
    }[];
  }[];
  totalCompleted: number;
  totalSamples: number;
};
