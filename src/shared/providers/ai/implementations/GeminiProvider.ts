import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIPromptConfig, IAIProvider } from "../IAIProvider.js";

export class GeminiProvider implements IAIProvider {
  private client: GoogleGenerativeAI;

  constructor() {
    this.client = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  }

  async generate(prompt: string, config?: AIPromptConfig): Promise<string> {
    const model = this.client.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }
}
