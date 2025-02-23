import {
  Transaction,
  TransactionType,
} from "../../../domain/entities/Transaction.js";
import { ITransactionsRepository } from "../../../domain/repositories/ITransactionsRepository.js";
import { ICategoriesRepository } from "../../../domain/repositories/ICategoriesRepository.js";
import { IAccountsRepository } from "../../../domain/repositories/IAccountsRepository.js";
import { NotFoundError, AppError } from "../../../shared/errors/AppError.js";

interface CreateTransactionRequest {
  name: string;
  details?: string;
  date: Date;
  type: TransactionType;
  amount: number;
  categoryId: string;
  accountId: string;
  userId: string;
  paymentMethod: string;
  subscriptionId?: string;
  installmentId?: string;
}

export class CreateTransactionUseCase {
  constructor(
    private transactionsRepository: ITransactionsRepository,
    private categoriesRepository: ICategoriesRepository,
    private accountsRepository: IAccountsRepository
  ) {}

  async execute(request: CreateTransactionRequest): Promise<Transaction> {
    // Validar data da transação
    const currentDate = new Date();
    if (request.date > currentDate) {
      throw new AppError("Transaction date cannot be in the future");
    }

    // Validar valor mínimo
    if (request.amount < 0.01) {
      throw new AppError("Transaction amount must be at least 0.01");
    }

    // Validar categoria
    const category = await this.categoriesRepository.findById(
      request.categoryId
    );
    if (!category || category.userId !== request.userId) {
      throw new NotFoundError("Category");
    }

    // Validar conta
    const account = await this.accountsRepository.findById(request.accountId);
    if (!account || account.userId !== request.userId) {
      throw new NotFoundError("Account");
    }

    // Validar nome da transação
    if (request.name.trim().length < 3) {
      throw new AppError("Transaction name must be at least 3 characters long");
    }

    // Validar detalhes opcionais
    if (request.details && request.details.trim().length > 500) {
      throw new AppError("Transaction details cannot exceed 500 characters");
    }

    const transaction = await this.transactionsRepository.create(request);

    return transaction;
  }
}
