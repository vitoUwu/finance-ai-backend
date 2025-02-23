import {
  Subscription,
  RecurrenceType,
} from "../../../domain/entities/Subscription.js";
import { ISubscriptionsRepository } from "../../../domain/repositories/ISubscriptionsRepository.js";
import { ITransactionsRepository } from "../../../domain/repositories/ITransactionsRepository.js";
import { NotFoundError, AppError } from "../../../shared/errors/AppError.js";

interface UpdateSubscriptionRequest {
  subscriptionId: string;
  userId: string;
  name?: string;
  details?: string;
  cost?: number;
  recurrence?: RecurrenceType;
  paidAt?: Date;
}

export class UpdateSubscriptionUseCase {
  constructor(
    private subscriptionsRepository: ISubscriptionsRepository,
    private transactionsRepository: ITransactionsRepository
  ) {}

  async execute({
    subscriptionId,
    userId,
    ...data
  }: UpdateSubscriptionRequest): Promise<Subscription> {
    const subscription = await this.subscriptionsRepository.findById(
      subscriptionId
    );

    if (!subscription) {
      throw new NotFoundError("Subscription");
    }

    if (subscription.userId !== userId) {
      throw new NotFoundError("Subscription");
    }

    // Validar nome da assinatura
    if (data.name) {
      if (data.name.trim().length < 3) {
        throw new AppError(
          "Subscription name must be at least 3 characters long"
        );
      }

      // Verificar se já existe uma assinatura com esse nome para o usuário
      const subscriptions = await this.subscriptionsRepository.findByUserId(
        userId
      );
      const subscriptionWithSameName = subscriptions.find(
        (sub) => sub.name === data.name && sub.id !== subscriptionId
      );

      if (subscriptionWithSameName) {
        throw new AppError("You already have a subscription with this name");
      }
    }

    // Validar detalhes opcionais
    if (data.details && data.details.trim().length > 500) {
      throw new AppError("Subscription details cannot exceed 500 characters");
    }

    // Validar valor mínimo
    if (data.cost !== undefined) {
      if (data.cost < 0.01) {
        throw new AppError("Subscription cost must be at least 0.01");
      }

      // Verificar se existem transações futuras
      const transactions = await this.transactionsRepository.findByUserId(
        userId
      );
      const futureTransactions = transactions.filter(
        (transaction) =>
          transaction.subscriptionId === subscriptionId &&
          transaction.date > new Date()
      );

      if (futureTransactions.length > 0) {
        throw new AppError(
          "Cannot update subscription cost because it has future transactions scheduled"
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
          transaction.subscriptionId === subscriptionId &&
          transaction.date > new Date()
      );

      if (futureTransactions.length > 0) {
        throw new AppError(
          "Cannot update payment date because it has future transactions scheduled"
        );
      }
    }

    // Validar alteração de recorrência
    if (data.recurrence && data.recurrence !== subscription.recurrence) {
      // Verificar se existem transações futuras ao alterar a recorrência
      const transactions = await this.transactionsRepository.findByUserId(
        userId
      );
      const futureTransactions = transactions.filter(
        (transaction) =>
          transaction.subscriptionId === subscriptionId &&
          transaction.date > new Date()
      );

      if (futureTransactions.length > 0) {
        throw new AppError(
          "Cannot update recurrence because it has future transactions scheduled"
        );
      }
    }

    const updatedSubscription = await this.subscriptionsRepository.save({
      ...subscription,
      ...data,
    });

    return updatedSubscription;
  }
}
