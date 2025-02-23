import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { CreateSubscriptionUseCase } from "../../../application/use-cases/subscriptions/CreateSubscriptionUseCase.js";
import { DeleteSubscriptionUseCase } from "../../../application/use-cases/subscriptions/DeleteSubscriptionUseCase.js";
import { ListUserSubscriptionsUseCase } from "../../../application/use-cases/subscriptions/ListUserSubscriptionsUseCase.js";
import { PrismaSubscriptionsRepository } from "../../database/repositories/PrismaSubscriptionsRepository.js";
import { PrismaTransactionsRepository } from "../../database/repositories/PrismaTransactionsRepository.js";
import { RecurrenceType } from "../../../domain/entities/Subscription.js";
import { UpdateSubscriptionUseCase } from "../../../application/use-cases/subscriptions/UpdateSubscriptionUseCase.js";

export class SubscriptionsController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const createSubscriptionBodySchema = z.object({
      name: z.string(),
      details: z.string().optional(),
      cost: z.number().positive(),
      categoryId: z.string(),
      accountId: z.string(),
      paymentMethod: z.string(),
      recurrence: z.enum([
        RecurrenceType.MONTHLY,
        RecurrenceType.YEARLY,
        RecurrenceType.WEEKLY,
        RecurrenceType.BIWEEKLY,
      ]),
      paidAt: z.coerce.date(),
    });

    const data = createSubscriptionBodySchema.parse(request.body);

    const subscriptionsRepository = new PrismaSubscriptionsRepository();
    const createSubscription = new CreateSubscriptionUseCase(
      subscriptionsRepository
    );

    const subscription = await createSubscription.execute({
      ...data,
      details: data.details || null,
      userId: (request.user as { id: string }).id,
    });

    return reply.status(201).send(subscription);
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const subscriptionsRepository = new PrismaSubscriptionsRepository();
    const listSubscriptions = new ListUserSubscriptionsUseCase(
      subscriptionsRepository
    );

    const subscriptions = await listSubscriptions.execute({
      userId: (request.user as { id: string }).id,
    });

    return reply.send(subscriptions);
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const deleteSubscriptionParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = deleteSubscriptionParamsSchema.parse(request.params);

    const subscriptionsRepository = new PrismaSubscriptionsRepository();
    const transactionsRepository = new PrismaTransactionsRepository();
    const deleteSubscription = new DeleteSubscriptionUseCase(
      subscriptionsRepository,
      transactionsRepository
    );

    await deleteSubscription.execute({
      subscriptionId: id,
      userId: (request.user as { id: string }).id,
    });

    return reply.status(204).send();
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const updateSubscriptionParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const updateSubscriptionBodySchema = z.object({
      name: z.string().optional(),
      details: z.string().optional(),
      cost: z.number().positive().optional(),
      recurrence: z
        .enum([
          RecurrenceType.MONTHLY,
          RecurrenceType.YEARLY,
          RecurrenceType.WEEKLY,
          RecurrenceType.BIWEEKLY,
        ])
        .optional(),
      paidAt: z.coerce.date().optional(),
    });

    const { id } = updateSubscriptionParamsSchema.parse(request.params);
    const data = updateSubscriptionBodySchema.parse(request.body);

    const subscriptionsRepository = new PrismaSubscriptionsRepository();
    const transactionsRepository = new PrismaTransactionsRepository();
    const updateSubscription = new UpdateSubscriptionUseCase(
      subscriptionsRepository,
      transactionsRepository
    );

    const subscription = await updateSubscription.execute({
      subscriptionId: id,
      userId: (request.user as { id: string }).id,
      ...data,
    });

    return reply.send(subscription);
  }
}
