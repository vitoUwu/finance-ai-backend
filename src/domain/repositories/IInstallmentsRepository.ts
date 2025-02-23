import { Installment } from "../entities/Installment.js";

export interface IInstallmentsRepository {
  findById(id: string): Promise<Installment | null>;
  findByUserId(userId: string): Promise<Installment[]>;
  create(
    data: Omit<Installment, "id" | "createdAt" | "updatedAt">
  ): Promise<Installment>;
  save(installment: Installment): Promise<Installment>;
  delete(id: string): Promise<void>;
}
