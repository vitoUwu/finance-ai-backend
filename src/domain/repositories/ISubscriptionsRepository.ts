import { Subscription } from "../entities/Subscription.js";

export interface ISubscriptionsRepository {
  findById(id: string): Promise<Subscription | null>;
  findByUserId(userId: string): Promise<Subscription[]>;
  create(
    data: Omit<Subscription, "id" | "createdAt" | "updatedAt">
  ): Promise<Subscription>;
  save(subscription: Subscription): Promise<Subscription>;
  delete(id: string): Promise<void>;
}
