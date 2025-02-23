export interface AIPromptConfig {
  temperature?: number;
  maxTokens?: number;
}

export interface IAIProvider {
  generate(prompt: string, config?: AIPromptConfig): Promise<string>;
}
