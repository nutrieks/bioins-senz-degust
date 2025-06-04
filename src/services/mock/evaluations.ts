import { Evaluation } from "@/types";

export const evaluations: Evaluation[] = [
  // Evaluation 1
  {
    id: "eval1",
    userId: "evaluator1",
    sampleId: "sample1",
    productTypeId: "product1",
    eventId: "event2",
    hedonic: {
      appearance: 8,
      odor: 7,
      texture: 8,
      flavor: 9,
      overallLiking: 8
    },
    jar: {
      "attr1": 3, // Just About Right
      "attr2": 4, // Slightly too salty
      "attr3": 2, // Slightly too dry
      "attr4": 3  // Just About Right
    },
    timestamp: "2025-04-15T10:00:00Z"
  },
  // Evaluation 2
  {
    id: "eval2",
    userId: "evaluator2",
    sampleId: "sample1",
    productTypeId: "product1",
    eventId: "event2",
    hedonic: {
      appearance: 7,
      odor: 8,
      texture: 7,
      flavor: 8,
      overallLiking: 7
    },
    jar: {
      "attr1": 4,
      "attr2": 3,
      "attr3": 3,
      "attr4": 2
    },
    timestamp: "2025-04-15T10:15:00Z"
  },
  // Evaluation 3
  {
    id: "eval3",
    userId: "evaluator3",
    sampleId: "sample2",
    productTypeId: "product1",
    eventId: "event2",
    hedonic: {
      appearance: 6,
      odor: 7,
      texture: 8,
      flavor: 7,
      overallLiking: 7
    },
    jar: {
      "attr1": 2,
      "attr2": 3,
      "attr3": 4,
      "attr4": 3
    },
    timestamp: "2025-04-15T10:30:00Z"
  },
  // Evaluation 4
  {
    id: "eval4",
    userId: "evaluator4",
    sampleId: "sample2",
    productTypeId: "product1",
    eventId: "event2",
    hedonic: {
      appearance: 8,
      odor: 8,
      texture: 7,
      flavor: 8,
      overallLiking: 8
    },
    jar: {
      "attr1": 3,
      "attr2": 3,
      "attr3": 3,
      "attr4": 4
    },
    timestamp: "2025-04-15T10:45:00Z"
  },
  // Evaluation 5
  {
    id: "eval5",
    userId: "evaluator5",
    sampleId: "sample3",
    productTypeId: "product1",
    eventId: "event2",
    hedonic: {
      appearance: 9,
      odor: 8,
      texture: 9,
      flavor: 8,
      overallLiking: 9
    },
    jar: {
      "attr1": 3,
      "attr2": 2,
      "attr3": 3,
      "attr4": 3
    },
    timestamp: "2025-04-15T11:00:00Z"
  },
  // Evaluation 6
  {
    id: "eval6",
    userId: "evaluator6",
    sampleId: "sample3",
    productTypeId: "product1",
    eventId: "event2",
    hedonic: {
      appearance: 8,
      odor: 9,
      texture: 8,
      flavor: 9,
      overallLiking: 8
    },
    jar: {
      "attr1": 3,
      "attr2": 3,
      "attr3": 2,
      "attr4": 3
    },
    timestamp: "2025-04-15T11:15:00Z"
  },
  // ADDITIONAL EVALUATIONS FOR EVENT2 to have more data for JAR charts
  // More evaluators for sample1 (LI Jamnica)
  {
    id: "eval19",
    userId: "evaluator7",
    sampleId: "sample1",
    productTypeId: "product1",
    eventId: "event2",
    hedonic: {
      appearance: 8,
      odor: 7,
      texture: 7,
      flavor: 8,
      overallLiking: 7
    },
    jar: {
      "attr1": 3, // Just About Right
      "attr2": 4, // Too salty
      "attr3": 3, // Just About Right
      "attr4": 3  // Just About Right
    },
    timestamp: "2025-04-15T11:30:00Z"
  },
  {
    id: "eval20",
    userId: "evaluator8",
    sampleId: "sample1",
    productTypeId: "product1",
    eventId: "event2",
    hedonic: {
      appearance: 7,
      odor: 8,
      texture: 8,
      flavor: 7,
      overallLiking: 7
    },
    jar: {
      "attr1": 2, // Too weak
      "attr2": 3, // Just About Right
      "attr3": 4, // Too dry
      "attr4": 2  // Too weak
    },
    timestamp: "2025-04-15T11:45:00Z"
  },
  {
    id: "eval21",
    userId: "evaluator9",
    sampleId: "sample1",
    productTypeId: "product1",
    eventId: "event2",
    hedonic: {
      appearance: 9,
      odor: 8,
      texture: 8,
      flavor: 9,
      overallLiking: 8
    },
    jar: {
      "attr1": 3, // Just About Right
      "attr2": 2, // Too weak
      "attr3": 3, // Just About Right
      "attr4": 4  // Too strong
    },
    timestamp: "2025-04-15T12:00:00Z"
  },
  {
    id: "eval22",
    userId: "evaluator10",
    sampleId: "sample1",
    productTypeId: "product1",
    eventId: "event2",
    hedonic: {
      appearance: 8,
      odor: 7,
      texture: 9,
      flavor: 8,
      overallLiking: 8
    },
    jar: {
      "attr1": 4, // Too strong
      "attr2": 3, // Just About Right
      "attr3": 2, // Too wet
      "attr4": 3  // Just About Right
    },
    timestamp: "2025-04-15T12:15:00Z"
  },
  // More evaluators for sample2 (KL Kraš)
  {
    id: "eval23",
    userId: "evaluator7",
    sampleId: "sample2",
    productTypeId: "product1",
    eventId: "event2",
    hedonic: {
      appearance: 7,
      odor: 7,
      texture: 8,
      flavor: 7,
      overallLiking: 7
    },
    jar: {
      "attr1": 3, // Just About Right
      "attr2": 4, // Too salty
      "attr3": 3, // Just About Right
      "attr4": 2  // Too weak
    },
    timestamp: "2025-04-15T12:30:00Z"
  },
  {
    id: "eval24",
    userId: "evaluator8",
    sampleId: "sample2",
    productTypeId: "product1",
    eventId: "event2",
    hedonic: {
      appearance: 8,
      odor: 8,
      texture: 7,
      flavor: 8,
      overallLiking: 8
    },
    jar: {
      "attr1": 2, // Too weak
      "attr2": 3, // Just About Right
      "attr3": 4, // Too dry
      "attr4": 3  // Just About Right
    },
    timestamp: "2025-04-15T12:45:00Z"
  },
  {
    id: "eval25",
    userId: "evaluator9",
    sampleId: "sample2",
    productTypeId: "product1",
    eventId: "event2",
    hedonic: {
      appearance: 6,
      odor: 7,
      texture: 6,
      flavor: 7,
      overallLiking: 6
    },
    jar: {
      "attr1": 1, // Much too weak
      "attr2": 4, // Too salty
      "attr3": 5, // Much too dry
      "attr4": 2  // Too weak
    },
    timestamp: "2025-04-15T13:00:00Z"
  },
  {
    id: "eval26",
    userId: "evaluator10",
    sampleId: "sample2",
    productTypeId: "product1",
    eventId: "event2",
    hedonic: {
      appearance: 7,
      odor: 6,
      texture: 7,
      flavor: 6,
      overallLiking: 7
    },
    jar: {
      "attr1": 3, // Just About Right
      "attr2": 5, // Much too salty
      "attr3": 3, // Just About Right
      "attr4": 4  // Too strong
    },
    timestamp: "2025-04-15T13:15:00Z"
  },
  // More evaluators for sample3 (KO Podravka)
  {
    id: "eval27",
    userId: "evaluator7",
    sampleId: "sample3",
    productTypeId: "product1",
    eventId: "event2",
    hedonic: {
      appearance: 9,
      odor: 9,
      texture: 9,
      flavor: 9,
      overallLiking: 9
    },
    jar: {
      "attr1": 3, // Just About Right
      "attr2": 3, // Just About Right
      "attr3": 3, // Just About Right
      "attr4": 3  // Just About Right
    },
    timestamp: "2025-04-15T13:30:00Z"
  },
  {
    id: "eval28",
    userId: "evaluator8",
    sampleId: "sample3",
    productTypeId: "product1",
    eventId: "event2",
    hedonic: {
      appearance: 8,
      odor: 8,
      texture: 8,
      flavor: 8,
      overallLiking: 8
    },
    jar: {
      "attr1": 4, // Too strong
      "attr2": 2, // Too weak
      "attr3": 2, // Too wet
      "attr4": 4  // Too strong
    },
    timestamp: "2025-04-15T13:45:00Z"
  },
  {
    id: "eval29",
    userId: "evaluator9",
    sampleId: "sample3",
    productTypeId: "product1",
    eventId: "event2",
    hedonic: {
      appearance: 9,
      odor: 8,
      texture: 9,
      flavor: 8,
      overallLiking: 9
    },
    jar: {
      "attr1": 3, // Just About Right
      "attr2": 3, // Just About Right
      "attr3": 3, // Just About Right
      "attr4": 2  // Too weak
    },
    timestamp: "2025-04-15T14:00:00Z"
  },
  {
    id: "eval30",
    userId: "evaluator10",
    sampleId: "sample3",
    productTypeId: "product1",
    eventId: "event2",
    hedonic: {
      appearance: 8,
      odor: 9,
      texture: 8,
      flavor: 9,
      overallLiking: 8
    },
    jar: {
      "attr1": 2, // Too weak
      "attr2": 4, // Too salty
      "attr3": 4, // Too dry
      "attr4": 3  // Just About Right
    },
    timestamp: "2025-04-15T14:15:00Z"
  },
  // NEW CHOCOLATE EVALUATIONS FOR EVENT3
  // Milka evaluations (4 evaluators x 3 samples = 12 evaluations)
  {
    id: "eval7",
    userId: "evaluator1",
    sampleId: "sample4",
    productTypeId: "product2",
    eventId: "event3",
    hedonic: {
      appearance: 8,
      odor: 7,
      texture: 8,
      flavor: 9,
      overallLiking: 8
    },
    jar: {
      "attr5": 4, // Too sweet
      "attr6": 2, // Too mild
      "attr7": 3  // Just right
    },
    timestamp: "2025-05-01T10:00:00Z"
  },
  {
    id: "eval8",
    userId: "evaluator2",
    sampleId: "sample4",
    productTypeId: "product2",
    eventId: "event3",
    hedonic: {
      appearance: 7,
      odor: 8,
      texture: 7,
      flavor: 8,
      overallLiking: 7
    },
    jar: {
      "attr5": 4, // Too sweet
      "attr6": 3, // Just right
      "attr7": 4  // Too hard
    },
    timestamp: "2025-05-01T10:15:00Z"
  },
  {
    id: "eval9",
    userId: "evaluator3",
    sampleId: "sample4",
    productTypeId: "product2",
    eventId: "event3",
    hedonic: {
      appearance: 9,
      odor: 8,
      texture: 8,
      flavor: 9,
      overallLiking: 9
    },
    jar: {
      "attr5": 3, // Just right
      "attr6": 2, // Too mild
      "attr7": 3  // Just right
    },
    timestamp: "2025-05-01T10:30:00Z"
  },
  {
    id: "eval10",
    userId: "evaluator4",
    sampleId: "sample4",
    productTypeId: "product2",
    eventId: "event3",
    hedonic: {
      appearance: 8,
      odor: 7,
      texture: 8,
      flavor: 8,
      overallLiking: 8
    },
    jar: {
      "attr5": 4, // Too sweet
      "attr6": 3, // Just right
      "attr7": 3  // Just right
    },
    timestamp: "2025-05-01T10:45:00Z"
  },
  // Lindt evaluations
  {
    id: "eval11",
    userId: "evaluator1",
    sampleId: "sample5",
    productTypeId: "product2",
    eventId: "event3",
    hedonic: {
      appearance: 9,
      odor: 9,
      texture: 8,
      flavor: 9,
      overallLiking: 9
    },
    jar: {
      "attr5": 2, // Too weak
      "attr6": 4, // Too bitter
      "attr7": 4  // Too hard
    },
    timestamp: "2025-05-01T11:00:00Z"
  },
  {
    id: "eval12",
    userId: "evaluator2",
    sampleId: "sample5",
    productTypeId: "product2",
    eventId: "event3",
    hedonic: {
      appearance: 8,
      odor: 8,
      texture: 9,
      flavor: 8,
      overallLiking: 8
    },
    jar: {
      "attr5": 3, // Just right
      "attr6": 3, // Just right
      "attr7": 3  // Just right
    },
    timestamp: "2025-05-01T11:15:00Z"
  },
  {
    id: "eval13",
    userId: "evaluator3",
    sampleId: "sample5",
    productTypeId: "product2",
    eventId: "event3",
    hedonic: {
      appearance: 9,
      odor: 9,
      texture: 9,
      flavor: 9,
      overallLiking: 9
    },
    jar: {
      "attr5": 3, // Just right
      "attr6": 3, // Just right
      "attr7": 3  // Just right
    },
    timestamp: "2025-05-01T11:30:00Z"
  },
  {
    id: "eval14",
    userId: "evaluator4",
    sampleId: "sample5",
    productTypeId: "product2",
    eventId: "event3",
    hedonic: {
      appearance: 8,
      odor: 8,
      texture: 8,
      flavor: 8,
      overallLiking: 8
    },
    jar: {
      "attr5": 1, // Much too weak
      "attr6": 4, // Too bitter
      "attr7": 3  // Just right
    },
    timestamp: "2025-05-01T11:45:00Z"
  },
  // Toblerone evaluations
  {
    id: "eval15",
    userId: "evaluator1",
    sampleId: "sample6",
    productTypeId: "product2",
    eventId: "event3",
    hedonic: {
      appearance: 8,
      odor: 7,
      texture: 7,
      flavor: 8,
      overallLiking: 8
    },
    jar: {
      "attr5": 3, // Just right
      "attr6": 3, // Just right
      "attr7": 2  // Too soft
    },
    timestamp: "2025-05-01T12:00:00Z"
  },
  {
    id: "eval16",
    userId: "evaluator2",
    sampleId: "sample6",
    productTypeId: "product2",
    eventId: "event3",
    hedonic: {
      appearance: 7,
      odor: 8,
      texture: 6,
      flavor: 7,
      overallLiking: 7
    },
    jar: {
      "attr5": 3, // Just right
      "attr6": 4, // Too bitter
      "attr7": 4  // Too hard
    },
    timestamp: "2025-05-01T12:15:00Z"
  },
  {
    id: "eval17",
    userId: "evaluator3",
    sampleId: "sample6",
    productTypeId: "product2",
    eventId: "event3",
    hedonic: {
      appearance: 8,
      odor: 8,
      texture: 7,
      flavor: 8,
      overallLiking: 8
    },
    jar: {
      "attr5": 3, // Just right
      "attr6": 3, // Just right
      "attr7": 3  // Just right
    },
    timestamp: "2025-05-01T12:30:00Z"
  },
  {
    id: "eval18",
    userId: "evaluator4",
    sampleId: "sample6",
    productTypeId: "product2",
    eventId: "event3",
    hedonic: {
      appearance: 9,
      odor: 8,
      texture: 8,
      flavor: 9,
      overallLiking: 9
    },
    jar: {
      "attr5": 3, // Just right
      "attr6": 1, // Much too mild
      "attr7": 3  // Just right
    },
    timestamp: "2025-05-01T12:45:00Z"
  },
  // NEW YOGURT EVALUATIONS FOR EVENT4 - 12 evaluators x 3 samples = 36 evaluations
  // Sample 7 (Dukat) - 12 evaluators
  {
    id: "eval31",
    userId: "evaluator1",
    sampleId: "sample7",
    productTypeId: "product3",
    eventId: "event4",
    hedonic: {
      appearance: 8,
      odor: 7,
      texture: 8,
      flavor: 8,
      overallLiking: 8
    },
    jar: {
      "attr9": 3,  // Sweetness - Just right
      "attr10": 4, // Tartness - Too tart  
      "attr11": 3, // Thickness - Just right
      "attr12": 2  // Fruit flavor - Too weak
    },
    timestamp: "2025-06-01T10:00:00Z"
  },
  {
    id: "eval32",
    userId: "evaluator2", 
    sampleId: "sample7",
    productTypeId: "product3",
    eventId: "event4",
    hedonic: {
      appearance: 7,
      odor: 8,
      texture: 7,
      flavor: 7,
      overallLiking: 7
    },
    jar: {
      "attr9": 4,  // Sweetness - Too sweet
      "attr10": 3, // Tartness - Just right
      "attr11": 2, // Thickness - Too thin
      "attr12": 3  // Fruit flavor - Just right
    },
    timestamp: "2025-06-01T10:15:00Z"
  },
  {
    id: "eval33",
    userId: "evaluator3",
    sampleId: "sample7", 
    productTypeId: "product3",
    eventId: "event4",
    hedonic: {
      appearance: 9,
      odor: 8,
      texture: 8,
      flavor: 8,
      overallLiking: 8
    },
    jar: {
      "attr9": 3,  // Sweetness - Just right
      "attr10": 3, // Tartness - Just right  
      "attr11": 4, // Thickness - Too thick
      "attr12": 4  // Fruit flavor - Too strong
    },
    timestamp: "2025-06-01T10:30:00Z"
  },
  {
    id: "eval34",
    userId: "evaluator4",
    sampleId: "sample7",
    productTypeId: "product3", 
    eventId: "event4",
    hedonic: {
      appearance: 8,
      odor: 7,
      texture: 8,
      flavor: 9,
      overallLiking: 8
    },
    jar: {
      "attr9": 3,  // Sweetness - Just right
      "attr10": 2, // Tartness - Too weak
      "attr11": 3, // Thickness - Just right
      "attr12": 3  // Fruit flavor - Just right
    },
    timestamp: "2025-06-01T10:45:00Z"
  },
  {
    id: "eval35",
    userId: "evaluator5",
    sampleId: "sample7",
    productTypeId: "product3",
    eventId: "event4", 
    hedonic: {
      appearance: 7,
      odor: 8,
      texture: 7,
      flavor: 7,
      overallLiking: 7
    },
    jar: {
      "attr9": 2,  // Sweetness - Too weak
      "attr10": 3, // Tartness - Just right
      "attr11": 3, // Thickness - Just right
      "attr12": 2  // Fruit flavor - Too weak
    },
    timestamp: "2025-06-01T11:00:00Z"
  },
  {
    id: "eval36", 
    userId: "evaluator6",
    sampleId: "sample7",
    productTypeId: "product3",
    eventId: "event4",
    hedonic: {
      appearance: 8,
      odor: 9,
      texture: 8,
      flavor: 8,
      overallLiking: 8
    },
    jar: {
      "attr9": 3,  // Sweetness - Just right
      "attr10": 4, // Tartness - Too tart
      "attr11": 4, // Thickness - Too thick
      "attr12": 3  // Fruit flavor - Just right
    },
    timestamp: "2025-06-01T11:15:00Z"
  },
  {
    id: "eval37",
    userId: "evaluator7",
    sampleId: "sample7",
    productTypeId: "product3",
    eventId: "event4",
    hedonic: {
      appearance: 6,
      odor: 7,
      texture: 6,
      flavor: 6,
      overallLiking: 6
    },
    jar: {
      "attr9": 1,  // Sweetness - Much too weak
      "attr10": 5, // Tartness - Much too tart
      "attr11": 2, // Thickness - Too thin  
      "attr12": 1  // Fruit flavor - Much too weak
    },
    timestamp: "2025-06-01T11:30:00Z"
  },
  {
    id: "eval38",
    userId: "evaluator8",
    sampleId: "sample7",
    productTypeId: "product3",
    eventId: "event4",
    hedonic: {
      appearance: 8,
      odor: 8, 
      texture: 9,
      flavor: 8,
      overallLiking: 8
    },
    jar: {
      "attr9": 4,  // Sweetness - Too sweet
      "attr10": 3, // Tartness - Just right
      "attr11": 3, // Thickness - Just right
      "attr12": 4  // Fruit flavor - Too strong
    },
    timestamp: "2025-06-01T11:45:00Z"
  },
  {
    id: "eval39",
    userId: "evaluator9",
    sampleId: "sample7",
    productTypeId: "product3",
    eventId: "event4",
    hedonic: {
      appearance: 7,
      odor: 7,
      texture: 7,
      flavor: 7,
      overallLiking: 7
    },
    jar: {
      "attr9": 3,  // Sweetness - Just right
      "attr10": 2, // Tartness - Too weak
      "attr11": 5, // Thickness - Much too thick
      "attr12": 3  // Fruit flavor - Just right
    },
    timestamp: "2025-06-01T12:00:00Z"
  },
  {
    id: "eval40",
    userId: "evaluator10",
    sampleId: "sample7",
    productTypeId: "product3",
    eventId: "event4",
    hedonic: {
      appearance: 9,
      odor: 8,
      texture: 8,
      flavor: 9,
      overallLiking: 9
    },
    jar: {
      "attr9": 3,  // Sweetness - Just right
      "attr10": 3, // Tartness - Just right
      "attr11": 3, // Thickness - Just right
      "attr12": 3  // Fruit flavor - Just right
    },
    timestamp: "2025-06-01T12:15:00Z"
  },
  {
    id: "eval41",
    userId: "evaluator11",
    sampleId: "sample7",
    productTypeId: "product3",
    eventId: "event4",
    hedonic: {
      appearance: 8,
      odor: 7,
      texture: 8,
      flavor: 8,
      overallLiking: 8
    },
    jar: {
      "attr9": 2,  // Sweetness - Too weak
      "attr10": 4, // Tartness - Too tart
      "attr11": 2, // Thickness - Too thin
      "attr12": 2  // Fruit flavor - Too weak
    },
    timestamp: "2025-06-01T12:30:00Z"
  },
  {
    id: "eval42",
    userId: "evaluator12",
    sampleId: "sample7",
    productTypeId: "product3",
    eventId: "event4",
    hedonic: {
      appearance: 7,
      odor: 8,
      texture: 7,
      flavor: 7,
      overallLiking: 7
    },
    jar: {
      "attr9": 4,  // Sweetness - Too sweet
      "attr10": 3, // Tartness - Just right
      "attr11": 4, // Thickness - Too thick
      "attr12": 4  // Fruit flavor - Too strong
    },
    timestamp: "2025-06-01T12:45:00Z"
  },

  // Sample 8 (Vindija) - 12 evaluators
  {
    id: "eval43",
    userId: "evaluator1",
    sampleId: "sample8",
    productTypeId: "product3",
    eventId: "event4",
    hedonic: {
      appearance: 9,
      odor: 9,
      texture: 9,
      flavor: 9,
      overallLiking: 9
    },
    jar: {
      "attr9": 3,  // Sweetness - Just right
      "attr10": 3, // Tartness - Just right
      "attr11": 3, // Thickness - Just right
      "attr12": 3  // Fruit flavor - Just right
    },
    timestamp: "2025-06-01T13:00:00Z"
  },
  {
    id: "eval44", 
    userId: "evaluator2",
    sampleId: "sample8",
    productTypeId: "product3",
    eventId: "event4",
    hedonic: {
      appearance: 8,
      odor: 8,
      texture: 8,
      flavor: 8,
      overallLiking: 8
    },
    jar: {
      "attr9": 3,  // Sweetness - Just right
      "attr10": 3, // Tartness - Just right
      "attr11": 3, // Thickness - Just right
      "attr12": 4  // Fruit flavor - Too strong
    },
    timestamp: "2025-06-01T13:15:00Z"
  },
  {
    id: "eval45",
    userId: "evaluator3",
    sampleId: "sample8",
    productTypeId: "product3", 
    eventId: "event4",
    hedonic: {
      appearance: 8,
      odor: 9,
      texture: 8,
      flavor: 8,
      overallLiking: 8
    },
    jar: {
      "attr9": 4,  // Sweetness - Too sweet
      "attr10": 2, // Tartness - Too weak
      "attr11": 4, // Thickness - Too thick
      "attr12": 3  // Fruit flavor - Just right
    },
    timestamp: "2025-06-01T13:30:00Z"
  },
  {
    id: "eval46",
    userId: "evaluator4",
    sampleId: "sample8",
    productTypeId: "product3",
    eventId: "event4",
    hedonic: {
      appearance: 9,
      odor: 8,
      texture: 9,
      flavor: 9,
      overallLiking: 9
    },
    jar: {
      "attr9": 3,  // Sweetness - Just right
      "attr10": 3, // Tartness - Just right
      "attr11": 3, // Thickness - Just right
      "attr12": 3  // Fruit flavor - Just right
    },
    timestamp: "2025-06-01T13:45:00Z"
  },
  {
    id: "eval47",
    userId: "evaluator5",
    sampleId: "sample8",
    productTypeId: "product3",
    eventId: "event4",
    hedonic: {
      appearance: 8,
      odor: 8,
      texture: 8,
      flavor: 8,
      overallLiking: 8
    },
    jar: {
      "attr9": 3,  // Sweetness - Just right
      "attr10": 4, // Tartness - Too tart
      "attr11": 2, // Thickness - Too thin
      "attr12": 2  // Fruit flavor - Too weak
    },
    timestamp: "2025-06-01T14:00:00Z"
  },
  {
    id: "eval48",
    userId: "evaluator6",
    sampleId: "sample8",
    productTypeId: "product3",
    eventId: "event4",
    hedonic: {
      appearance: 7,
      odor: 7,
      texture: 7,
      flavor: 7,
      overallLiking: 7
    },
    jar: {
      "attr9": 2,  // Sweetness - Too weak
      "attr10": 3, // Tartness - Just right
      "attr11": 3, // Thickness - Just right
      "attr12": 3  // Fruit flavor - Just right
    },
    timestamp: "2025-06-01T14:15:00Z"
  },
  {
    id: "eval49",
    userId: "evaluator7",
    sampleId: "sample8",
    productTypeId: "product3",
    eventId: "event4",
    hedonic: {
      appearance: 9,
      odor: 9,
      texture: 9,
      flavor: 9,
      overallLiking: 9
    },
    jar: {
      "attr9": 3,  // Sweetness - Just right
      "attr10": 3, // Tartness - Just right
      "attr11": 3, // Thickness - Just right
      "attr12": 3  // Fruit flavor - Just right
    },
    timestamp: "2025-06-01T14:30:00Z"
  },
  {
    id: "eval50",
    userId: "evaluator8",
    sampleId: "sample8",
    productTypeId: "product3",
    eventId: "event4",
    hedonic: {
      appearance: 8,
      odor: 8,
      texture: 8,
      flavor: 8,
      overallLiking: 8
    },
    jar: {
      "attr9": 4,  // Sweetness - Too sweet
      "attr10": 3, // Tartness - Just right
      "attr11": 4, // Thickness - Too thick
      "attr12": 4  // Fruit flavor - Too strong
    },
    timestamp: "2025-06-01T14:45:00Z"
  },
  {
    id: "eval51",
    userId: "evaluator9",
    sampleId: "sample8",
    productTypeId: "product3",
    eventId: "event4",
    hedonic: {
      appearance: 7,
      odor: 8,
      texture: 7,
      flavor: 8,
      overallLiking: 7
    },
    jar: {
      "attr9": 3,  // Sweetness - Just right
      "attr10": 2, // Tartness - Too weak
      "attr11": 3, // Thickness - Just right
      "attr12": 3  // Fruit flavor - Just right
    },
    timestamp: "2025-06-01T15:00:00Z"
  },
  {
    id: "eval52",
    userId: "evaluator10",
    sampleId: "sample8",
    productTypeId: "product3",
    eventId: "event4",
    hedonic: {
      appearance: 8,
      odor: 9,
      texture: 8,
      flavor: 9,
      overallLiking: 8
    },
    jar: {
      "attr9": 3,  // Sweetness - Just right
      "attr10": 3, // Tartness - Just right
      "attr11": 3, // Thickness - Just right
      "attr12": 2  // Fruit flavor - Too weak
    },
    timestamp: "2025-06-01T15:15:00Z"
  },
  {
    id: "eval53",
    userId: "evaluator11",
    sampleId: "sample8",
    productTypeId: "product3",
    eventId: "event4",
    hedonic: {
      appearance: 9,
      odor: 8,
      texture: 9,
      flavor: 8,
      overallLiking: 9
    },
    jar: {
      "attr9": 3,  // Sweetness - Just right
      "attr10": 4, // Tartness - Too tart
      "attr11": 3, // Thickness - Just right
      "attr12": 3  // Fruit flavor - Just right
    },
    timestamp: "2025-06-01T15:30:00Z"
  },
  {
    id: "eval54",
    userId: "evaluator12",
    sampleId: "sample8",
    productTypeId: "product3",
    eventId: "event4",
    hedonic: {
      appearance: 8,
      odor: 8,
      texture: 8,
      flavor: 8,
      overallLiking: 8
    },
    jar: {
      "attr9": 2,  // Sweetness - Too weak
      "attr10": 3, // Tartness - Just right
      "attr11": 2, // Thickness - Too thin
      "attr12": 4  // Fruit flavor - Too strong
    },
    timestamp: "2025-06-01T15:45:00Z"
  },

  // Sample 9 (Meggle) - 12 evaluators
  {
    id: "eval55",
    userId: "evaluator1",
    sampleId: "sample9",
    productTypeId: "product3",
    eventId: "event4",
    hedonic: {
      appearance: 6,
      odor: 6,
      texture: 6,
      flavor: 6,
      overallLiking: 6
    },
    jar: {
      "attr9": 5,  // Sweetness - Much too sweet
      "attr10": 1, // Tartness - Much too weak
      "attr11": 5, // Thickness - Much too thick
      "attr12": 5  // Fruit flavor - Much too strong
    },
    timestamp: "2025-06-01T16:00:00Z"
  },
  {
    id: "eval56",
    userId: "evaluator2",
    sampleId: "sample9",
    productTypeId: "product3",
    eventId: "event4",
    hedonic: {
      appearance: 7,
      odor: 6,
      texture: 6,
      flavor: 6,
      overallLiking: 6
    },
    jar: {
      "attr9": 4,  // Sweetness - Too sweet
      "attr10": 2, // Tartness - Too weak
      "attr11": 4, // Thickness - Too thick
      "attr12": 4  // Fruit flavor - Too strong
    },
    timestamp: "2025-06-01T16:15:00Z"
  },
  {
    id: "eval57",
    userId: "evaluator3",
    sampleId: "sample9",
    productTypeId: "product3",
    eventId: "event4",
    hedonic: {
      appearance: 5,
      odor: 5,
      texture: 5,
      flavor: 5,
      overallLiking: 5
    },
    jar: {
      "attr9": 5,  // Sweetness - Much too sweet
      "attr10": 1, // Tartness - Much too weak
      "attr11": 4, // Thickness - Too thick
      "attr12": 5  // Fruit flavor - Much too strong
    },
    timestamp: "2025-06-01T16:30:00Z"
  },
  {
    id: "eval58",
    userId: "evaluator4",
    sampleId: "sample9",
    productTypeId: "product3",
    eventId: "event4",
    hedonic: {
      appearance: 6,
      odor: 7,
      texture: 6,
      flavor: 6,
      overallLiking: 6
    },
    jar: {
      "attr9": 4,  // Sweetness - Too sweet
      "attr10": 2, // Tartness - Too weak
      "attr11": 4, // Thickness - Too thick
      "attr12": 4  // Fruit flavor - Too strong
    },
    timestamp: "2025-06-01T16:45:00Z"
  },
  {
    id: "eval59",
    userId: "evaluator5",
    sampleId: "sample9",
    productTypeId: "product3",
    eventId: "event4",
    hedonic: {
      appearance: 7,
      odor: 6,
      texture: 7,
      flavor: 6,
      overallLiking: 6
    },
    jar: {
      "attr9": 4,  // Sweetness - Too sweet
      "attr10": 1, // Tartness - Much too weak
      "attr11": 5, // Thickness - Much too thick
      "attr12": 4  // Fruit flavor - Too strong
    },
    timestamp: "2025-06-01T17:00:00Z"
  },
  {
    id: "eval60",
    userId: "evaluator6",
    sampleId: "sample9",
    productTypeId: "product3",
    eventId: "event4",
    hedonic: {
      appearance: 6,
      odor: 6,
      texture: 5,
      flavor: 5,
      overallLiking: 5
    },
    jar: {
      "attr9": 5,  // Sweetness - Much too sweet
      "attr10": 1, // Tartness - Much too weak
      "attr11": 5, // Thickness - Much too thick
      "attr12": 5  // Fruit flavor - Much too strong
    },
    timestamp: "2025-06-01T17:15:00Z"
  },
  {
    id: "eval61",
    userId: "evaluator7",
    sampleId: "sample9",
    productTypeId: "product3",
    eventId: "event4",
    hedonic: {
      appearance: 8,
      odor: 7,
      texture: 7,
      flavor: 7,
      overallLiking: 7
    },
    jar: {
      "attr9": 3,  // Sweetness - Just right
      "attr10": 2, // Tartness - Too weak
      "attr11": 3, // Thickness - Just right
      "attr12": 3  // Fruit flavor - Just right
    },
    timestamp: "2025-06-01T17:30:00Z"
  },
  {
    id: "eval62",
    userId: "evaluator8",
    sampleId: "sample9",
    productTypeId: "product3",
    eventId: "event4",
    hedonic: {
      appearance: 7,
      odor: 6,
      texture: 6,
      flavor: 6,
      overallLiking: 6
    },
    jar: {
      "attr9": 4,  // Sweetness - Too sweet
      "attr10": 2, // Tartness - Too weak
      "attr11": 4, // Thickness - Too thick
      "attr12": 4  // Fruit flavor - Too strong
    },
    timestamp: "2025-06-01T17:45:00Z"
  },
  {
    id: "eval63",
    userId: "evaluator9",
    sampleId: "sample9",
    productTypeId: "product3",
    eventId: "event4",
    hedonic: {
      appearance: 6,
      odor: 5,
      texture: 5,
      flavor: 5,
      overallLiking: 5
    },
    jar: {
      "attr9": 5,  // Sweetness - Much too sweet
      "attr10": 1, // Tartness - Much too weak
      "attr11": 5, // Thickness - Much too thick
      "attr12": 5  // Fruit flavor - Much too strong
    },
    timestamp: "2025-06-01T18:00:00Z"
  },
  {
    id: "eval64",
    userId: "evaluator10",
    sampleId: "sample9",
    productTypeId: "product3",
    eventId: "event4",
    hedonic: {
      appearance: 7,
      odor: 6,
      texture: 6,
      flavor: 6,
      overallLiking: 6
    },
    jar: {
      "attr9": 4,  // Sweetness - Too sweet
      "attr10": 2, // Tartness - Too weak
      "attr11": 4, // Thickness - Too thick
      "attr12": 4  // Fruit flavor - Too strong
    },
    timestamp: "2025-06-01T18:15:00Z"
  },
  {
    id: "eval65",
    userId: "evaluator11",
    sampleId: "sample9",
    productTypeId: "product3",
    eventId: "event4",
    hedonic: {
      appearance: 5,
      odor: 5,
      texture: 4,
      flavor: 4,
      overallLiking: 4
    },
    jar: {
      "attr9": 5,  // Sweetness - Much too sweet
      "attr10": 1, // Tartness - Much too weak
      "attr11": 5, // Thickness - Much too thick
      "attr12": 5  // Fruit flavor - Much too strong
    },
    timestamp: "2025-06-01T18:30:00Z"
  },
  {
    id: "eval66",
    userId: "evaluator12",
    sampleId: "sample9",
    productTypeId: "product3",
    eventId: "event4",
    hedonic: {
      appearance: 6,
      odor: 6,
      texture: 5,
      flavor: 5,
      overallLiking: 5
    },
    jar: {
      "attr9": 4,  // Sweetness - Too sweet
      "attr10": 1, // Tartness - Much too weak
      "attr11": 4, // Thickness - Too thick
      "attr12": 4  // Fruit flavor - Too strong
    },
    timestamp: "2025-06-01T18:45:00Z"
  }
];
