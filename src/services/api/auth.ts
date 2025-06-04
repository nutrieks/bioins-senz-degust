
import { User, UserRole } from "../../types";
import { users } from "../mock";

// Authentication
export async function login(username: string, password: string): Promise<User | null> {
  const user = users.find(u => u.username === username && u.password === password && u.isActive);
  return user || null;
}

// User Management
export async function getUsers(): Promise<User[]> {
  return [...users];
}

export async function createUser(
  username: string,
  role: string,
  evaluatorPosition?: number
): Promise<User> {
  const newUser: User = {
    id: `user_${Date.now()}`,
    username,
    role: role as any,
    evaluatorPosition,
    isActive: true,
    password: role === UserRole.ADMIN ? "BioinsADMIN" : `Bioins${evaluatorPosition}`
  };
  
  users.push(newUser);
  return newUser;
}

export async function updateUserStatus(userId: string, isActive: boolean): Promise<boolean> {
  const user = users.find(u => u.id === userId);
  if (!user) return false;
  
  user.isActive = isActive;
  return true;
}

export async function updateUserPassword(userId: string, newPassword: string): Promise<boolean> {
  const user = users.find(u => u.id === userId);
  if (!user) return false;
  
  user.password = newPassword;
  return true;
}
