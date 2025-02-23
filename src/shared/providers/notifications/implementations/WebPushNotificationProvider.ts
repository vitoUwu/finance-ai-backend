import webpush from "web-push";
import {
  INotificationProvider,
  NotificationContent,
} from "../INotificationProvider.js";
import { IUsersRepository } from "../../../../domain/repositories/IUsersRepository.js";
import { LoggerService } from "../../../services/LoggerService.js";

export class WebPushNotificationProvider implements INotificationProvider {
  constructor(private usersRepository: IUsersRepository) {
    webpush.setVapidDetails(
      process.env.WEB_PUSH_CONTACT!,
      process.env.WEB_PUSH_PUBLIC_KEY!,
      process.env.WEB_PUSH_PRIVATE_KEY!
    );
  }

  async send(userId: string, content: NotificationContent): Promise<void> {
    try {
      const user = await this.usersRepository.findById(userId);
      if (!user?.pushSubscription) {
        throw new Error("User push subscription not found");
      }

      const pushPayload = {
        title: content.title,
        body: content.body,
        icon: "/icon-192x192.png", // Ícone do seu PWA
        badge: "/badge-72x72.png", // Badge para notificações
        data: content.data,
        actions: [
          {
            action: "open",
            title: "Abrir app",
          },
        ],
      };

      await webpush.sendNotification(
        JSON.parse(user.pushSubscription),
        JSON.stringify(pushPayload)
      );

      LoggerService.info({
        message: "Push notification sent",
        metadata: {
          userId,
          title: content.title,
        },
      });
    } catch (error) {
      LoggerService.error({
        message: "Failed to send push notification",
        metadata: { userId },
        error: error as Error,
      });
      throw error;
    }
  }
}
