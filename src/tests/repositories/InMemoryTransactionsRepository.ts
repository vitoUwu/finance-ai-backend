import { Transaction } from "../../domain/entities/Transaction.js";
import { ITransactionsRepository } from "../../domain/repositories/ITransactionsRepository.js";

export class InMemoryTransactionsRepository implements ITransactionsRepository {
  private transactions: Transaction[] = [];

  async findById(id: string): Promise<Transaction | null> {
    const transaction = this.transactions.find(
      (transaction) => transaction.id === id
    );
    return transaction ?? null;
  }

  async findByUserId(userId: string): Promise<Transaction[]> {
    return this.transactions.filter(
      (transaction) => transaction.userId === userId
    );
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<Transaction[]> {
    return this.transactions.filter(
      (transaction) =>
        transaction.date >= startDate && transaction.date <= endDate
    );
  }
  async create(
    data: Omit<Transaction, "id" | "createdAt" | "updatedAt">
  ): Promise<Transaction> {
    const transaction: Transaction = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };

    this.transactions.push(transaction);
    return transaction;
  }

  async save(transaction: Transaction): Promise<Transaction> {
    const transactionIndex = this.transactions.findIndex(
      (t) => t.id === transaction.id
    );

    if (transactionIndex >= 0) {
      this.transactions[transactionIndex] = {
        ...transaction,
        updatedAt: new Date(),
      };
      return this.transactions[transactionIndex];
    }

    return transaction;
  }

  async delete(id: string): Promise<void> {
    const transactionIndex = this.transactions.findIndex(
      (transaction) => transaction.id === id
    );
    if (transactionIndex >= 0) {
      this.transactions.splice(transactionIndex, 1);
    }
  }
}
