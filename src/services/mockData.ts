import { 
  User, UserRole, Event, EventStatus, ProductType, 
  Sample, JARAttribute, Randomization, RetailerCode, Evaluation, BaseProductType
} from "../types";

// Mock users
export const users: User[] = [
  {
    id: "admin1",
    username: "admin",
    role: UserRole.ADMIN,
    isActive: true
  },
  ...Array.from({ length: 12 }).map((_, i) => ({
    id: `evaluator${i + 1}`,
    username: `evaluator${i + 1}`,
    role: UserRole.EVALUATOR,
    evaluatorPosition: i + 1,
    isActive: true
  }))
];

// Mock events
export const events: Event[] = [
  {
    id: "event1",
    date: "2025-04-20",
    status: EventStatus.PREPARATION,
    productTypes: [],
    createdAt: "2025-04-10T10:00:00Z",
    randomizationComplete: false
  },
  {
    id: "event2",
    date: "2025-04-15",
    status: EventStatus.ACTIVE,
    productTypes: [],
    createdAt: "2025-04-08T14:30:00Z",
    randomizationComplete: true
  }
];

// Base Product Types (central repository)
export const baseProductTypes: BaseProductType[] = [
  {
    id: "base_product_1",
    productName: "Pršut",
    jarAttributes: [
      {
        id: "attr_base_1_1",
        productTypeId: "base_product_1",
        nameHR: "Slanost",
        nameEN: "Saltiness",
        scaleHR: ["Premalo slano", "Malo slano", "Baš kako treba", "Dosta slano", "Previše slano"] as [string, string, string, string, string],
        scaleEN: ["Not salty enough", "Slightly not salty enough", "Just About Right", "Slightly too salty", "Too salty"] as [string, string, string, string, string]
      },
      {
        id: "attr_base_1_2",
        productTypeId: "base_product_1",
        nameHR: "Tvrdoća",
        nameEN: "Hardness",
        scaleHR: ["Premekano", "Malo mekano", "Baš kako treba", "Malo tvrdo", "Pretvrdo"] as [string, string, string, string, string],
        scaleEN: ["Too soft", "Slightly too soft", "Just About Right", "Slightly too hard", "Too hard"] as [string, string, string, string, string]
      },
      {
        id: "attr_base_1_3",
        productTypeId: "base_product_1",
        nameHR: "Sočnost",
        nameEN: "Juiciness",
        scaleHR: ["Nedovoljno sočno", "Malo premalo sočno", "Baš kako treba", "Malo previše sočno", "Previše sočno"] as [string, string, string, string, string],
        scaleEN: ["Not juicy enough", "Slightly not juicy enough", "Just About Right", "Slightly too juicy", "Too juicy"] as [string, string, string, string, string]
      },
      {
        id: "attr_base_1_4",
        productTypeId: "base_product_1",
        nameHR: "Začinjenost",
        nameEN: "Spiciness",
        scaleHR: ["Premalo začinjeno", "Malo premalo začinjeno", "Baš kako treba", "Malo previše začinjeno", "Previše začinjeno"] as [string, string, string, string, string],
        scaleEN: ["Not spicy enough", "Slightly not spicy enough", "Just About Right", "Slightly too spicy", "Too spicy"] as [string, string, string, string, string]
      }
    ],
    createdAt: "2024-12-01T10:00:00.000Z"
  },
  {
    id: "base_product_2",
    productName: "Sir",
    jarAttributes: [
      {
        id: "attr_base_2_1",
        productTypeId: "base_product_2",
        nameHR: "Slanost",
        nameEN: "Saltiness",
        scaleHR: ["Premalo slano", "Malo slano", "Baš kako treba", "Dosta slano", "Previše slano"] as [string, string, string, string, string],
        scaleEN: ["Not salty enough", "Slightly not salty enough", "Just About Right", "Slightly too salty", "Too salty"] as [string, string, string, string, string]
      },
      {
        id: "attr_base_2_2",
        productTypeId: "base_product_2",
        nameHR: "Kiselost",
        nameEN: "Sourness",
        scaleHR: ["Nedovoljno kiselo", "Malo premalo kiselo", "Baš kako treba", "Malo previše kiselo", "Previše kiselo"] as [string, string, string, string, string],
        scaleEN: ["Not sour enough", "Slightly not sour enough", "Just About Right", "Slightly too sour", "Too sour"] as [string, string, string, string, string]
      },
      {
        id: "attr_base_2_3",
        productTypeId: "base_product_2",
        nameHR: "Kremastost",
        nameEN: "Creaminess",
        scaleHR: ["Nedovoljno kremasto", "Malo premalo kremasto", "Baš kako treba", "Malo previše kremasto", "Previše kremasto"] as [string, string, string, string, string],
        scaleEN: ["Not creamy enough", "Slightly not creamy enough", "Just About Right", "Slightly too creamy", "Too creamy"] as [string, string, string, string, string]
      },
      {
        id: "attr_base_2_4",
        productTypeId: "base_product_2",
        nameHR: "Intenzitet arome",
        nameEN: "Flavor intensity",
        scaleHR: ["Preslaba aroma", "Malo preslaba aroma", "Baš kako treba", "Malo prejaka aroma", "Prejaka aroma"] as [string, string, string, string, string],
        scaleEN: ["Too weak flavor", "Slightly too weak flavor", "Just About Right", "Slightly too strong flavor", "Too strong flavor"] as [string, string, string, string, string]
      }
    ],
    createdAt: "2024-12-02T11:30:00.000Z"
  }
];

