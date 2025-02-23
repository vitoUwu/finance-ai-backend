import { User } from "../entities/User.js";

export interface IUsersRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findAll(): Promise<User[]>;
  create(data: Omit<User, "id" | "createdAt" | "updatedAt">): Promise<User>;
  save(user: Partial<User>): Promise<User>;
}
