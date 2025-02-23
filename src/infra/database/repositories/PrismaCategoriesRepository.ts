import { Category } from "../../../domain/entities/Category.js";
import { ICategoriesRepository } from "../../../domain/repositories/ICategoriesRepository.js";
import { prisma } from "../prisma.js";

export class PrismaCategoriesRepository implements ICategoriesRepository {
  async findById(id: string): Promise<Category | null> {
    const category = await prisma.category.findUnique({
      where: { id },
    });

    return category;
  }

  async findByUserId(userId: string): Promise<Category[]> {
    const categories = await prisma.category.findMany({
      where: { userId },
    });

    return categories;
  }

  async create(
    data: Omit<Category, "id" | "createdAt" | "updatedAt">
  ): Promise<Category> {
    const category = await prisma.category.create({
      data,
    });

    return category;
  }

  async save(category: Category): Promise<Category> {
    const updatedCategory = await prisma.category.update({
      where: { id: category.id },
      data: category,
    });

    return updatedCategory;
  }

  async delete(id: string): Promise<void> {
    await prisma.category.delete({
      where: { id },
    });
  }
}
