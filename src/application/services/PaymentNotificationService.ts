import { Transaction } from "../../domain/entities/Transaction.js";
import { ITransactionsRepository } from "../../domain/repositories/ITransactionsRepository.js";
import { INotificationProvider } from "../../shared/providers/notifications/INotificationProvider.js";
import { LoggerService } from "../../shared/services/LoggerService.js";
import { formatCurrency } from "../../shared/utils/formatCurrency.js";
import { formatDate } from "../../shared/utils/formatDate.js";

export class PaymentNotificationService {
  constructor(
    private transactionsRepository: ITransactionsRepository,
    private emailProvider: INotificationProvider,
    private pushProvider: INotificationProvider
  ) {}

  async notifyUpcomingPayments(): Promise<void> {
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3);

    try {
      // Agrupar transações por usuário
      const transactions = await this.transactionsRepository.findByDateRange(
        today,
        threeDaysFromNow
      );

      const userTransactions = this.groupTransactionsByUser(transactions);

      // Enviar notificações para cada usuário
      for (const [userId, userTxs] of Object.entries(userTransactions)) {
        const totalAmount = userTxs.reduce((sum, tx) => sum + tx.amount, 0);

        const content = {
          title: "Pagamentos Próximos",
          body: `Você tem ${userTxs.length} pagamento${
            userTxs.length > 1 ? "s" : ""
          } agendado${
            userTxs.length > 1 ? "s" : ""
          } para os próximos 3 dias, totalizando ${formatCurrency(
            totalAmount
          )}.`,
          data: {
            payments: userTxs
              .map(
                (tx) =>
                  `${tx.name}: ${formatCurrency(tx.amount)} - ${formatDate(
                    tx.date
                  )}`
              )
              .join("\n"),
          },
        };

        // Enviar tanto email quanto push notification
        await Promise.all([
          this.emailProvider.send(userId, content),
          this.pushProvider.send(userId, content),
        ]);

        LoggerService.info({
          message: "Payment notifications sent",
          metadata: {
            userId,
            transactionCount: userTxs.length,
            totalAmount,
          },
        });
      }
    } catch (error) {
      LoggerService.error({
        message: "Failed to send payment notifications",
        error: error as Error,
      });
      throw error;
    }
  }

  private groupTransactionsByUser(transactions: Transaction[]) {
    return transactions.reduce((groups, transaction) => {
      const userId = transaction.userId;
      if (!groups[userId]) {
        groups[userId] = [];
      }
      groups[userId].push(transaction);
      return groups;
    }, {} as Record<string, any[]>);
  }
}
