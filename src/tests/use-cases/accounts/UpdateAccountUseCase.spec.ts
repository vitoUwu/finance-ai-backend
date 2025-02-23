import { beforeEach, describe, expect, it } from "vitest";
import { UpdateAccountUseCase } from "../../../application/use-cases/accounts/UpdateAccountUseCase.js";
import { NotFoundError } from "../../../shared/errors/AppError.js";
import { InMemoryTransactionsRepository } from "../../../tests/repositories/InMemoryTransactionsRepository.js";
import { InMemoryAccountsRepository } from "../../repositories/InMemoryAccountsRepository.js";

let accountsRepository: InMemoryAccountsRepository;
let transactionsRepository: InMemoryTransactionsRepository;
let sut: UpdateAccountUseCase;

describe("Update Account Use Case", () => {
  beforeEach(() => {
    accountsRepository = new InMemoryAccountsRepository();
    transactionsRepository = new InMemoryTransactionsRepository();
    sut = new UpdateAccountUseCase(accountsRepository, transactionsRepository);
  });

  it("should update an existing account", async () => {
    const account = await accountsRepository.create({
      name: "Old Name",
      color: "#000000",
      userId: "user-1",
    });

    const updatedAccount = await sut.execute({
      accountId: account.id,
      userId: "user-1",
      name: "New Name",
      color: "#FFFFFF",
    });

    expect(updatedAccount.name).toBe("New Name");
    expect(updatedAccount.color).toBe("#FFFFFF");
  });

  it("should not update an account from another user", async () => {
    const account = await accountsRepository.create({
      name: "Old Name",
      color: "#000000",
      userId: "user-1",
    });

    await expect(() =>
      sut.execute({
        accountId: account.id,
        userId: "user-2",
        name: "New Name",
      })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("should not update a non-existing account", async () => {
    await expect(() =>
      sut.execute({
        accountId: "non-existing-id",
        userId: "user-1",
        name: "New Name",
      })
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
