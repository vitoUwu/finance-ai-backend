import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { TransactionAIService } from "../../../application/services/ai/TransactionAIService.js";
import { CreateTransactionUseCase } from "../../../application/use-cases/transactions/CreateTransactionUseCase.js";
import { DeleteTransactionUseCase } from "../../../application/use-cases/transactions/DeleteTransactionUseCase.js";
import { GenerateTransactionUseCase } from "../../../application/use-cases/transactions/GenerateTransactionUseCase.js";
import { ListUserTransactionsUseCase } from "../../../application/use-cases/transactions/ListUserTransactionsUseCase.js";
import { UpdateTransactionUseCase } from "../../../application/use-cases/transactions/UpdateTransactionUseCase.js";
import { TransactionType } from "../../../domain/entities/Transaction.js";
import { PrismaAccountsRepository } from "../../database/repositories/PrismaAccountsRepository.js";
import { PrismaCategoriesRepository } from "../../database/repositories/PrismaCategoriesRepository.js";
import { PrismaTransactionsRepository } from "../../database/repositories/PrismaTransactionsRepository.js";

export class TransactionsController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const createTransactionBodySchema = z.object({
      name: z.string(),
      details: z.string().optional(),
      date: z.coerce.date(),
      type: z.enum([TransactionType.INCOME, TransactionType.EXPENSE]),
      amount: z.number().positive(),
      categoryId: z.string().uuid(),
      accountId: z.string().uuid(),
      paymentMethod: z.string(),
      subscriptionId: z.string().uuid().optional(),
      installmentId: z.string().uuid().optional(),
    });

    const data = createTransactionBodySchema.parse(request.body);

    const transactionsRepository = new PrismaTransactionsRepository();
    const categoriesRepository = new PrismaCategoriesRepository();
    const accountsRepository = new PrismaAccountsRepository();

    const createTransaction = new CreateTransactionUseCase(
      transactionsRepository,
      categoriesRepository,
      accountsRepository
    );

    const transaction = await createTransaction.execute({
      ...data,
      userId: (request.user as { id: string }).id,
    });

    return reply.status(201).send(transaction);
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const transactionsRepository = new PrismaTransactionsRepository();
    const listTransactions = new ListUserTransactionsUseCase(
      transactionsRepository
    );

    const transactions = await listTransactions.execute({
      userId: (request.user as { id: string }).id,
    });

    return reply.send(transactions);
  }

  async generate(request: FastifyRequest, reply: FastifyReply) {
    const generateTransactionBodySchema = z.object({
      description: z.string(),
      provider: z.enum(["openai", "gemini"]).optional(),
    });

    const { description, provider = "openai" } =
      generateTransactionBodySchema.parse(request.body);

    const transactionAIService = new TransactionAIService(provider);
    const categoriesRepository = new PrismaCategoriesRepository();

    const generateTransaction = new GenerateTransactionUseCase(
      transactionAIService,
      categoriesRepository
    );

    const suggestion = await generateTransaction.execute({
      description,
      userId: (request.user as { id: string }).id,
    });

    return reply.send(suggestion);
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const updateTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const updateTransactionBodySchema = z.object({
      name: z.string().optional(),
      details: z.string().optional(),
      date: z.coerce.date().optional(),
      type: z
        .enum([TransactionType.INCOME, TransactionType.EXPENSE])
        .optional(),
      amount: z.number().positive().optional(),
      categoryId: z.string().uuid().optional(),
      accountId: z.string().uuid().optional(),
      subscriptionId: z.string().uuid().optional(),
      installmentId: z.string().uuid().optional(),
    });

    const { id } = updateTransactionParamsSchema.parse(request.params);
    const data = updateTransactionBodySchema.parse(request.body);

    const transactionsRepository = new PrismaTransactionsRepository();
    const categoriesRepository = new PrismaCategoriesRepository();
    const accountsRepository = new PrismaAccountsRepository();

    const updateTransaction = new UpdateTransactionUseCase(
      transactionsRepository,
      categoriesRepository,
      accountsRepository
    );

    const transaction = await updateTransaction.execute({
      transactionId: id,
      userId: (request.user as { id: string }).id,
      ...data,
    });

    return reply.send(transaction);
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const deleteTransactionParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = deleteTransactionParamsSchema.parse(request.params);

    const transactionsRepository = new PrismaTransactionsRepository();
    const deleteTransaction = new DeleteTransactionUseCase(
      transactionsRepository
    );

    await deleteTransaction.execute({
      transactionId: id,
      userId: (request.user as { id: string }).id,
    });

    return reply.status(204).send();
  }
}
