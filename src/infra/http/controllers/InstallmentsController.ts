import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { CreateInstallmentUseCase } from "../../../application/use-cases/installments/CreateInstallmentUseCase.js";
import { DeleteInstallmentUseCase } from "../../../application/use-cases/installments/DeleteInstallmentUseCase.js";
import { ListUserInstallmentsUseCase } from "../../../application/use-cases/installments/ListUserInstallmentsUseCase.js";
import { PrismaInstallmentsRepository } from "../../database/repositories/PrismaInstallmentsRepository.js";
import { PrismaTransactionsRepository } from "../../database/repositories/PrismaTransactionsRepository.js";
import { UpdateInstallmentUseCase } from "../../../application/use-cases/installments/UpdateInstallmentUseCase.js";

export class InstallmentsController {
  async create(request: FastifyRequest, reply: FastifyReply) {
    const createInstallmentBodySchema = z.object({
      name: z.string(),
      details: z.string().optional(),
      cost: z.number().positive(),
      paidAt: z.coerce.date(),
      accountId: z.string(),
      categoryId: z.string(),
      paymentMethod: z.string(),
      totalInstallments: z.number().int().positive(),
      remainingInstallments: z.number().int().min(0),
    });

    const data = createInstallmentBodySchema.parse(request.body);

    const installmentsRepository = new PrismaInstallmentsRepository();
    const createInstallment = new CreateInstallmentUseCase(
      installmentsRepository
    );

    const installment = await createInstallment.execute({
      ...data,
      userId: (request.user as { id: string }).id,
    });

    return reply.status(201).send(installment);
  }

  async list(request: FastifyRequest, reply: FastifyReply) {
    const installmentsRepository = new PrismaInstallmentsRepository();
    const listInstallments = new ListUserInstallmentsUseCase(
      installmentsRepository
    );

    const installments = await listInstallments.execute({
      userId: (request.user as { id: string }).id,
    });

    return reply.send(installments);
  }

  async delete(request: FastifyRequest, reply: FastifyReply) {
    const deleteInstallmentParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const { id } = deleteInstallmentParamsSchema.parse(request.params);

    const installmentsRepository = new PrismaInstallmentsRepository();
    const transactionsRepository = new PrismaTransactionsRepository();
    const deleteInstallment = new DeleteInstallmentUseCase(
      installmentsRepository,
      transactionsRepository
    );

    await deleteInstallment.execute({
      installmentId: id,
      userId: (request.user as { id: string }).id,
    });

    return reply.status(204).send();
  }

  async update(request: FastifyRequest, reply: FastifyReply) {
    const updateInstallmentParamsSchema = z.object({
      id: z.string().uuid(),
    });

    const updateInstallmentBodySchema = z.object({
      name: z.string().optional(),
      details: z.string().optional(),
      cost: z.number().positive().optional(),
      paidAt: z.coerce.date().optional(),
      totalInstallments: z.number().int().positive().optional(),
      remainingInstallments: z.number().int().min(0).optional(),
    });

    const { id } = updateInstallmentParamsSchema.parse(request.params);
    const data = updateInstallmentBodySchema.parse(request.body);

    const installmentsRepository = new PrismaInstallmentsRepository();
    const transactionsRepository = new PrismaTransactionsRepository();
    const updateInstallment = new UpdateInstallmentUseCase(
      installmentsRepository,
      transactionsRepository
    );

    const installment = await updateInstallment.execute({
      installmentId: id,
      userId: (request.user as { id: string }).id,
      ...data,
    });

    return reply.send(installment);
  }
}