// Mock product types
export const productTypes: ProductType[] = [
  {
    id: "product1",
    eventId: "event2",
    customerCode: "4581",
    productName: "Dimljeni vrat",
    baseCode: "D",
    samples: [],
    jarAttributes: [],
    displayOrder: 1
  }
];

// Mock samples
export const samples: Sample[] = [
  {
    id: "sample1",
    productTypeId: "product1",
    brand: "Gavrilović",
    retailerCode: RetailerCode.LI,
    images: {
      prepared: "https://images.unsplash.com/photo-1504674900247-0877df9cc836",
      packaging: "https://images.unsplash.com/photo-1600628421055-4d30de868b8f",
      details: [
        "https://images.unsplash.com/photo-1512621776951-a57141f2eefd",
        "https://images.unsplash.com/photo-1602030638412-bb8dcc0bc8b0"
      ]
    },
    blindCode: "D1"
  },
  {
    id: "sample2",
    productTypeId: "product1",
    brand: "Belje",
    retailerCode: RetailerCode.KL,
    images: {
      prepared: "https://images.unsplash.com/photo-1547050605-2f268cd5daf0",
      packaging: "https://images.unsplash.com/photo-1563379926898-05f4575a45d8",
      details: [
        "https://images.unsplash.com/photo-1565299543923-37dd37887442"
      ]
    },
    blindCode: "D2"
  },
  {
    id: "sample3",
    productTypeId: "product1",
    brand: "PIK",
    retailerCode: RetailerCode.KO,
    images: {
      prepared: "https://images.unsplash.com/photo-1618229063345-e6e043bb2d99",
      packaging: "https://images.unsplash.com/photo-1621939514649-280e2ee25f60",
      details: [
        "https://images.unsplash.com/photo-1551782450-a2132b4ba21d"
      ]
    },
    blindCode: "D3"
  }
];

// Mock JAR attributes
export const jarAttributes: JARAttribute[] = [
  {
    id: "attr1",
    productTypeId: "product1",
    nameHR: "Intenzitet mirisa dima",
    nameEN: "Smoke Aroma Intensity",
    scaleHR: ["Puno preslab", "Preslab", "Baš kako treba", "Prejak", "Puno prejak"] as [string, string, string, string, string],
    scaleEN: ["Much too weak", "Too weak", "Just About Right", "Too strong", "Much too strong"] as [string, string, string, string, string]
  },
  {
    id: "attr2",
    productTypeId: "product1",
    nameHR: "Slanost",
    nameEN: "Saltiness",
    scaleHR: ["Puno preslano", "Preslano", "Baš kako treba", "Preslano", "Puno preslano"] as [string, string, string, string, string],
    scaleEN: ["Much too low", "Too low", "Just About Right", "Too high", "Much too high"] as [string, string, string, string, string]
  },
  {
    id: "attr3",
    productTypeId: "product1",
    nameHR: "Sočnost",
    nameEN: "Juiciness",
    scaleHR: ["Puno presuho", "Presuho", "Baš kako treba", "Presočno", "Puno presočno"] as [string, string, string, string, string],
    scaleEN: ["Much too dry", "Too dry", "Just About Right", "Too juicy", "Much too juicy"] as [string, string, string, string, string]
  },
  {
    id: "attr4",
    productTypeId: "product1",
    nameHR: "Tvrdoća",
    nameEN: "Hardness",
    scaleHR: ["Puno premekano", "Premekano", "Baš kako treba", "Pretvrdo", "Puno pretvrdo"] as [string, string, string, string, string],
    scaleEN: ["Much too soft", "Too soft", "Just About Right", "Too hard", "Much too hard"] as [string, string, string, string, string]
  }
];

