import { describe, it, expect, beforeEach } from "vitest";
import { CreateTransactionUseCase } from "../../../application/use-cases/transactions/CreateTransactionUseCase.js";
import { InMemoryTransactionsRepository } from "../../repositories/InMemoryTransactionsRepository.js";
import { InMemoryAccountsRepository } from "../../repositories/InMemoryAccountsRepository.js";
import { InMemoryCategoriesRepository } from "../../repositories/InMemoryCategoriesRepository.js";
import { TransactionType } from "../../../domain/entities/Transaction.js";
import { NotFoundError } from "../../../shared/errors/AppError.js";

let transactionsRepository: InMemoryTransactionsRepository;
let accountsRepository: InMemoryAccountsRepository;
let categoriesRepository: InMemoryCategoriesRepository;
let sut: CreateTransactionUseCase;

describe("Create Transaction Use Case", () => {
  beforeEach(() => {
    transactionsRepository = new InMemoryTransactionsRepository();
    accountsRepository = new InMemoryAccountsRepository();
    categoriesRepository = new InMemoryCategoriesRepository();
    sut = new CreateTransactionUseCase(
      transactionsRepository,
      categoriesRepository,
      accountsRepository
    );
  });

  it("should create a new transaction", async () => {
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

    const transaction = await sut.execute({
      name: "New Transaction",
      details: "Transaction details",
      date: new Date(),
      type: TransactionType.EXPENSE,
      amount: 100,
      categoryId: category.id,
      accountId: account.id,
      userId: "user-1",
      paymentMethod: "pix",
    });

    expect(transaction.id).toBeDefined();
    expect(transaction.name).toBe("New Transaction");
    expect(transaction.amount).toBe(100);
    expect(transaction.categoryId).toBe(category.id);
    expect(transaction.accountId).toBe(account.id);
  });

  it("should not create a transaction with non-existing category", async () => {
    const account = await accountsRepository.create({
      name: "Account",
      color: "#000000",
      userId: "user-1",
    });

    await expect(() =>
      sut.execute({
        name: "New Transaction",
        date: new Date(),
        type: TransactionType.EXPENSE,
        amount: 100,
        categoryId: "non-existing-category",
        accountId: account.id,
        userId: "user-1",
        paymentMethod: "pix",
      })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("should not create a transaction with non-existing account", async () => {
    const category = await categoriesRepository.create({
      name: "Category",
      color: "#000000",
      userId: "user-1",
    });

    await expect(() =>
      sut.execute({
        name: "New Transaction",
        date: new Date(),
        type: TransactionType.EXPENSE,
        amount: 100,
        categoryId: category.id,
        accountId: "non-existing-account",
        userId: "user-1",
        paymentMethod: "pix",
      })
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
