import { Subscription } from "../../../domain/entities/Subscription.js";
import { ISubscriptionsRepository } from "../../../domain/repositories/ISubscriptionsRepository.js";

interface ListUserSubscriptionsRequest {
  userId: string;
}

export class ListUserSubscriptionsUseCase {
  constructor(private subscriptionsRepository: ISubscriptionsRepository) {}

  async execute({
    userId,
  }: ListUserSubscriptionsRequest): Promise<Subscription[]> {
    const subscriptions = await this.subscriptionsRepository.findByUserId(
      userId
    );

    return subscriptions;
  }
}
