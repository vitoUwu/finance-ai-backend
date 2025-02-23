import { Transaction as PrismaTransaction } from "@prisma/client";
import {
  Transaction,
  TransactionType,
} from "../../../domain/entities/Transaction.js";
import { ITransactionsRepository } from "../../../domain/repositories/ITransactionsRepository.js";
import { prisma } from "../prisma.js";

export class PrismaTransactionsRepository implements ITransactionsRepository {
  private transactionToEntity(transaction: PrismaTransaction): Transaction {
    return {
      ...transaction,
      amount: transaction.amount.toNumber(),
      details: transaction.details || undefined,
      type: transaction.type as TransactionType,
      subscriptionId: transaction.subscriptionId || undefined,
      installmentId: transaction.installmentId || undefined,
    };
  }

  async findById(id: string): Promise<Transaction | null> {
    const transaction = await prisma.transaction.findUnique({
      where: { id },
    });

    return transaction ? this.transactionToEntity(transaction) : null;
  }

  async findByUserId(userId: string): Promise<Transaction[]> {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });

    return transactions.map(this.transactionToEntity);
  }

  async create(
    data: Omit<Transaction, "id" | "createdAt" | "updatedAt">
  ): Promise<Transaction> {
    const transaction = await prisma.transaction.create({
      data,
    });

    return this.transactionToEntity(transaction);
  }

  async save(transaction: Transaction): Promise<Transaction> {
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transaction.id },
      data: transaction,
    });

    return this.transactionToEntity(updatedTransaction);
  }

  async delete(id: string): Promise<void> {
    await prisma.transaction.delete({
      where: { id },
    });
  }

  async findByDateRange(
    startDate: Date,
    endDate: Date
  ): Promise<Transaction[]> {
    const transactions = await prisma.transaction.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
    return transactions.map(this.transactionToEntity);
  }
}
