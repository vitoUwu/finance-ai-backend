import { Category } from "../../domain/entities/Category.js";
import { ICategoriesRepository } from "../../domain/repositories/ICategoriesRepository.js";

export class InMemoryCategoriesRepository implements ICategoriesRepository {
  private categories: Category[] = [];

  async findById(id: string): Promise<Category | null> {
    const category = this.categories.find((category) => category.id === id);
    return category ?? null;
  }

  async findByUserId(userId: string): Promise<Category[]> {
    return this.categories.filter((category) => category.userId === userId);
  }

  async create(
    data: Omit<Category, "id" | "createdAt" | "updatedAt">
  ): Promise<Category> {
    const category: Category = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };

    this.categories.push(category);
    return category;
  }

  async save(category: Category): Promise<Category> {
    const categoryIndex = this.categories.findIndex(
      (c) => c.id === category.id
    );

    if (categoryIndex >= 0) {
      this.categories[categoryIndex] = {
        ...category,
        updatedAt: new Date(),
      };
      return this.categories[categoryIndex];
    }

    return category;
  }

  async delete(id: string): Promise<void> {
    const categoryIndex = this.categories.findIndex(
      (category) => category.id === id
    );
    if (categoryIndex >= 0) {
      this.categories.splice(categoryIndex, 1);
    }
  }
}
