import { IAccountsRepository } from "../../../domain/repositories/IAccountsRepository.js";
import { NotFoundError } from "../../../shared/errors/AppError.js";

interface DeleteAccountRequest {
  accountId: string;
  userId: string;
}

export class DeleteAccountUseCase {
  constructor(private accountsRepository: IAccountsRepository) {}

  async execute({ accountId, userId }: DeleteAccountRequest): Promise<void> {
    const account = await this.accountsRepository.findById(accountId);

    if (!account) {
      throw new NotFoundError("Account");
    }

    if (account.userId !== userId) {
      throw new NotFoundError("Account");
    }

    await this.accountsRepository.delete(accountId);
  }
}
