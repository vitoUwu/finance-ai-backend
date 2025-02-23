import OpenAI from "openai";
import { AIPromptConfig, IAIProvider } from "../IAIProvider.js";

export class OpenAIProvider implements IAIProvider {
  private client: OpenAI;

  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generate(prompt: string, config?: AIPromptConfig): Promise<string> {
    const completion = await this.client.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "gpt-4",
      temperature: config?.temperature ?? 0.7,
      max_tokens: config?.maxTokens,
    });

    return completion.choices[0].message.content || "";
  }
}
