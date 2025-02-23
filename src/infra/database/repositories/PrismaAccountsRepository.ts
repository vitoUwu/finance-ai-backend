import { Account } from "../../../domain/entities/Account.js";
import { IAccountsRepository } from "../../../domain/repositories/IAccountsRepository.js";
import { prisma } from "../prisma.js";

export class PrismaAccountsRepository implements IAccountsRepository {
  async findById(id: string): Promise<Account | null> {
    const account = await prisma.account.findUnique({
      where: { id },
    });

    return account;
  }

  async findByUserId(userId: string): Promise<Account[]> {
    const accounts = await prisma.account.findMany({
      where: { userId },
    });

    return accounts;
  }

  async create(
    data: Omit<Account, "id" | "createdAt" | "updatedAt">
  ): Promise<Account> {
    const account = await prisma.account.create({
      data,
    });

    return account;
  }

  async save(account: Account): Promise<Account> {
    const updatedAccount = await prisma.account.update({
      where: { id: account.id },
      data: account,
    });

    return updatedAccount;
  }

  async delete(id: string): Promise<void> {
    await prisma.account.delete({
      where: { id },
    });
  }
}
