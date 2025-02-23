export enum RecurrenceType {
  MONTHLY = "MONTHLY",
  YEARLY = "YEARLY",
  WEEKLY = "WEEKLY",
  BIWEEKLY = "BIWEEKLY",
}

export interface Subscription {
  id: string;
  name: string;
  details: string | null;
  cost: number;
  recurrence: RecurrenceType;
  paidAt: Date;
  paymentMethod: string;
  categoryId: string;
  accountId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
