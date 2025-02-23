import { TransactionType } from "../../../domain/entities/Transaction.js";

export interface GenerateTransactionRequest {
  description: string;
  userId: string;
}

export interface GeneratedTransaction {
  name: string;
  details?: string;
  type: TransactionType;
  amount: number;
  suggestedCategory: string;
}

export interface ITransactionAIService {
  generateFromDescription(
    request: GenerateTransactionRequest
  ): Promise<GeneratedTransaction>;
}
