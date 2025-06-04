
import { User, UserRole } from "@/types";

export const users: User[] = [
  // Admin users
  {
    id: "admin1",
    username: "admin",
    role: UserRole.ADMIN,
    isActive: true,
    password: "BioinsADMIN"
  },
  // Evaluator users
  {
    id: "evaluator1",
    username: "evaluator1",
    role: UserRole.EVALUATOR,
    evaluatorPosition: 1,
    isActive: true,
    password: "Bioins1"
  },
  {
    id: "evaluator2",
    username: "evaluator2",
    role: UserRole.EVALUATOR,
    evaluatorPosition: 2,
    isActive: true,
    password: "Bioins2"
  },
  {
    id: "evaluator3",
    username: "evaluator3",
    role: UserRole.EVALUATOR,
    evaluatorPosition: 3,
    isActive: true,
    password: "Bioins3"
  },
  {
    id: "evaluator4",
    username: "evaluator4",
    role: UserRole.EVALUATOR,
    evaluatorPosition: 4,
    isActive: true,
    password: "Bioins4"
  },
  {
    id: "evaluator5",
    username: "evaluator5",
    role: UserRole.EVALUATOR,
    evaluatorPosition: 5,
    isActive: true,
    password: "Bioins5"
  },
  {
    id: "evaluator6",
    username: "evaluator6",
    role: UserRole.EVALUATOR,
    evaluatorPosition: 6,
    isActive: true,
    password: "Bioins6"
  },
  {
    id: "evaluator7",
    username: "evaluator7",
    role: UserRole.EVALUATOR,
    evaluatorPosition: 7,
    isActive: true,
    password: "Bioins7"
  },
  {
    id: "evaluator8",
    username: "evaluator8",
    role: UserRole.EVALUATOR,
    evaluatorPosition: 8,
    isActive: true,
    password: "Bioins8"
  },
  {
    id: "evaluator9",
    username: "evaluator9",
    role: UserRole.EVALUATOR,
    evaluatorPosition: 9,
    isActive: true,
    password: "Bioins9"
  },
  {
    id: "evaluator10",
    username: "evaluator10",
    role: UserRole.EVALUATOR,
    evaluatorPosition: 10,
    isActive: true,
    password: "Bioins10"
  },
  {
    id: "evaluator11",
    username: "evaluator11",
    role: UserRole.EVALUATOR,
    evaluatorPosition: 11,
    isActive: true,
    password: "Bioins11"
  },
  {
    id: "evaluator12",
    username: "evaluator12",
    role: UserRole.EVALUATOR,
    evaluatorPosition: 12,
    isActive: true,
    password: "Bioins12"
  }
];
