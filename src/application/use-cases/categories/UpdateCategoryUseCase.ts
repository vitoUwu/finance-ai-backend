import { Category } from "../../../domain/entities/Category.js";
import { ICategoriesRepository } from "../../../domain/repositories/ICategoriesRepository.js";
import { NotFoundError } from "../../../shared/errors/AppError.js";

interface UpdateCategoryRequest {
  categoryId: string;
  userId: string;
  name?: string;
  color?: string;
}

export class UpdateCategoryUseCase {
  constructor(private categoriesRepository: ICategoriesRepository) {}

  async execute({
    categoryId,
    userId,
    ...data
  }: UpdateCategoryRequest): Promise<Category> {
    const category = await this.categoriesRepository.findById(categoryId);

    if (!category) {
      throw new NotFoundError("Category");
    }

    if (category.userId !== userId) {
      throw new NotFoundError("Category");
    }

    const updatedCategory = await this.categoriesRepository.save({
      ...category,
      ...data,
    });

    return updatedCategory;
  }
}
