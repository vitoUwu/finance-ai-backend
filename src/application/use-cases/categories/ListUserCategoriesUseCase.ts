import { Category } from "../../../domain/entities/Category.js";
import { ICategoriesRepository } from "../../../domain/repositories/ICategoriesRepository.js";

interface ListUserCategoriesRequest {
  userId: string;
}

export class ListUserCategoriesUseCase {
  constructor(private categoriesRepository: ICategoriesRepository) {}

  async execute({ userId }: ListUserCategoriesRequest): Promise<Category[]> {
    const categories = await this.categoriesRepository.findByUserId(userId);

    return categories;
  }
}
