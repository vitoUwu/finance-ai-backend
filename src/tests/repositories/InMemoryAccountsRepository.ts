import { Account } from "../../domain/entities/Account.js";
import { IAccountsRepository } from "../../domain/repositories/IAccountsRepository.js";

export class InMemoryAccountsRepository implements IAccountsRepository {
  private accounts: Account[] = [];

  async findById(id: string): Promise<Account | null> {
    const account = this.accounts.find((account) => account.id === id);
    return account ?? null;
  }

  async findByUserId(userId: string): Promise<Account[]> {
    return this.accounts.filter((account) => account.userId === userId);
  }

  async create(
    data: Omit<Account, "id" | "createdAt" | "updatedAt">
  ): Promise<Account> {
    const account: Account = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
      ...data,
    };

    this.accounts.push(account);
    return account;
  }

  async save(account: Account): Promise<Account> {
    const accountIndex = this.accounts.findIndex((a) => a.id === account.id);

    if (accountIndex >= 0) {
      this.accounts[accountIndex] = {
        ...account,
        updatedAt: new Date(),
      };
      return this.accounts[accountIndex];
    }

    return account;
  }

  async delete(id: string): Promise<void> {
    const accountIndex = this.accounts.findIndex(
      (account) => account.id === id
    );
    if (accountIndex >= 0) {
      this.accounts.splice(accountIndex, 1);
    }
  }
}
