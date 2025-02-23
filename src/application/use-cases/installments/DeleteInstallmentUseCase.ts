import { IInstallmentsRepository } from "../../../domain/repositories/IInstallmentsRepository.js";
import { ITransactionsRepository } from "../../../domain/repositories/ITransactionsRepository.js";
import { NotFoundError, AppError } from "../../../shared/errors/AppError.js";

interface DeleteInstallmentRequest {
  installmentId: string;
  userId: string;
}

export class DeleteInstallmentUseCase {
  constructor(
    private installmentsRepository: IInstallmentsRepository,
    private transactionsRepository: ITransactionsRepository
  ) {}

  async execute({
    installmentId,
    userId,
  }: DeleteInstallmentRequest): Promise<void> {
    const installment = await this.installmentsRepository.findById(
      installmentId
    );

    if (!installment) {
      throw new NotFoundError("Installment");
    }

    if (installment.userId !== userId) {
      throw new NotFoundError("Installment");
    }

    // Verificar se existem transações vinculadas
    const transactions = await this.transactionsRepository.findByUserId(userId);
    const hasTransactions = transactions.some(
      (transaction) => transaction.installmentId === installmentId
    );

    if (hasTransactions) {
      throw new AppError(
        "Cannot delete installment because it has associated transactions"
      );
    }

    await this.installmentsRepository.delete(installmentId);
  }
}
