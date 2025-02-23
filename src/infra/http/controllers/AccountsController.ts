import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { CreateAccountUseCase } from "../../../application/use-cases/accounts/CreateAccountUseCase.js";
import { DeleteAccountUseCase } from "../../../application/use-cases/accounts/DeleteAccountUseCase.js";
import { ListUserAccountsUseCase } from "../../../application/use-cases/accounts/ListUserAccountsUseCase.js";
import { UpdateAccountUseCase } from "../../../application/use-cases/accounts/UpdateAccountUseCase.js";
import { PrismaTransactionsRepository } from "../../../infra/database/repositories/PrismaTransactionsRepository.js";
import { PrismaAccountsRepository } from "../../database/repositories/PrismaAccountsRepository.js";

export class AccountsController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const createAccountBodySchema = z.object({
      name: z.string(),
      color: z
        .string()
        .regex(/^#[0-9A-F]{6}$/i, "Color must be a valid hex color"),
    });

    const data = createAccountBodySchema.parse(request.body);

    const accountsRepository = new PrismaAccountsRepository();
    const createAccount = new CreateAccountUseCase(accountsRepository);

    const account = await createAccount.execute({
      ...data,
      userId: (request.user as { id: string }).id,
    });

    return reply.status(201).send(account);
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const accountsRepository = new PrismaAccountsRepository();
    const listAccounts = new ListUserAccountsUseCase(accountsRepository);

    const accounts = await listAccounts.execute({
      userId: (request.user as { id: string }).id,
    });

    return reply.send(accounts);
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const deleteAccountParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = deleteAccountParamsSchema.parse(request.params);

    const accountsRepository = new PrismaAccountsRepository();
    const deleteAccount = new DeleteAccountUseCase(accountsRepository);

    await deleteAccount.execute({
      accountId: id,
      userId: (request.user as { id: string }).id,
    });

    return reply.status(204).send();
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const updateAccountParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const updateAccountBodySchema = z.object({
      name: z.string().optional(),
      color: z
        .string()
        .regex(/^#[0-9A-F]{6}$/i, "Color must be a valid hex color")
        .optional(),
    });

    const { id } = updateAccountParamsSchema.parse(request.params);
    const data = updateAccountBodySchema.parse(request.body);

    const accountsRepository = new PrismaAccountsRepository();
    const transactionsRepository = new PrismaTransactionsRepository();
    const updateAccount = new UpdateAccountUseCase(
      accountsRepository,
      transactionsRepository
    );

    const account = await updateAccount.execute({
      accountId: id,
      userId: (request.user as { id: string }).id,
      ...data,
    });

    return reply.send(account);
  }
}
