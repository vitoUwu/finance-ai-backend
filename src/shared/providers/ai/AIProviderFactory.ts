import { IAIProvider } from "./IAIProvider.js";
import { OpenAIProvider } from "./implementations/OpenAIProvider.js";
import { GeminiProvider } from "./implementations/GeminiProvider.js";

export type AIProvider = "openai" | "gemini";

export class AIProviderFactory {
  static create(provider: AIProvider = "openai"): IAIProvider {
    const providers = {
      openai: new OpenAIProvider(),
      gemini: new GeminiProvider(),
    };

    return providers[provider];
  }
}
