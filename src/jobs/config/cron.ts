import { WebPushNotificationProvider } from "../../shared/providers/notifications/implementations/WebPushNotificationProvider.js";
import { PrismaClient } from "@prisma/client";
import cron from "node-cron";
import { InstallmentsService } from "../../application/services/InstallmentsService.js";
import { PaymentNotificationService } from "../../application/services/PaymentNotificationService.js";
import { RecurringTransactionsService } from "../../application/services/RecurringTransactionsService.js";
import { PrismaInstallmentsRepository } from "../../infra/database/repositories/PrismaInstallmentsRepository.js";
import { PrismaSubscriptionsRepository } from "../../infra/database/repositories/PrismaSubscriptionsRepository.js";
import { PrismaTransactionsRepository } from "../../infra/database/repositories/PrismaTransactionsRepository.js";
import { PrismaUsersRepository } from "../../infra/database/repositories/PrismaUsersRepository.js";
import { EmailNotificationProvider } from "../../shared/providers/notifications/implementations/EmailNotificationProvider.js";
import { LoggerService } from "../../shared/services/LoggerService.js";
import { SendPaymentNotificationsJob } from "../SendPaymentNotificationsJob.js";
import { UpdateRecurringTransactionsJob } from "../UpdateRecurringTransactionsJob.js";

export function setupCronJobs() {
  const prisma = new PrismaClient();

  const usersRepository = new PrismaUsersRepository(prisma);
  const transactionsRepository = new PrismaTransactionsRepository();
  const subscriptionsRepository = new PrismaSubscriptionsRepository();
  const installmentsRepository = new PrismaInstallmentsRepository();

  const recurringTransactionsService = new RecurringTransactionsService(
    transactionsRepository,
    subscriptionsRepository
  );

  const installmentsService = new InstallmentsService(
    installmentsRepository,
    transactionsRepository
  );

  const updateRecurringTransactionsJob = new UpdateRecurringTransactionsJob(
    recurringTransactionsService,
    installmentsService,
    usersRepository
  );

  // Configurar serviço de notificações
  const emailNotificationProvider = new EmailNotificationProvider(
    usersRepository
  );
  const pushNotificationProvider = new WebPushNotificationProvider(
    usersRepository
  );
  const paymentNotificationService = new PaymentNotificationService(
    transactionsRepository,
    emailNotificationProvider,
    pushNotificationProvider
  );

  const sendPaymentNotificationsJob = new SendPaymentNotificationsJob(
    paymentNotificationService
  );

  // Executar todos os dias à meia-noite
  cron.schedule("0 0 * * *", async () => {
    LoggerService.info({
      message: "Starting scheduled recurring transactions update",
    });

    try {
      await updateRecurringTransactionsJob.execute();

      LoggerService.info({
        message:
          "Scheduled recurring transactions update completed successfully",
      });
    } catch (error) {
      LoggerService.error({
        message: "Failed to update recurring transactions",
        error: error as Error,
      });
    }
  });

  // Executar todos os dias às 9h
  cron.schedule("0 9 * * *", async () => {
    LoggerService.info({
      message: "Starting payment notifications job",
    });

    try {
      await sendPaymentNotificationsJob.execute();
      LoggerService.info({
        message: "Payment notifications job completed successfully",
      });
    } catch (error) {
      LoggerService.error({
        message: "Failed to send payment notifications",
        error: error as Error,
      });
    }
  });

  // Executar imediatamente ao iniciar a aplicação
  LoggerService.info({
    message: "Running initial recurring transactions update",
  });

  updateRecurringTransactionsJob.execute().catch((error) => {
    LoggerService.error({
      message: "Failed to run initial recurring transactions update",
      error: error as Error,
    });
  });
}
