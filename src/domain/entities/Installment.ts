export interface Installment {
  id: string;
  name: string;
  details?: string;
  cost: number;
  paidAt: Date;
  totalInstallments: number;
  remainingInstallments: number;
  paymentMethod: string;
  accountId: string;
  categoryId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
