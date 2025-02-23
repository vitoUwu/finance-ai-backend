import { describe, it, expect, beforeEach } from "vitest";
import { DeleteTransactionUseCase } from "../../../application/use-cases/transactions/DeleteTransactionUseCase.js";
import { InMemoryTransactionsRepository } from "../../repositories/InMemoryTransactionsRepository.js";
import { InMemoryAccountsRepository } from "../../repositories/InMemoryAccountsRepository.js";
import { InMemoryCategoriesRepository } from "../../repositories/InMemoryCategoriesRepository.js";
import { TransactionType } from "../../../domain/entities/Transaction.js";
import { NotFoundError } from "../../../shared/errors/AppError.js";

let transactionsRepository: InMemoryTransactionsRepository;
let accountsRepository: InMemoryAccountsRepository;
let categoriesRepository: InMemoryCategoriesRepository;
let sut: DeleteTransactionUseCase;

describe("Delete Transaction Use Case", () => {
  beforeEach(() => {
    transactionsRepository = new InMemoryTransactionsRepository();
    accountsRepository = new InMemoryAccountsRepository();
    categoriesRepository = new InMemoryCategoriesRepository();
    sut = new DeleteTransactionUseCase(transactionsRepository);
  });

  it("should delete an existing transaction", async () => {
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
      name: "Transaction to Delete",
      date: new Date(),
      type: TransactionType.EXPENSE,
      amount: 100,
      categoryId: category.id,
      accountId: account.id,
      userId: "user-1",
      paymentMethod: "pix",
    });

    await sut.execute({
      transactionId: transaction.id,
      userId: "user-1",
    });

    const deletedTransaction = await transactionsRepository.findById(
      transaction.id
    );
    expect(deletedTransaction).toBeNull();
  });

  it("should not delete a transaction from another user", async () => {
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
      paymentMethod: "pix",
    });

    await expect(() =>
      sut.execute({
        transactionId: transaction.id,
        userId: "user-2",
      })
    ).rejects.toBeInstanceOf(NotFoundError);

    const notDeletedTransaction = await transactionsRepository.findById(
      transaction.id
    );
    expect(notDeletedTransaction).toBeTruthy();
  });

  it("should not delete a non-existing transaction", async () => {
    await expect(() =>
      sut.execute({
        transactionId: "non-existing-id",
        userId: "user-1",
      })
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
