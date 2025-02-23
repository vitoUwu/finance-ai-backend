export enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

export interface Transaction {
  id: string;
  name: string;
  details?: string;
  date: Date;
  type: TransactionType;
  amount: number;
  categoryId: string;
  accountId: string;
  paymentMethod: string;
  userId: string;
  subscriptionId?: string;
  installmentId?: string;
  createdAt: Date;
  updatedAt: Date;
}
