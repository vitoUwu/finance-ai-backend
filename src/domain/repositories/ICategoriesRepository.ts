import { Category } from "../entities/Category.js";

export interface ICategoriesRepository {
  findById(id: string): Promise<Category | null>;
  findByUserId(userId: string): Promise<Category[]>;
  create(
    data: Omit<Category, "id" | "createdAt" | "updatedAt">
  ): Promise<Category>;
  save(category: Category): Promise<Category>;
  delete(id: string): Promise<void>;
}
