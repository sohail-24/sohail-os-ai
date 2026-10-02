import { ChatMessage, AIProviderConfig, AICapabilities } from '../../types';

export interface AIServiceGenerateOptions {
  model?: string;
  systemPrompt?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface AIServiceResponse {
  message: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

/**
 * Abstract AI Provider Interface.
 * Can be implemented by local Ollama, llama.cpp, or custom local runners.
 * UI is fully decoupled from the underlying inference engine.
 */
export interface IAIService {
  readonly providerId: string;
  readonly isLocal: boolean;
  
  initialize(config?: AIProviderConfig): Promise<boolean>;
  getCapabilities(): AICapabilities;
  getAvailableModels(): Promise<string[]>;
  generateResponse(messages: ChatMessage[], options?: AIServiceGenerateOptions): Promise<AIServiceResponse>;
  checkHealth(): Promise<{ isAvailable: boolean; latencyMs?: number; version?: string; error?: string }>;
  getEndpoint?(): string;
  setEndpoint?(endpoint: string): void;
  getModel?(): string;
  setModel?(model: string): void;
}
