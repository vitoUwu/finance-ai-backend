import { RecurringTransactionsService } from "../application/services/RecurringTransactionsService.js";
import { InstallmentsService } from "../application/services/InstallmentsService.js";
import { IUsersRepository } from "../domain/repositories/IUsersRepository.js";
import { LoggerService } from "../shared/services/LoggerService.js";
import { MetricsService } from "../shared/services/MetricsService.js";
import { RetryService } from "../shared/services/RetryService.js";

export class UpdateRecurringTransactionsJob {
  constructor(
    private recurringTransactionsService: RecurringTransactionsService,
    private installmentsService: InstallmentsService,
    private usersRepository: IUsersRepository
  ) {}

  private async processUser(userId: string): Promise<void> {
    LoggerService.debug({
      message: "Processing user transactions",
      metadata: { userId },
    });

    await RetryService.withRetry(
      () =>
        this.recurringTransactionsService.generateUpcomingTransactions(userId),
      {
        maxAttempts: 3,
        initialDelay: 2000,
      }
    );

    await RetryService.withRetry(
      () => this.installmentsService.updateRemainingInstallments(userId),
      {
        maxAttempts: 3,
        initialDelay: 2000,
      }
    );
  }

  async execute(): Promise<void> {
    const metric = MetricsService.startJob("UpdateRecurringTransactions");

    try {
      const users = await this.usersRepository.findAll();

      LoggerService.info({
        message: "Starting recurring transactions update",
        metadata: { totalUsers: users.length },
      });

      for (const user of users) {
        try {
          await this.processUser(user.id);
        } catch (error) {
          LoggerService.error({
            message: "Failed to process user",
            metadata: { userId: user.id },
            error: error as Error,
          });
        }
      }

      MetricsService.finishJob(metric, true);

      const stats = MetricsService.getJobStats("UpdateRecurringTransactions");
      LoggerService.info({
        message: "Job statistics",
        metadata: stats,
      });
    } catch (error) {
      MetricsService.finishJob(metric, false, error as Error);
      throw error;
    }
  }
}
