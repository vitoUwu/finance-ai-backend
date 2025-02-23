import { LoggerService } from "./LoggerService.js";

interface RetryOptions {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
}

export class RetryService {
  private static defaultOptions: RetryOptions = {
    maxAttempts: 3,
    initialDelay: 1000, // 1 segundo
    maxDelay: 30000, // 30 segundos
    backoffFactor: 2,
  };

  static async withRetry<T>(
    operation: () => Promise<T>,
    options: Partial<RetryOptions> = {}
  ): Promise<T> {
    const finalOptions = { ...this.defaultOptions, ...options };
    let lastError: Error;
    let delay = finalOptions.initialDelay;

    for (let attempt = 1; attempt <= finalOptions.maxAttempts; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === finalOptions.maxAttempts) {
          throw error;
        }

        LoggerService.warn({
          message: `Operation failed, retrying...`,
          metadata: {
            attempt,
            maxAttempts: finalOptions.maxAttempts,
            delay: `${delay}ms`,
          },
          error: lastError,
        });

        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.min(
          delay * finalOptions.backoffFactor,
          finalOptions.maxDelay
        );
      }
    }

    throw lastError!;
  }
}
