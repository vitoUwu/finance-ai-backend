import { Installment } from "../../../domain/entities/Installment.js";
import { IInstallmentsRepository } from "../../../domain/repositories/IInstallmentsRepository.js";
import { ITransactionsRepository } from "../../../domain/repositories/ITransactionsRepository.js";
import { NotFoundError, AppError } from "../../../shared/errors/AppError.js";

interface UpdateInstallmentRequest {
  installmentId: string;
  userId: string;
  name?: string;
  details?: string;
  cost?: number;
  paidAt?: Date;
  totalInstallments?: number;
  remainingInstallments?: number;
}

export class UpdateInstallmentUseCase {
  constructor(
    private installmentsRepository: IInstallmentsRepository,
    private transactionsRepository: ITransactionsRepository
  ) {}

  async execute({
    installmentId,
    userId,
    totalInstallments,
    remainingInstallments,
    ...data
  }: UpdateInstallmentRequest): Promise<Installment> {
    const installment = await this.installmentsRepository.findById(
      installmentId
    );

    if (!installment) {
      throw new NotFoundError("Installment");
    }

    if (installment.userId !== userId) {
      throw new NotFoundError("Installment");
    }

    // Validar nome do parcelamento
    if (data.name) {
      if (data.name.trim().length < 3) {
        throw new AppError(
          "Installment name must be at least 3 characters long"
        );
      }

      // Verificar se já existe um parcelamento com esse nome para o usuário
      const installments = await this.installmentsRepository.findByUserId(
        userId
      );
      const installmentWithSameName = installments.find(
        (inst) => inst.name === data.name && inst.id !== installmentId
      );

      if (installmentWithSameName) {
        throw new AppError("You already have an installment with this name");
      }
    }

    // Validar detalhes opcionais
    if (data.details && data.details.trim().length > 500) {
      throw new AppError("Installment details cannot exceed 500 characters");
    }

    // Validar valor mínimo
    if (data.cost !== undefined) {
      if (data.cost < 0.01) {
        throw new AppError("Installment cost must be at least 0.01");
      }

      // Verificar se existem transações futuras
      const transactions = await this.transactionsRepository.findByUserId(
        userId
      );
      const futureTransactions = transactions.filter(
        (transaction) =>
          transaction.installmentId === installmentId &&
          transaction.date > new Date()
      );

      if (futureTransactions.length > 0) {
        throw new AppError(
          "Cannot update installment cost because it has future transactions scheduled"
        );
      }

      // Validar valor mínimo por parcela
      const newTotal = totalInstallments ?? installment.totalInstallments;
      const installmentValue = data.cost / newTotal;
      if (installmentValue < 0.01) {
        throw new AppError(
          "Each installment value must be at least 0.01. Increase the total cost or reduce the number of installments"
        );
      }
    }

    // Validar data de pagamento
    if (data.paidAt) {
      const currentDate = new Date();
      const paidAtDate = new Date(data.paidAt);
      const maxPastDate = new Date();
      maxPastDate.setFullYear(maxPastDate.getFullYear() - 1);

      if (paidAtDate > currentDate) {
        throw new AppError("Payment date cannot be in the future");
      }

      if (paidAtDate < maxPastDate) {
        throw new AppError(
          "Payment date cannot be more than 1 year in the past"
        );
      }

      // Verificar se existem transações futuras ao alterar a data
      const transactions = await this.transactionsRepository.findByUserId(
        userId
      );
      const futureTransactions = transactions.filter(
        (transaction) =>
          transaction.installmentId === installmentId &&
          transaction.date > new Date()
      );

      if (futureTransactions.length > 0) {
        throw new AppError(
          "Cannot update payment date because it has future transactions scheduled"
        );
      }
    }

    // Validar número de parcelas
    if (totalInstallments !== undefined) {
      if (totalInstallments < 2) {
        throw new AppError("Total installments must be at least 2");
      }

      if (totalInstallments > 48) {
        throw new AppError("Total installments cannot exceed 48");
      }

      const newRemaining =
        remainingInstallments ?? installment.remainingInstallments;
      if (newRemaining > totalInstallments) {
        throw new AppError(
          "Remaining installments cannot be greater than total installments"
        );
      }

      // Verificar se existem transações futuras ao alterar o total de parcelas
      const transactions = await this.transactionsRepository.findByUserId(
        userId
      );
      const futureTransactions = transactions.filter(
        (transaction) =>
          transaction.installmentId === installmentId &&
          transaction.date > new Date()
      );

      if (futureTransactions.length > 0) {
        throw new AppError(
          "Cannot update total installments because it has future transactions scheduled"
        );
      }
    }

    // Validar parcelas restantes
    if (remainingInstallments !== undefined) {
      if (remainingInstallments < 0) {
        throw new AppError("Remaining installments cannot be negative");
      }

      const newTotal = totalInstallments ?? installment.totalInstallments;
      if (remainingInstallments > newTotal) {
        throw new AppError(
          "Remaining installments cannot be greater than total installments"
        );
      }
    }

    const updatedInstallment = await this.installmentsRepository.save({
      ...installment,
      ...data,
      totalInstallments: totalInstallments ?? installment.totalInstallments,
      remainingInstallments:
        remainingInstallments ?? installment.remainingInstallments,
    });

    return updatedInstallment;
  }
}
