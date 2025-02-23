import { Subscription as PrismaSubscription } from "@prisma/client";
import {
  RecurrenceType,
  Subscription,
} from "../../../domain/entities/Subscription.js";
import { ISubscriptionsRepository } from "../../../domain/repositories/ISubscriptionsRepository.js";
import { prisma } from "../prisma.js";

export class PrismaSubscriptionsRepository implements ISubscriptionsRepository {
  private subscriptionToEntity(subscription: PrismaSubscription): Subscription {
    return {
      ...subscription,
      cost: subscription.cost.toNumber(),
      recurrence: subscription.recurrence as RecurrenceType,
    };
  }

  async findById(id: string): Promise<Subscription | null> {
    const subscription = await prisma.subscription.findUnique({
      where: { id },
    });

    return subscription ? this.subscriptionToEntity(subscription) : null;
  }

  async findByUserId(userId: string): Promise<Subscription[]> {
    const subscriptions = await prisma.subscription.findMany({
      where: { userId },
      orderBy: { paidAt: "desc" },
    });

    return subscriptions.map(this.subscriptionToEntity);
  }

  async create(
    data: Omit<Subscription, "id" | "createdAt" | "updatedAt">
  ): Promise<Subscription> {
    const subscription = await prisma.subscription.create({
      data,
    });

    return this.subscriptionToEntity(subscription);
  }

  async save(subscription: Subscription): Promise<Subscription> {
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: subscription,
    });

    return this.subscriptionToEntity(updatedSubscription);
  }

  async delete(id: string): Promise<void> {
    await prisma.subscription.delete({
      where: { id },
    });
  }
}
