import { Account } from "../entities/Account.js";

export interface IAccountsRepository {
  findById(id: string): Promise<Account | null>;
  findByUserId(userId: string): Promise<Account[]>;
  create(
    data: Omit<Account, "id" | "createdAt" | "updatedAt">
  ): Promise<Account>;
  save(account: Account): Promise<Account>;
  delete(id: string): Promise<void>;
}
