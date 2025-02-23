import { Category } from "../../../domain/entities/Category.js";
import { ICategoriesRepository } from "../../../domain/repositories/ICategoriesRepository.js";

interface CreateCategoryRequest {
  name: string;
  color: string;
  userId: string;
}

export class CreateCategoryUseCase {
  constructor(private categoriesRepository: ICategoriesRepository) {}

  async execute(request: CreateCategoryRequest): Promise<Category> {
    const category = await this.categoriesRepository.create(request);

    return category;
  }
}
