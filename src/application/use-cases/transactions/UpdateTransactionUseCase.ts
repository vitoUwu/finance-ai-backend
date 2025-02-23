import {
  Transaction,
  TransactionType,
} from "../../../domain/entities/Transaction.js";
import { ITransactionsRepository } from "../../../domain/repositories/ITransactionsRepository.js";
import { ICategoriesRepository } from "../../../domain/repositories/ICategoriesRepository.js";
import { IAccountsRepository } from "../../../domain/repositories/IAccountsRepository.js";
import { NotFoundError } from "../../../shared/errors/AppError.js";

interface UpdateTransactionRequest {
  transactionId: string;
  userId: string;
  name?: string;
  details?: string;
  date?: Date;
  type?: TransactionType;
  amount?: number;
  categoryId?: string;
  accountId?: string;
  paymentMethod?: string;
  subscriptionId?: string;
  installmentId?: string;
}

export class UpdateTransactionUseCase {
  constructor(
    private transactionsRepository: ITransactionsRepository,
    private categoriesRepository: ICategoriesRepository,
    private accountsRepository: IAccountsRepository
  ) {}

  async execute({
    transactionId,
    userId,
    categoryId,
    accountId,
    ...data
  }: UpdateTransactionRequest): Promise<Transaction> {
    const transaction = await this.transactionsRepository.findById(
      transactionId
    );

    if (!transaction) {
      throw new NotFoundError("Transaction");
    }

    if (transaction.userId !== userId) {
      throw new NotFoundError("Transaction");
    }

    if (categoryId) {
      const category = await this.categoriesRepository.findById(categoryId);
      if (!category || category.userId !== userId) {
        throw new NotFoundError("Category");
      }
    }

    if (accountId) {
      const account = await this.accountsRepository.findById(accountId);
      if (!account || account.userId !== userId) {
        throw new NotFoundError("Account");
      }
    }

    const updatedTransaction = await this.transactionsRepository.save({
      ...transaction,
      ...data,
      categoryId: categoryId || transaction.categoryId,
      accountId: accountId || transaction.accountId,
    });

    return updatedTransaction;
  }
}
