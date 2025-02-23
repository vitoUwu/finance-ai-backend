import { describe, it, expect, beforeEach } from "vitest";
import { DeleteAccountUseCase } from "../../../application/use-cases/accounts/DeleteAccountUseCase.js";
import { InMemoryAccountsRepository } from "../../repositories/InMemoryAccountsRepository.js";
import { NotFoundError } from "../../../shared/errors/AppError.js";

let accountsRepository: InMemoryAccountsRepository;
let sut: DeleteAccountUseCase;

describe("Delete Account Use Case", () => {
  beforeEach(() => {
    accountsRepository = new InMemoryAccountsRepository();
    sut = new DeleteAccountUseCase(accountsRepository);
  });

  it("should delete an existing account", async () => {
    const account = await accountsRepository.create({
      name: "Account to Delete",
      color: "#000000",
      userId: "user-1",
    });

    await sut.execute({
      accountId: account.id,
      userId: "user-1",
    });

    const deletedAccount = await accountsRepository.findById(account.id);
    expect(deletedAccount).toBeNull();
  });

  it("should not delete an account from another user", async () => {
    const account = await accountsRepository.create({
      name: "Account to Delete",
      color: "#000000",
      userId: "user-1",
    });

    await expect(() =>
      sut.execute({
        accountId: account.id,
        userId: "user-2",
      })
    ).rejects.toBeInstanceOf(NotFoundError);
  });

  it("should not delete a non-existing account", async () => {
    await expect(() =>
      sut.execute({
        accountId: "non-existing-id",
        userId: "user-1",
      })
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
