import { Transaction } from "../entities/Transaction.js";

export interface ITransactionsRepository {
  findById(id: string): Promise<Transaction | null>;
  findByUserId(userId: string): Promise<Transaction[]>;
  create(
    data: Omit<Transaction, "id" | "createdAt" | "updatedAt">
  ): Promise<Transaction>;
  save(transaction: Transaction): Promise<Transaction>;
  delete(id: string): Promise<void>;
  findByDateRange(
    // userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Transaction[]>;
}
