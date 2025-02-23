import { Account } from "../../../domain/entities/Account.js";
import { IAccountsRepository } from "../../../domain/repositories/IAccountsRepository.js";
import { ITransactionsRepository } from "../../../domain/repositories/ITransactionsRepository.js";
import { NotFoundError, AppError } from "../../../shared/errors/AppError.js";

interface UpdateAccountRequest {
  accountId: string;
  userId: string;
  name?: string;
  color?: string;
}

export class UpdateAccountUseCase {
  constructor(
    private accountsRepository: IAccountsRepository,
    private transactionsRepository: ITransactionsRepository
  ) {}

  async execute({
    accountId,
    userId,
    ...data
  }: UpdateAccountRequest): Promise<Account> {
    const account = await this.accountsRepository.findById(accountId);

    if (!account) {
      throw new NotFoundError("Account");
    }

    if (account.userId !== userId) {
      throw new NotFoundError("Account");
    }

    // Validar nome da conta
    if (data.name) {
      if (data.name.trim().length < 3) {
        throw new AppError("Account name must be at least 3 characters long");
      }

      // Verificar se já existe uma conta com esse nome para o usuário
      const accounts = await this.accountsRepository.findByUserId(userId);
      const accountWithSameName = accounts.find(
        (acc) => acc.name === data.name && acc.id !== accountId
      );

      if (accountWithSameName) {
        throw new AppError("You already have an account with this name");
      }
    }

    // Validar cor
    if (data.color) {
      const hexColorRegex = /^#[0-9A-F]{6}$/i;
      if (!hexColorRegex.test(data.color)) {
        throw new AppError(
          "Invalid color format. Use hexadecimal (e.g., #FF0000)"
        );
      }
    }

    const updatedAccount = await this.accountsRepository.save({
      ...account,
      ...data,
    });

    return updatedAccount;
  }
}
