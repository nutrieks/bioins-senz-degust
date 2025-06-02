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
  }
];
