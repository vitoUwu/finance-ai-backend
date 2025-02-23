import { IInstallmentsRepository } from "../../domain/repositories/IInstallmentsRepository.js";
import { ITransactionsRepository } from "../../domain/repositories/ITransactionsRepository.js";
import { TransactionType } from "../../domain/entities/Transaction.js";

export class InstallmentsService {
  constructor(
    private installmentsRepository: IInstallmentsRepository,
    private transactionsRepository: ITransactionsRepository
  ) {}

  private calculateNextInstallmentDate(currentDate: Date): Date {
    const nextDate = new Date(currentDate);
    nextDate.setMonth(nextDate.getMonth() + 1);
    return nextDate;
  }

  async updateRemainingInstallments(userId: string): Promise<void> {
    const installments = await this.installmentsRepository.findByUserId(userId);
    const today = new Date();

    for (const installment of installments) {
      if (installment.remainingInstallments === 0) continue;

      // Encontrar a última transação deste parcelamento
      const transactions = await this.transactionsRepository.findByUserId(
        userId
      );
      const lastTransaction = transactions
        .filter((t) => t.installmentId === installment.id)
        .sort((a, b) => b.date.getTime() - a.date.getTime())[0];

      let nextDate = lastTransaction
        ? this.calculateNextInstallmentDate(lastTransaction.date)
        : new Date(installment.paidAt);

      // Gerar transações para as parcelas restantes
      const installmentValue = installment.cost / installment.totalInstallments;

      while (installment.remainingInstallments > 0 && nextDate <= today) {
        await this.transactionsRepository.create({
          name: `${installment.name} (${
            installment.totalInstallments -
            installment.remainingInstallments +
            1
          }/${installment.totalInstallments})`,
          details: installment.details,
          date: nextDate,
          type: TransactionType.EXPENSE,
          amount: installmentValue,
          categoryId: "", // Precisa definir uma categoria padrão
          accountId: "", // Precisa definir uma conta padrão
          userId: installment.userId,
          installmentId: installment.id,
          paymentMethod: "Credit Card",
        });

        // Atualizar o número de parcelas restantes
        await this.installmentsRepository.save({
          ...installment,
          remainingInstallments: installment.remainingInstallments - 1,
        });

        installment.remainingInstallments--;
        nextDate = this.calculateNextInstallmentDate(nextDate);
      }
    }
  }
}
