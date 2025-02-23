import { Installment } from "../../../domain/entities/Installment.js";
import { IInstallmentsRepository } from "../../../domain/repositories/IInstallmentsRepository.js";
import { AppError } from "../../../shared/errors/AppError.js";

interface CreateInstallmentRequest {
  name: string;
  details?: string;
  cost: number;
  paidAt: Date;
  totalInstallments: number;
  remainingInstallments: number;
  accountId: string;
  categoryId: string;
  paymentMethod: string;
  userId: string;
}

export class CreateInstallmentUseCase {
  constructor(private installmentsRepository: IInstallmentsRepository) {}

  async execute(request: CreateInstallmentRequest): Promise<Installment> {
    // Validar nome do parcelamento
    if (request.name.trim().length < 3) {
      throw new AppError("Installment name must be at least 3 characters long");
    }

    // Validar detalhes opcionais
    if (request.details && request.details.trim().length > 500) {
      throw new AppError("Installment details cannot exceed 500 characters");
    }

    // Validar valor mínimo
    if (request.cost < 0.01) {
      throw new AppError("Installment cost must be at least 0.01");
    }

    // Validar número de parcelas
    if (request.totalInstallments < 2) {
      throw new AppError("Total installments must be at least 2");
    }

    if (request.totalInstallments > 48) {
      throw new AppError("Total installments cannot exceed 48");
    }

    if (request.remainingInstallments > request.totalInstallments) {
      throw new AppError(
        "Remaining installments cannot be greater than total installments"
      );
    }

    if (request.remainingInstallments < 0) {
      throw new AppError("Remaining installments cannot be negative");
    }

    // Validar data de pagamento
    const currentDate = new Date();
    const paidAtDate = new Date(request.paidAt);
    const maxPastDate = new Date();
    maxPastDate.setFullYear(maxPastDate.getFullYear() - 1); // Máximo 1 ano atrás

    if (paidAtDate > currentDate) {
      throw new AppError("Payment date cannot be in the future");
    }

    if (paidAtDate < maxPastDate) {
      throw new AppError("Payment date cannot be more than 1 year in the past");
    }

    // Validar valor mínimo por parcela
    const installmentValue = request.cost / request.totalInstallments;
    if (installmentValue < 0.01) {
      throw new AppError(
        "Each installment value must be at least 0.01. Increase the total cost or reduce the number of installments"
      );
    }

    // Verificar limite de parcelamentos ativos por usuário
    const userInstallments = await this.installmentsRepository.findByUserId(
      request.userId
    );
    const maxActiveInstallments = 10;
    const activeInstallments = userInstallments.filter(
      (installment) => installment.remainingInstallments > 0
    );

    if (activeInstallments.length >= maxActiveInstallments) {
      throw new AppError(
        `You can have a maximum of ${maxActiveInstallments} active installments`
      );
    }

    const installment = await this.installmentsRepository.create(request);

    return installment;
  }
}
