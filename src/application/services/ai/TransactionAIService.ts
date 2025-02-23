import { IAIProvider } from "../../../shared/providers/ai/IAIProvider.js";
import { TransactionType } from "../../../domain/entities/Transaction.js";
import {
  GenerateTransactionRequest,
  GeneratedTransaction,
  ITransactionAIService,
} from "./ITransactionAIService.js";
import {
  AIProvider,
  AIProviderFactory,
} from "../../../shared/providers/ai/AIProviderFactory.js";
import { AIError } from "../../../shared/errors/AppError.js";

export class TransactionAIService implements ITransactionAIService {
  private aiProvider: IAIProvider;

  constructor(provider: AIProvider = "openai") {
    this.aiProvider = AIProviderFactory.create(provider);
  }

  async generateFromDescription(
    request: GenerateTransactionRequest
  ): Promise<GeneratedTransaction> {
    const prompt = this.buildPrompt(request.description);

    const response = await this.aiProvider.generate(prompt, {
      temperature: 0.3,
    });

    return this.parseResponse(response);
  }

  private buildPrompt(description: string): string {
    return `
      You are a financial assistant that helps categorize and structure financial transactions.
      
      Given the following transaction description, extract the key information and format it as a valid JSON object.
      
      Transaction Description: "${description}"
      
      Rules:
      1. The name should be short and objective
      2. Details are optional and should provide context
      3. Type must be either "INCOME" or "EXPENSE"
      4. Amount must be a positive number
      5. Category should be a common financial category
      
      Required JSON format:
      {
        "name": "string",
        "details": "string" | null,
        "type": "INCOME" | "EXPENSE",
        "amount": number,
        "suggestedCategory": "string"
      }
      
      Respond only with the JSON object, no additional text.
    `;
  }

  private parseResponse(response: string): GeneratedTransaction {
    try {
      const jsonString = response.trim().replace(/```json\n?|\n?```/g, "");
      const parsed = JSON.parse(jsonString);

      if (!this.isValidResponse(parsed)) {
        throw new AIError("Invalid AI response format");
      }

      return {
        name: parsed.name,
        details: parsed.details || undefined,
        type: parsed.type as TransactionType,
        amount: Number(parsed.amount),
        suggestedCategory: parsed.suggestedCategory,
      };
    } catch (error) {
      if (error instanceof AIError) {
        throw error;
      }
      throw new AIError("Failed to parse AI response");
    }
  }

  private isValidResponse(response: any): boolean {
    return (
      typeof response === "object" &&
      typeof response.name === "string" &&
      (response.details === null || typeof response.details === "string") &&
      (response.type === "INCOME" || response.type === "EXPENSE") &&
      typeof response.amount === "number" &&
      typeof response.suggestedCategory === "string"
    );
  }
}
