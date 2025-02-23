import { describe, it, expect, beforeEach } from "vitest";
import { ListUserAccountsUseCase } from "../../../application/use-cases/accounts/ListUserAccountsUseCase.js";
import { InMemoryAccountsRepository } from "../../repositories/InMemoryAccountsRepository.js";

let accountsRepository: InMemoryAccountsRepository;
let sut: ListUserAccountsUseCase;

describe("List User Accounts Use Case", () => {
  beforeEach(() => {
    accountsRepository = new InMemoryAccountsRepository();
    sut = new ListUserAccountsUseCase(accountsRepository);
  });

  it("should list only user accounts", async () => {
    // Create accounts for user-1
    await accountsRepository.create({
      name: "Account 1",
      color: "#000000",
      userId: "user-1",
    });

    await accountsRepository.create({
      name: "Account 2",
      color: "#FFFFFF",
      userId: "user-1",
    });

    // Create account for another user
    await accountsRepository.create({
      name: "Account 3",
      color: "#FF0000",
      userId: "user-2",
    });

    const accounts = await sut.execute({ userId: "user-1" });

    expect(accounts).toHaveLength(2);
    expect(accounts).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "Account 1", userId: "user-1" }),
        expect.objectContaining({ name: "Account 2", userId: "user-1" }),
      ])
    );
  });

  it("should return empty array when user has no accounts", async () => {
    const accounts = await sut.execute({ userId: "user-without-accounts" });

    expect(accounts).toHaveLength(0);
    expect(accounts).toEqual([]);
  });
});
