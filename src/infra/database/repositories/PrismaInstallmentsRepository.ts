import { Installment as PrismaInstallment } from "@prisma/client";
import { Installment } from "../../../domain/entities/Installment.js";
import { IInstallmentsRepository } from "../../../domain/repositories/IInstallmentsRepository.js";
import { prisma } from "../prisma.js";

export class PrismaInstallmentsRepository implements IInstallmentsRepository {
  private installmentToEntity(installment: PrismaInstallment): Installment {
    return {
      ...installment,
      cost: installment.cost.toNumber(),
      details: installment.details || undefined,
      paymentMethod: "",
      accountId: "",
      categoryId: "",
    };
  }

  async findById(id: string): Promise<Installment | null> {
    const installment = await prisma.installment.findUnique({
      where: { id },
    });

    return installment ? this.installmentToEntity(installment) : null;
  }

  async findByUserId(userId: string): Promise<Installment[]> {
    const installments = await prisma.installment.findMany({
      where: { userId },
      orderBy: { paidAt: "desc" },
    });

    return installments.map(this.installmentToEntity);
  }

  async create(
    data: Omit<Installment, "id" | "createdAt" | "updatedAt">
  ): Promise<Installment> {
    const installment = await prisma.installment.create({
      data,
    });

    return this.installmentToEntity(installment);
  }

  async save(installment: Installment): Promise<Installment> {
    const updatedInstallment = await prisma.installment.update({
      where: { id: installment.id },
      data: installment,
    });

    return this.installmentToEntity(updatedInstallment);
  }

  async delete(id: string): Promise<void> {
    await prisma.installment.delete({
      where: { id },
    });
  }
}
