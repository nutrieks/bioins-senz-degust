import { Evaluation } from "@/types";

export const evaluations: Evaluation[] = [
  // Sample 1 (Plazma) - 8 evaluators
  {
    id: "eval_test1",
    userId: "evaluator1",
    sampleId: "sample_test1",
    productTypeId: "product_test",
    eventId: "event_test",
    hedonic: {
      appearance: 8,
      odor: 7,
      texture: 8,
      flavor: 8,
      overallLiking: 8
    },
    jar: {
      "attr_test1": 3, // Just right
      "attr_test2": 4, // Too crunchy
      "attr_test3": 3  // Just right
    },
    timestamp: "2025-06-05T10:00:00Z"
  },
  {
    id: "eval_test2",
    userId: "evaluator2",
    sampleId: "sample_test1",
    productTypeId: "product_test",
    eventId: "event_test",
    hedonic: {
      appearance: 7,
      odor: 8,
      texture: 7,
      flavor: 7,
      overallLiking: 7
    },
    jar: {
      "attr_test1": 4, // Too strong
      "attr_test2": 3, // Just right
      "attr_test3": 2  // Too weak
    },
    timestamp: "2025-06-05T10:15:00Z"
  },
  {
    id: "eval_test3",
    userId: "evaluator3",
    sampleId: "sample_test1",
    productTypeId: "product_test",
    eventId: "event_test",
    hedonic: {
      appearance: 9,
      odor: 8,
      texture: 9,
      flavor: 9,
      overallLiking: 9
    },
    jar: {
      "attr_test1": 3, // Just right
      "attr_test2": 3, // Just right
      "attr_test3": 4  // Too strong
    },
    timestamp: "2025-06-05T10:30:00Z"
  },
  {
    id: "eval_test4",
    userId: "evaluator4",
    sampleId: "sample_test1",
    productTypeId: "product_test",
    eventId: "event_test",
    hedonic: {
      appearance: 8,
      odor: 7,
      texture: 8,
      flavor: 8,
      overallLiking: 8
    },
    jar: {
      "attr_test1": 2, // Too weak
      "attr_test2": 4, // Too crunchy
      "attr_test3": 3  // Just right
    },
    timestamp: "2025-06-05T10:45:00Z"
  },
  {
    id: "eval_test5",
    userId: "evaluator5",
    sampleId: "sample_test1",
    productTypeId: "product_test",
    eventId: "event_test",
    hedonic: {
      appearance: 7,
      odor: 6,
      texture: 7,
      flavor: 7,
      overallLiking: 7
    },
    jar: {
      "attr_test1": 3, // Just right
      "attr_test2": 2, // Too soft
      "attr_test3": 3  // Just right
    },
    timestamp: "2025-06-05T11:00:00Z"
  },
  {
    id: "eval_test6",
    userId: "evaluator6",
    sampleId: "sample_test1",
    productTypeId: "product_test",
    eventId: "event_test",
    hedonic: {
      appearance: 8,
      odor: 8,
      texture: 8,
      flavor: 8,
      overallLiking: 8
    },
    jar: {
      "attr_test1": 4, // Too strong
      "attr_test2": 3, // Just right
      "attr_test3": 2  // Too weak
    },
    timestamp: "2025-06-05T11:15:00Z"
  },
  {
    id: "eval_test7",
    userId: "evaluator7",
    sampleId: "sample_test1",
    productTypeId: "product_test",
    eventId: "event_test",
    hedonic: {
      appearance: 9,
      odor: 9,
      texture: 9,
      flavor: 9,
      overallLiking: 9
    },
    jar: {
      "attr_test1": 3, // Just right
      "attr_test2": 3, // Just right
      "attr_test3": 3  // Just right
    },
    timestamp: "2025-06-05T11:30:00Z"
  },
  {
    id: "eval_test8",
    userId: "evaluator8",
    sampleId: "sample_test1",
    productTypeId: "product_test",
    eventId: "event_test",
    hedonic: {
      appearance: 6,
      odor: 7,
      texture: 6,
      flavor: 6,
      overallLiking: 6
    },
    jar: {
      "attr_test1": 1, // Much too weak
      "attr_test2": 5, // Much too crunchy
      "attr_test3": 1  // Much too weak
    },
    timestamp: "2025-06-05T11:45:00Z"
  },

  // Sample 2 (Petit) - 8 evaluators
  {
    id: "eval_test9",
    userId: "evaluator1",
    sampleId: "sample_test2",
    productTypeId: "product_test",
    eventId: "event_test",
    hedonic: {
      appearance: 7,
      odor: 8,
      texture: 7,
      flavor: 8,
      overallLiking: 7
    },
    jar: {
      "attr_test1": 4, // Too strong
      "attr_test2": 3, // Just right
      "attr_test3": 4  // Too strong
    },
    timestamp: "2025-06-05T12:00:00Z"
  },
  {
    id: "eval_test10",
    userId: "evaluator2",
    sampleId: "sample_test2",
    productTypeId: "product_test",
    eventId: "event_test",
    hedonic: {
      appearance: 8,
      odor: 7,
      texture: 8,
      flavor: 7,
      overallLiking: 8
    },
    jar: {
      "attr_test1": 3, // Just right
      "attr_test2": 4, // Too crunchy
      "attr_test3": 3  // Just right
    },
    timestamp: "2025-06-05T12:15:00Z"
  },
  {
    id: "eval_test11",
    userId: "evaluator3",
    sampleId: "sample_test2",
    productTypeId: "product_test",
    eventId: "event_test",
    hedonic: {
      appearance: 6,
      odor: 6,
      texture: 6,
      flavor: 6,
      overallLiking: 6
    },
    jar: {
      "attr_test1": 5, // Much too strong
      "attr_test2": 2, // Too soft
      "attr_test3": 5  // Much too strong
    },
    timestamp: "2025-06-05T12:30:00Z"
  },
  {
    id: "eval_test12",
    userId: "evaluator4",
    sampleId: "sample_test2",
    productTypeId: "product_test",
    eventId: "event_test",
    hedonic: {
      appearance: 7,
      odor: 7,
      texture: 7,
      flavor: 7,
      overallLiking: 7
    },
    jar: {
      "attr_test1": 3, // Just right
      "attr_test2": 3, // Just right
      "attr_test3": 3  // Just right
    },
    timestamp: "2025-06-05T12:45:00Z"
  },
  {
    id: "eval_test13",
    userId: "evaluator5",
    sampleId: "sample_test2",
    productTypeId: "product_test",
    eventId: "event_test",
    hedonic: {
      appearance: 8,
      odor: 8,
      texture: 8,
      flavor: 8,
      overallLiking: 8
    },
    jar: {
      "attr_test1": 2, // Too weak
      "attr_test2": 4, // Too crunchy
      "attr_test3": 2  // Too weak
    },
    timestamp: "2025-06-05T13:00:00Z"
  },
  {
    id: "eval_test14",
    userId: "evaluator6",
    sampleId: "sample_test2",
    productTypeId: "product_test",
    eventId: "event_test",
    hedonic: {
      appearance: 7,
      odor: 7,
      texture: 7,
      flavor: 7,
      overallLiking: 7
    },
    jar: {
      "attr_test1": 4, // Too strong
      "attr_test2": 3, // Just right
      "attr_test3": 4  // Too strong
    },
    timestamp: "2025-06-05T13:15:00Z"
  },
  {
    id: "eval_test15",
    userId: "evaluator7",
    sampleId: "sample_test2",
    productTypeId: "product_test",
    eventId: "event_test",
    hedonic: {
      appearance: 9,
      odor: 8,
      texture: 9,
      flavor: 8,
      overallLiking: 9
    },
    jar: {
      "attr_test1": 3, // Just right
      "attr_test2": 3, // Just right
      "attr_test3": 3  // Just right
    },
    timestamp: "2025-06-05T13:30:00Z"
  },
  {
    id: "eval_test16",
    userId: "evaluator8",
    sampleId: "sample_test2",
    productTypeId: "product_test",
    eventId: "event_test",
    hedonic: {
      appearance: 6,
      odor: 6,
      texture: 6,
      flavor: 6,
      overallLiking: 6
    },
    jar: {
      "attr_test1": 4, // Too strong
      "attr_test2": 2, // Too soft
      "attr_test3": 4  // Too strong
    },
    timestamp: "2025-06-05T13:45:00Z"
  },

  // Sample 3 (Oreo) - 8 evaluators
  {
    id: "eval_test17",
    userId: "evaluator1",
    sampleId: "sample_test3",
    productTypeId: "product_test",
    eventId: "event_test",
    hedonic: {
      appearance: 9,
      odor: 9,
      texture: 9,
      flavor: 9,
      overallLiking: 9
    },
    jar: {
      "attr_test1": 3, // Just right
      "attr_test2": 3, // Just right
      "attr_test3": 3  // Just right
    },
    timestamp: "2025-06-05T14:00:00Z"
  },
  {
    id: "eval_test18",
    userId: "evaluator2",
    sampleId: "sample_test3",
    productTypeId: "product_test",
    eventId: "event_test",
    hedonic: {
      appearance: 8,
      odor: 8,
      texture: 8,
      flavor: 8,
      overallLiking: 8
    },
    jar: {
      "attr_test1": 3, // Just right
      "attr_test2": 4, // Too crunchy
      "attr_test3": 4  // Too strong
    },
    timestamp: "2025-06-05T14:15:00Z"
  },
  {
    id: "eval_test19",
    userId: "evaluator3",
    sampleId: "sample_test3",
    productTypeId: "product_test",
    eventId: "event_test",
    hedonic: {
      appearance: 9,
      odor: 9,
      texture: 9,
      flavor: 9,
      overallLiking: 9
    },
    jar: {
      "attr_test1": 3, // Just right
      "attr_test2": 3, // Just right
      "attr_test3": 3  // Just right
    },
    timestamp: "2025-06-05T14:30:00Z"
  },
  {
    id: "eval_test20",
    userId: "evaluator4",
    sampleId: "sample_test3",
    productTypeId: "product_test",
    eventId: "event_test",
    hedonic: {
      appearance: 8,
      odor: 8,
      texture: 8,
      flavor: 8,
      overallLiking: 8
    },
    jar: {
      "attr_test1": 2, // Too weak
      "attr_test2": 3, // Just right
      "attr_test3": 4  // Too strong
    },
    timestamp: "2025-06-05T14:45:00Z"
  },
  {
    id: "eval_test21",
    userId: "evaluator5",
    sampleId: "sample_test3",
    productTypeId: "product_test",
    eventId: "event_test",
    hedonic: {
      appearance: 9,
      odor: 8,
      texture: 9,
      flavor: 9,
      overallLiking: 9
    },
    jar: {
      "attr_test1": 3, // Just right
      "attr_test2": 3, // Just right
      "attr_test3": 3  // Just right
    },
    timestamp: "2025-06-05T15:00:00Z"
  },
  {
    id: "eval_test22",
    userId: "evaluator6",
    sampleId: "sample_test3",
    productTypeId: "product_test",
    eventId: "event_test",
    hedonic: {
      appearance: 8,
      odor: 9,
      texture: 8,
      flavor: 9,
      overallLiking: 8
    },
    jar: {
      "attr_test1": 4, // Too strong
      "attr_test2": 2, // Too soft
      "attr_test3": 2  // Too weak
    },
    timestamp: "2025-06-05T15:15:00Z"
  },
  {
    id: "eval_test23",
    userId: "evaluator7",
    sampleId: "sample_test3",
    productTypeId: "product_test",
    eventId: "event_test",
    hedonic: {
      appearance: 9,
      odor: 9,
      texture: 9,
      flavor: 9,
      overallLiking: 9
    },
    jar: {
      "attr_test1": 3, // Just right
      "attr_test2": 3, // Just right
      "attr_test3": 3  // Just right
    },
    timestamp: "2025-06-05T15:30:00Z"
  },
  {
    id: "eval_test24",
    userId: "evaluator8",
    sampleId: "sample_test3",
    productTypeId: "product_test",
    eventId: "event_test",
    hedonic: {
      appearance: 7,
      odor: 8,
      texture: 7,
      flavor: 8,
      overallLiking: 7
    },
    jar: {
      "attr_test1": 3, // Just right
      "attr_test2": 4, // Too crunchy
      "attr_test3": 4  // Too strong
    },
    timestamp: "2025-06-05T15:45:00Z"
  }
];
