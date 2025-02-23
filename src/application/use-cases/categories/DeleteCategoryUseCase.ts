import { ICategoriesRepository } from "../../../domain/repositories/ICategoriesRepository.js";
import { ITransactionsRepository } from "../../../domain/repositories/ITransactionsRepository.js";
import { NotFoundError, AppError } from "../../../shared/errors/AppError.js";

interface DeleteCategoryRequest {
  categoryId: string;
  userId: string;
}

export class DeleteCategoryUseCase {
  constructor(
    private categoriesRepository: ICategoriesRepository,
    private transactionsRepository: ITransactionsRepository
  ) {}

  async execute({ categoryId, userId }: DeleteCategoryRequest): Promise<void> {
    const category = await this.categoriesRepository.findById(categoryId);

    if (!category) {
      throw new NotFoundError("Category");
    }

    if (category.userId !== userId) {
      throw new NotFoundError("Category");
    }

    // Verificar se é a última categoria do usuário
    const userCategories = await this.categoriesRepository.findByUserId(userId);
    if (userCategories.length === 1) {
      throw new AppError("Cannot delete the last category");
    }

    // Verificar se existem transações vinculadas
    const transactions = await this.transactionsRepository.findByUserId(userId);
    const hasTransactions = transactions.some(
      (transaction) => transaction.categoryId === categoryId
    );

    if (hasTransactions) {
      throw new AppError(
        "Cannot delete category because it has associated transactions"
      );
    }

    await this.categoriesRepository.delete(categoryId);
  }
}
