import { ITransactionAIService } from "../../services/ai/ITransactionAIService.js";
import { ICategoriesRepository } from "../../../domain/repositories/ICategoriesRepository.js";

interface GenerateTransactionRequest {
  description: string;
  userId: string;
}

export class GenerateTransactionUseCase {
  constructor(
    private transactionAIService: ITransactionAIService,
    private categoriesRepository: ICategoriesRepository
  ) {}

  async execute({ description, userId }: GenerateTransactionRequest) {
    const generatedTransaction =
      await this.transactionAIService.generateFromDescription({
        description,
        userId,
      });

    // Buscar categorias do usuário para sugerir a mais próxima
    const userCategories = await this.categoriesRepository.findByUserId(userId);

    // Aqui você pode implementar uma lógica para encontrar a categoria mais similar
    // Por enquanto, vamos apenas retornar a sugestão da IA
    return {
      ...generatedTransaction,
      suggestedCategory: {
        name: generatedTransaction.suggestedCategory,
        existingCategories: userCategories,
      },
    };
  }
}
