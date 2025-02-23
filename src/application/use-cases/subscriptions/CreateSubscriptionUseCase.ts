import {
  Subscription,
  RecurrenceType,
} from "../../../domain/entities/Subscription.js";
import { ISubscriptionsRepository } from "../../../domain/repositories/ISubscriptionsRepository.js";
import { AppError } from "../../../shared/errors/AppError.js";

interface CreateSubscriptionRequest {
  name: string;
  details: string | null;
  cost: number;
  recurrence: RecurrenceType;
  paidAt: Date;
  userId: string;
  categoryId: string;
  accountId: string;
  paymentMethod: string;
}

export class CreateSubscriptionUseCase {
  constructor(private subscriptionsRepository: ISubscriptionsRepository) {}

  async execute(request: CreateSubscriptionRequest): Promise<Subscription> {
    // Validar nome da assinatura
    if (request.name.trim().length < 3) {
      throw new AppError(
        "Subscription name must be at least 3 characters long"
      );
    }

    // Validar detalhes opcionais
    if (request.details && request.details.trim().length > 500) {
      throw new AppError("Subscription details cannot exceed 500 characters");
    }

    // Validar valor mínimo
    if (request.cost < 0.01) {
      throw new AppError("Subscription cost must be at least 0.01");
    }

    // Validar data de pagamento
    const currentDate = new Date();
    const paidAtDate = new Date(request.paidAt);
    const maxPastDate = new Date();
    maxPastDate.setFullYear(maxPastDate.getFullYear() - 1); // Máximo 1 ano atrás

    if (paidAtDate > currentDate) {
      throw new AppError("Payment date cannot be in the future");
    }

    if (paidAtDate < maxPastDate) {
      throw new AppError("Payment date cannot be more than 1 year in the past");
    }

    // Verificar limite de assinaturas ativas por usuário
    const userSubscriptions = await this.subscriptionsRepository.findByUserId(
      request.userId
    );
    const maxSubscriptions = 10;

    if (userSubscriptions.length >= maxSubscriptions) {
      throw new AppError(
        `You can have a maximum of ${maxSubscriptions} active subscriptions`
      );
    }

    const subscription = await this.subscriptionsRepository.create(request);

    return subscription;
  }
}
