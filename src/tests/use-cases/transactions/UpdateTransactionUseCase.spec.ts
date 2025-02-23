import { describe, it, expect, beforeEach } from "vitest";
import { UpdateTransactionUseCase } from "../../../application/use-cases/transactions/UpdateTransactionUseCase.js";
import { InMemoryTransactionsRepository } from "../../repositories/InMemoryTransactionsRepository.js";
import { InMemoryAccountsRepository } from "../../repositories/InMemoryAccountsRepository.js";
import { InMemoryCategoriesRepository } from "../../repositories/InMemoryCategoriesRepository.js";
import { TransactionType } from "../../../domain/entities/Transaction.js";
import { NotFoundError } from "../../../shared/errors/AppError.js";

let transactionsRepository: InMemoryTransactionsRepository;
let accountsRepository: InMemoryAccountsRepository;
let categoriesRepository: InMemoryCategoriesRepository;
let sut: UpdateTransactionUseCase;

describe("Update Transaction Use Case", () => {
  beforeEach(() => {
    transactionsRepository = new InMemoryTransactionsRepository();
    accountsRepository = new InMemoryAccountsRepository();
    categoriesRepository = new InMemoryCategoriesRepository();
    sut = new UpdateTransactionUseCase(
      transactionsRepository,
      categoriesRepository,
      accountsRepository
    );
  });

  it("should update an existing transaction", async () => {
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

    const transaction = await transactionsRepository.create({
      name: "Old Transaction",
      date: new Date(),
      type: TransactionType.EXPENSE,
      amount: 100,
      categoryId: category.id,
      accountId: account.id,
      userId: "user-1",
      paymentMethod: "Credit Card",
    });

    const updatedTransaction = await sut.execute({
      transactionId: transaction.id,
      userId: "user-1",
      name: "Updated Transaction",
      amount: 200,
    });

    expect(updatedTransaction.name).toBe("Updated Transaction");
    expect(updatedTransaction.amount).toBe(200);
    expect(updatedTransaction.categoryId).toBe(category.id);
    expect(updatedTransaction.accountId).toBe(account.id);
  });

  it("should update transaction category", async () => {
    const account = await accountsRepository.create({
      name: "Account",
      color: "#000000",
      userId: "user-1",
    });

    const oldCategory = await categoriesRepository.create({
      name: "Old Category",
      color: "#000000",
      userId: "user-1",
    });

    const transaction = await transactionsRepository.create({
      name: "Transaction",
      date: new Date(),
      type: TransactionType.EXPENSE,
      amount: 100,
      categoryId: oldCategory.id,
      accountId: account.id,
      userId: "user-1",
      paymentMethod: "Credit Card",
    });

    const newCategory = await categoriesRepository.create({
      name: "New Category",
      color: "#FFFFFF",
      userId: "user-1",
    });

    const updatedTransaction = await sut.execute({
      transactionId: transaction.id,
      userId: "user-1",
      categoryId: newCategory.id,
    });

    expect(updatedTransaction.categoryId).toBe(newCategory.id);
  });

  it("should not update a transaction from another user", async () => {
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

    const transaction = await transactionsRepository.create({
      name: "Transaction",
      date: new Date(),
      type: TransactionType.EXPENSE,
      amount: 100,
      categoryId: category.id,
      accountId: account.id,
      userId: "user-1",
      paymentMethod: "Credit Card",
    });

    await expect(() =>
      sut.execute({
        transactionId: transaction.id,
        userId: "user-2",
        name: "Updated Transaction",
      })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("should not update to a category from another user", async () => {
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

    const transaction = await transactionsRepository.create({
      name: "Transaction",
      date: new Date(),
      type: TransactionType.EXPENSE,
      amount: 100,
      categoryId: category.id,
      accountId: account.id,
      userId: "user-1",
      paymentMethod: "Credit Card",
    });

    const otherUserCategory = await categoriesRepository.create({
      name: "Other User Category",
      color: "#000000",
      userId: "user-2",
    });

    await expect(() =>
      sut.execute({
        transactionId: transaction.id,
        userId: "user-1",
        categoryId: otherUserCategory.id,
      })
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
