import { IAIService, AIServiceGenerateOptions, AIServiceResponse } from './types';
import { AICapabilities, AIProviderConfig, ChatMessage } from '../../types';
import { OllamaAIService, ollamaService } from './ollamaService';

/**
 * Concrete AI service singleton used across the application.
 * Fully decoupled behind the IAIService interface and powered by local Ollama.
 */
export const aiService: IAIService = ollamaService;
export { OllamaAIService, ollamaService };

/**
 * Placeholder Local AI Service Implementation (reference).
 */
export class LocalAIServicePlaceholder implements IAIService {
  public readonly providerId = 'local-ollama-placeholder';
  public readonly isLocal = true;

  private endpoint = 'http://localhost:11434';
  private defaultModel = 'llama3.2';

  public async initialize(config?: AIProviderConfig): Promise<boolean> {
    if (config?.endpoint) {
      this.endpoint = config.endpoint;
    }
    if (config?.model) {
      this.defaultModel = config.model;
    }
    // Ollama connection will be implemented in a subsequent phase
    return true;
  }

  public getCapabilities(): AICapabilities {
    return {
      supportsStreaming: true,
      supportsToolCalling: true,
      supportsVision: true,
      contextWindowTokens: 8192,
    };
  }

  public async getAvailableModels(): Promise<string[]> {
    // Placeholder models to be populated by local Ollama tags API
    return ['llama3.2:latest', 'mistral:latest', 'qwen2.5-coder:latest'];
  }

  public async generateResponse(
    messages: ChatMessage[],
    _options?: AIServiceGenerateOptions
  ): Promise<AIServiceResponse> {
    const lastUserMessage = [...messages].reverse().find((m) => m.role === 'user');
    return {
      message: `[SOHAIL OS AI Standby] System is in initial architecture mode. Local Ollama engine integration will be activated in the next phase. Received prompt: "${lastUserMessage?.content || ''}"`,
      model: this.defaultModel,
      usage: {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      },
    };
  }

  public async checkHealth(): Promise<{ isAvailable: boolean; latencyMs?: number; error?: string }> {
    return {
      isAvailable: false,
      error: 'Local Ollama service not connected yet (planned for next milestone)',
    };
  }
}

