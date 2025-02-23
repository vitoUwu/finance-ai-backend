import { Account } from "../../../domain/entities/Account.js";
import { IAccountsRepository } from "../../../domain/repositories/IAccountsRepository.js";

interface CreateAccountRequest {
  name: string;
  color: string;
  userId: string;
}

export class CreateAccountUseCase {
  constructor(private accountsRepository: IAccountsRepository) {}

  async execute(request: CreateAccountRequest): Promise<Account> {
    const account = await this.accountsRepository.create(request);

    return account;
  }
}
