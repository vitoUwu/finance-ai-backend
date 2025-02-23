import {
  Transaction,
  TransactionType,
} from "../../domain/entities/Transaction.js";
import { RecurrenceType } from "../../domain/entities/Subscription.js";
import { ITransactionsRepository } from "../../domain/repositories/ITransactionsRepository.js";
import { ISubscriptionsRepository } from "../../domain/repositories/ISubscriptionsRepository.js";

export class RecurringTransactionsService {
  constructor(
    private transactionsRepository: ITransactionsRepository,
    private subscriptionsRepository: ISubscriptionsRepository
  ) {}

  private calculateNextPaymentDate(
    currentDate: Date,
    recurrence: RecurrenceType
  ): Date {
    const nextDate = new Date(currentDate);

    switch (recurrence) {
      case RecurrenceType.WEEKLY:
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case RecurrenceType.BIWEEKLY:
        nextDate.setDate(nextDate.getDate() + 14);
        break;
      case RecurrenceType.MONTHLY:
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case RecurrenceType.YEARLY:
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
    }

    return nextDate;
  }

  async generateUpcomingTransactions(userId: string): Promise<void> {
    const subscriptions = await this.subscriptionsRepository.findByUserId(
      userId
    );
    const today = new Date();
    const threeMonthsFromNow = new Date();
    threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

    for (const subscription of subscriptions) {
      // Encontrar a última transação desta assinatura
      const transactions = await this.transactionsRepository.findByUserId(
        userId
      );
      const lastTransaction = transactions
        .filter((t) => t.subscriptionId === subscription.id)
        .sort((a, b) => b.date.getTime() - a.date.getTime())[0];

      let nextDate = lastTransaction
        ? this.calculateNextPaymentDate(
            lastTransaction.date,
            subscription.recurrence
          )
        : new Date(subscription.paidAt);

      // Gerar transações para os próximos 3 meses
      while (nextDate <= threeMonthsFromNow) {
        if (nextDate > today) {
          await this.transactionsRepository.create({
            name: subscription.name,
            details: subscription.details || undefined,
            date: nextDate,
            type: TransactionType.EXPENSE,
            amount: subscription.cost,
            categoryId: subscription.categoryId,
            accountId: subscription.accountId,
            paymentMethod: subscription.paymentMethod,
            userId: subscription.userId,
            subscriptionId: subscription.id,
          });
        }

        nextDate = this.calculateNextPaymentDate(
          nextDate,
          subscription.recurrence
        );
      }
    }
  }
}
