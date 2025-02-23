import { describe, it, expect, beforeEach } from "vitest";
import { ListUserTransactionsUseCase } from "../../../application/use-cases/transactions/ListUserTransactionsUseCase.js";
import { InMemoryTransactionsRepository } from "../../repositories/InMemoryTransactionsRepository.js";
import { InMemoryAccountsRepository } from "../../repositories/InMemoryAccountsRepository.js";
import { InMemoryCategoriesRepository } from "../../repositories/InMemoryCategoriesRepository.js";
import { TransactionType } from "../../../domain/entities/Transaction.js";

let transactionsRepository: InMemoryTransactionsRepository;
let accountsRepository: InMemoryAccountsRepository;
let categoriesRepository: InMemoryCategoriesRepository;
let sut: ListUserTransactionsUseCase;

describe("List User Transactions Use Case", () => {
  beforeEach(() => {
    transactionsRepository = new InMemoryTransactionsRepository();
    accountsRepository = new InMemoryAccountsRepository();
    categoriesRepository = new InMemoryCategoriesRepository();
    sut = new ListUserTransactionsUseCase(transactionsRepository);
  });

  it("should list only user transactions", async () => {
    const account = await accountsRepository.create({
      name: "Account",
      color: "#000000",
      userId: "user-1",
    });

    const category = await categoriesRepository.create({
      name: "Category",
      color: "#000000",
      userId: "user-1",
    });

    // Create transactions for user-1
    await transactionsRepository.create({
      name: "Transaction 1",
      date: new Date(),
      type: TransactionType.EXPENSE,
      amount: 100,
      categoryId: category.id,
      accountId: account.id,
      userId: "user-1",
      paymentMethod: "Credit Card",
    });

    await transactionsRepository.create({
      name: "Transaction 2",
      date: new Date(),
      type: TransactionType.INCOME,
      amount: 200,
      categoryId: category.id,
      accountId: account.id,
      userId: "user-1",
      paymentMethod: "Credit Card",
    });

    // Create transaction for another user
    await transactionsRepository.create({
      name: "Transaction 3",
      date: new Date(),
      type: TransactionType.EXPENSE,
      amount: 300,
      categoryId: category.id,
      accountId: account.id,
      userId: "user-2",
      paymentMethod: "Credit Card",
    });

    const transactions = await sut.execute({ userId: "user-1" });

    expect(transactions).toHaveLength(2);
    expect(transactions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Transaction 1", userId: "user-1" }),
        expect.objectContaining({ name: "Transaction 2", userId: "user-1" }),
      ])
    );
  });

  it("should return empty array when user has no transactions", async () => {
    const transactions = await sut.execute({
      userId: "user-without-transactions",
    });

    expect(transactions).toHaveLength(0);
    expect(transactions).toEqual([]);
  });
});
