import { Account } from "../../../domain/entities/Account.js";
import { IAccountsRepository } from "../../../domain/repositories/IAccountsRepository.js";

interface ListUserAccountsRequest {
  userId: string;
}

export class ListUserAccountsUseCase {
  constructor(private accountsRepository: IAccountsRepository) {}

  async execute({ userId }: ListUserAccountsRequest): Promise<Account[]> {
    const accounts = await this.accountsRepository.findByUserId(userId);

    return accounts;
  }
}
