
import { User, UserRole } from "@/types";

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
