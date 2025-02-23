import { Installment } from "../../../domain/entities/Installment.js";
import { IInstallmentsRepository } from "../../../domain/repositories/IInstallmentsRepository.js";

interface ListUserInstallmentsRequest {
  userId: string;
}

export class ListUserInstallmentsUseCase {
  constructor(private installmentsRepository: IInstallmentsRepository) {}

  async execute({
    userId,
  }: ListUserInstallmentsRequest): Promise<Installment[]> {
    const installments = await this.installmentsRepository.findByUserId(userId);

    return installments;
  }
}
