import { ITransactionsRepository } from "../../../domain/repositories/ITransactionsRepository.js";
import { NotFoundError } from "../../../shared/errors/AppError.js";

interface DeleteTransactionRequest {
  transactionId: string;
  userId: string;
}

export class DeleteTransactionUseCase {
  constructor(private transactionsRepository: ITransactionsRepository) {}

  async execute({
    transactionId,
    userId,
  }: DeleteTransactionRequest): Promise<void> {
    const transaction = await this.transactionsRepository.findById(
      transactionId
    );

    if (!transaction) {
      throw new NotFoundError("Transaction");
    }

    if (transaction.userId !== userId) {
      throw new NotFoundError("Transaction");
    }

    await this.transactionsRepository.delete(transactionId);
  }
}