// Mock randomization
export const randomizations: Randomization[] = [
  {
    id: "random1",
    productTypeId: "product1",
    table: {
      1: { 1: "D1", 2: "D3", 3: "D2" },
      2: { 1: "D2", 2: "D1", 3: "D3" },
      3: { 1: "D3", 2: "D2", 3: "D1" },
      4: { 1: "D1", 2: "D2", 3: "D3" },
      5: { 1: "D2", 2: "D3", 3: "D1" },
      6: { 1: "D3", 2: "D1", 3: "D2" },
      7: { 1: "D1", 2: "D3", 3: "D2" },
      8: { 1: "D2", 2: "D1", 3: "D3" },
      9: { 1: "D3", 2: "D2", 3: "D1" },
      10: { 1: "D1", 2: "D2", 3: "D3" },
      11: { 1: "D2", 2: "D3", 3: "D1" },
      12: { 1: "D3", 2: "D1", 3: "D2" }
    }
  }
];

// Mock evaluations
export const evaluations: Evaluation[] = [];

// Initialize data relationships
productTypes[0].samples = samples;
productTypes[0].jarAttributes = jarAttributes;
events[1].productTypes = productTypes;

// Randomization Table Generator
export function generateRandomizationTable(productTypeId: string, sampleCount: number): Randomization {
  // Create a randomization table for up to 12 evaluators
  const table: { [position: number]: { [round: number]: string } } = {};
  
  // For each position (1-12)
  for (let position = 1; position <= 12; position++) {
    table[position] = {};
    
    // Create an array of blind codes (e.g., A1, A2, etc.)
    const productType = productTypes.find(pt => pt.id === productTypeId);
    if (!productType) continue;
    
    const baseCode = productType?.baseCode || "X";
    
    // Create an array of sample indices (0, 1, 2, ...) to shuffle
    const sampleIndices = Array.from({ length: sampleCount }, (_, i) => i);
    
    // For the first distribution (round 1), ensure it doesn't start with "1"
    // by swapping the first element if it's 0 (which would become sampleIndex+1 = 1)
    const shuffledIndices = shuffle([...sampleIndices]);
    
    // Make sure the first position doesn't have sample 1 for the first round
    if (shuffledIndices[0] === 0 && sampleCount > 1) {
      const randomSwap = 1 + Math.floor(Math.random() * (shuffledIndices.length - 1));
      [shuffledIndices[0], shuffledIndices[randomSwap]] = [shuffledIndices[randomSwap], shuffledIndices[0]];
    }
    
    // Assign blind codes to each round
    shuffledIndices.forEach((sampleIndex, roundIndex) => {
      const round = roundIndex + 1;
      table[position][round] = `${baseCode}${sampleIndex + 1}`;
    });
  }
  
  const randomizationId = `rand_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  
  return {
    id: randomizationId,
    productTypeId,
    table
  };
}

// Fisher-Yates shuffle algorithm
function shuffle(array: any[]): any[] {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

// Helper function to get next sample for an evaluator
export function getNextSample(
  userId: string, 
  eventId: string, 
  productTypeId?: string, 
  completed: string[] = []
): { sample: Sample | null, round: number, isComplete: boolean } {
  const user = users.find(u => u.id === userId);
  if (!user || user.role !== UserRole.EVALUATOR || !user.evaluatorPosition) {
    return { sample: null, round: 0, isComplete: true };
  }
  
  const position = user.evaluatorPosition;
  
  // If no product type specified, get the first one from the event
  if (!productTypeId) {
    const event = events.find(e => e.id === eventId);
    if (!event || event.productTypes.length === 0) {
      return { sample: null, round: 0, isComplete: true };
    }
    productTypeId = event.productTypes[0].id;
  }
  
  // Get randomization table for this product
  const randomization = randomizations.find(r => r.productTypeId === productTypeId);
  if (!randomization) {
    return { sample: null, round: 0, isComplete: true };
  }
  
  // Get the position table
  const positionTable = randomization.table[position];
  if (!positionTable) {
    return { sample: null, round: 0, isComplete: true };
  }
  
  // Find the next round that hasn't been completed
  const rounds = Object.keys(positionTable).map(Number).sort((a, b) => a - b);
  
  for (const round of rounds) {
    const blindCode = positionTable[round];
    const sample = samples.find(s => s.blindCode === blindCode && s.productTypeId === productTypeId);
    
    if (sample && !completed.includes(sample.id)) {
      return { sample, round, isComplete: false };
    }
  }
  
  // All rounds completed
  return { sample: null, round: 0, isComplete: true };
}
