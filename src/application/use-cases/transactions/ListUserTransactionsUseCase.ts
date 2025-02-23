import { Transaction } from "../../../domain/entities/Transaction.js";
import { ITransactionsRepository } from "../../../domain/repositories/ITransactionsRepository.js";

interface ListUserTransactionsRequest {
  userId: string;
}

export class ListUserTransactionsUseCase {
  constructor(private transactionsRepository: ITransactionsRepository) {}

  async execute({
    userId,
  }: ListUserTransactionsRequest): Promise<Transaction[]> {
    const transactions = await this.transactionsRepository.findByUserId(userId);

    return transactions;
  }
}
