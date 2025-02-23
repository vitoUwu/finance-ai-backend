interface PushEvent extends ExtendableEvent {
  data?: {
    json(): any;
  };
}

interface NotificationEvent extends ExtendableEvent {
  notification: Notification;
  action: string;
}

declare function addEventListener(
  type: "push",
  listener: (event: PushEvent) => void
): void;

declare function addEventListener(
  type: "notificationclick",
  listener: (event: NotificationEvent) => void
): void;
