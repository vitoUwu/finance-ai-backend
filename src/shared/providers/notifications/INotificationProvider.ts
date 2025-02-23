export interface NotificationContent {
  title: string;
  body: string;
  data?: Record<string, string>;
}

export interface INotificationProvider {
  send(userId: string, content: NotificationContent): Promise<void>;
}
