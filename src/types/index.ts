
export enum UserRole {
  ADMIN = "admin",
  EVALUATOR = "evaluator"
}

export enum EventStatus {
  PREPARATION = "preparation",
  ACTIVE = "active",
  COMPLETED = "completed",
  ARCHIVED = "archived"
}

export enum RetailerCode {
  LI = "LI",
  KL = "KL",
  KO = "KO",
  IS = "IS",
  PL = "PL",
  ES = "ES",
  M = "M"
}

export type User = {
  id: string;
  username: string;
  role: UserRole;
  evaluatorPosition?: number; // 1-12, only for evaluators
  isActive: boolean;
};

export type Event = {
  id: string;
  date: string;
  status: EventStatus;
  productTypes: ProductType[];
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

export type HedonicReport = {
  [sampleId: string]: {
    brand: string;
    retailerCode: RetailerCode;
    blindCode: string;
    hedonic: {
      appearance: number;
      odor: number;
      texture: number;
      flavor: number;
      overallLiking: number;
    };
  };
};

export type JARReport = {
  [attributeId: string]: {
    nameEN: string;
    nameHR: string;
    scaleEN: [string, string, string, string, string];
    scaleHR: [string, string, string, string, string];
    results: {
      [sampleId: string]: {
        brand: string;
        retailerCode: RetailerCode;
        blindCode: string;
        frequencies: [number, number, number, number, number]; // Count of ratings 1-5
      };
    };
  };
};
