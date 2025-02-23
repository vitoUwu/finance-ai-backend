import { PaymentNotificationService } from "../application/services/PaymentNotificationService.js";
import { MetricsService } from "../shared/services/MetricsService.js";
import { RetryService } from "../shared/services/RetryService.js";

export class SendPaymentNotificationsJob {
  constructor(private paymentNotificationService: PaymentNotificationService) {}

  async execute(): Promise<void> {
    const metric = MetricsService.startJob("SendPaymentNotifications");

    try {
      await RetryService.withRetry(
        () => this.paymentNotificationService.notifyUpcomingPayments(),
        {
          maxAttempts: 3,
          initialDelay: 5000,
        }
      );

      MetricsService.finishJob(metric, true);
    } catch (error) {
      MetricsService.finishJob(metric, false, error as Error);
      throw error;
    }
  }
}
