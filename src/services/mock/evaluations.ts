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
  }
];
