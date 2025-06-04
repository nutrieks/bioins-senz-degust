
import { User, UserRole } from "@/types";

export const users: User[] = [
  // Admin users
  {
    id: "admin1",
    username: "admin",
    password: "admin123",
    role: UserRole.ADMIN,
    createdAt: "2025-04-01T00:00:00Z"
  },
  // Evaluator users
  {
    id: "evaluator1",
    username: "evaluator1",
    password: "eval123",
    role: UserRole.EVALUATOR,
    evaluatorPosition: 1,
    createdAt: "2025-04-01T00:00:00Z"
  },
  {
    id: "evaluator2",
    username: "evaluator2",
    password: "eval123",
    role: UserRole.EVALUATOR,
    evaluatorPosition: 2,
    createdAt: "2025-04-01T00:00:00Z"
  },
  {
    id: "evaluator3",
    username: "evaluator3",
    password: "eval123",
    role: UserRole.EVALUATOR,
    evaluatorPosition: 3,
    createdAt: "2025-04-01T00:00:00Z"
  },
  {
    id: "evaluator4",
    username: "evaluator4",
    password: "eval123",
    role: UserRole.EVALUATOR,
    evaluatorPosition: 4,
    createdAt: "2025-04-01T00:00:00Z"
  },
  {
    id: "evaluator5",
    username: "evaluator5",
    password: "eval123",
    role: UserRole.EVALUATOR,
    evaluatorPosition: 5,
    createdAt: "2025-04-01T00:00:00Z"
  },
  {
    id: "evaluator6",
    username: "evaluator6",
    password: "eval123",
    role: UserRole.EVALUATOR,
    evaluatorPosition: 6,
    createdAt: "2025-04-01T00:00:00Z"
  },
  {
    id: "evaluator7",
    username: "evaluator7",
    password: "eval123",
    role: UserRole.EVALUATOR,
    evaluatorPosition: 7,
    createdAt: "2025-04-01T00:00:00Z"
  },
  {
    id: "evaluator8",
    username: "evaluator8",
    password: "eval123",
    role: UserRole.EVALUATOR,
    evaluatorPosition: 8,
    createdAt: "2025-04-01T00:00:00Z"
  },
  {
    id: "evaluator9",
    username: "evaluator9",
    password: "eval123",
    role: UserRole.EVALUATOR,
    evaluatorPosition: 9,
    createdAt: "2025-04-01T00:00:00Z"
  },
  {
    id: "evaluator10",
    username: "evaluator10",
    password: "eval123",
    role: UserRole.EVALUATOR,
    evaluatorPosition: 10,
    createdAt: "2025-04-01T00:00:00Z"
  },
  {
    id: "evaluator11",
    username: "evaluator11",
    password: "eval123",
    role: UserRole.EVALUATOR,
    evaluatorPosition: 11,
    createdAt: "2025-04-01T00:00:00Z"
  },
  {
    id: "evaluator12",
    username: "evaluator12",
    password: "eval123",
    role: UserRole.EVALUATOR,
    evaluatorPosition: 12,
    createdAt: "2025-04-01T00:00:00Z"
  }
];
