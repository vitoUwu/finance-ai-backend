import { ISubscriptionsRepository } from "../../../domain/repositories/ISubscriptionsRepository.js";
import { ITransactionsRepository } from "../../../domain/repositories/ITransactionsRepository.js";
import { NotFoundError, AppError } from "../../../shared/errors/AppError.js";

interface DeleteSubscriptionRequest {
  subscriptionId: string;
  userId: string;
}

export class DeleteSubscriptionUseCase {
  constructor(
    private subscriptionsRepository: ISubscriptionsRepository,
    private transactionsRepository: ITransactionsRepository
  ) {}

  async execute({
    subscriptionId,
    userId,
  }: DeleteSubscriptionRequest): Promise<void> {
    const subscription = await this.subscriptionsRepository.findById(
      subscriptionId
    );

    if (!subscription) {
      throw new NotFoundError("Subscription");
    }

    if (subscription.userId !== userId) {
      throw new NotFoundError("Subscription");
    }

    // Verificar se existem transações vinculadas
    const transactions = await this.transactionsRepository.findByUserId(userId);
    const hasTransactions = transactions.some(
      (transaction) => transaction.subscriptionId === subscriptionId
    );

    if (hasTransactions) {
      throw new AppError(
        "Cannot delete subscription because it has associated transactions"
      );
    }

    await this.subscriptionsRepository.delete(subscriptionId);
  }
}
