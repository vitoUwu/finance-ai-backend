import { describe, it, expect, beforeEach } from "vitest";
import { CreateAccountUseCase } from "../../../application/use-cases/accounts/CreateAccountUseCase.js";
import { InMemoryAccountsRepository } from "../../repositories/InMemoryAccountsRepository.js";

let accountsRepository: InMemoryAccountsRepository;
let sut: CreateAccountUseCase;

describe("Create Account Use Case", () => {
  beforeEach(() => {
    accountsRepository = new InMemoryAccountsRepository();
    sut = new CreateAccountUseCase(accountsRepository);
  });

  it("should create a new account", async () => {
    const account = await sut.execute({
      name: "Main Account",
      color: "#FF0000",
      userId: "user-1",
    });

    expect(account.id).toBeDefined();
    expect(account.name).toBe("Main Account");
    expect(account.color).toBe("#FF0000");
    expect(account.userId).toBe("user-1");
  });
});
