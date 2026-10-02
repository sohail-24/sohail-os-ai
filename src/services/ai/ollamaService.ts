import { IAIService, AIServiceGenerateOptions, AIServiceResponse } from './types';
import { AICapabilities, AIProviderConfig, ChatMessage } from '../../types';

const STORAGE_KEY_ENDPOINT = 'sohail_os_ai_ollama_endpoint';
const STORAGE_KEY_MODEL = 'sohail_os_ai_ollama_model';
const DEFAULT_ENDPOINT = 'http://localhost:11434';
const DEFAULT_MODEL = 'llama3.2';

export class OllamaAIService implements IAIService {
  public readonly providerId = 'local-ollama';
  public readonly isLocal = true;

  private endpoint: string;
  private selectedModel: string;

  constructor() {
    this.endpoint = this.loadStoredEndpoint();
    this.selectedModel = this.loadStoredModel();
  }

  private loadStoredEndpoint(): string {
    try {
      return localStorage.getItem(STORAGE_KEY_ENDPOINT) || DEFAULT_ENDPOINT;
    } catch {
      return DEFAULT_ENDPOINT;
    }
  }

  private loadStoredModel(): string {
    try {
      return localStorage.getItem(STORAGE_KEY_MODEL) || DEFAULT_MODEL;
    } catch {
      return DEFAULT_MODEL;
    }
  }

  public getEndpoint(): string {
    return this.endpoint;
  }

  public setEndpoint(endpoint: string): void {
    const cleaned = endpoint.trim().replace(/\/+$/, '');
    this.endpoint = cleaned || DEFAULT_ENDPOINT;
    try {
      localStorage.setItem(STORAGE_KEY_ENDPOINT, this.endpoint);
    } catch {
      // Storage unavailable, ignore
    }
  }

  public getModel(): string {
    return this.selectedModel;
  }

  public setModel(model: string): void {
    const cleaned = model.trim();
    this.selectedModel = cleaned || DEFAULT_MODEL;
    try {
      localStorage.setItem(STORAGE_KEY_MODEL, this.selectedModel);
    } catch {
      // Storage unavailable, ignore
    }
  }

  public async initialize(config?: AIProviderConfig): Promise<boolean> {
    if (config?.endpoint) {
      this.setEndpoint(config.endpoint);
    }
    if (config?.model) {
      this.setModel(config.model);
    }
    return true;
  }

  public getCapabilities(): AICapabilities {
    return {
      supportsStreaming: false, // Standard JSON generation
      supportsToolCalling: false,
      supportsVision: false,
      contextWindowTokens: 8192,
    };
  }

  /**
   * Health check to ping the Ollama local HTTP API.
   * Tests GET /api/version or GET /api/tags
   */
  public async checkHealth(): Promise<{
    isAvailable: boolean;
    latencyMs?: number;
    version?: string;
    error?: string;
  }> {
    const startTime = performance.now();
    const normalizedUrl = this.endpoint.replace(/\/+$/, '');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      // Try /api/version first
      const res = await fetch(`${normalizedUrl}/api/version`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const latencyMs = Math.round(performance.now() - startTime);

      if (res.ok) {
        const data = await res.json().catch(() => ({}));
        return {
          isAvailable: true,
          latencyMs,
          version: data.version || 'running',
        };
      }

      // If /api/version is not 200, try base /
      const rootRes = await fetch(`${normalizedUrl}/`, {
        method: 'GET',
        signal: AbortSignal.timeout(2000),
      });

      if (rootRes.ok) {
        return {
          isAvailable: true,
          latencyMs,
          version: 'running',
        };
      }

      return {
        isAvailable: false,
        error: `Ollama returned HTTP status ${res.status}`,
      };
    } catch (err: unknown) {
      const errorMsg = this.formatNetworkError(err, normalizedUrl);
      return {
        isAvailable: false,
        error: errorMsg,
      };
    }
  }

  /**
   * Fetch available models installed on the user's local Ollama instance.
   * Hits GET /api/tags
   */
  public async getAvailableModels(): Promise<string[]> {
    const normalizedUrl = this.endpoint.replace(/\/+$/, '');

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch(`${normalizedUrl}/api/tags`, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        return [];
      }

      const data = await res.json();
      if (Array.isArray(data.models)) {
        return data.models.map((m: { name?: string }) => m.name || '').filter(Boolean);
      }
      return [];
    } catch {
      return [];
    }
  }

  /**
   * Generates a response from local Ollama using POST /api/chat.
   */
  public async generateResponse(
    messages: ChatMessage[],
    options?: AIServiceGenerateOptions
  ): Promise<AIServiceResponse> {
    const normalizedUrl = this.endpoint.replace(/\/+$/, '');
    const targetModel = options?.model || this.selectedModel || DEFAULT_MODEL;

    // Filter and map messages to Ollama format
    const formattedMessages = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant' || m.role === 'system')
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    if (formattedMessages.length === 0) {
      throw new Error('No valid messages provided to Ollama.');
    }

    try {
      const controller = new AbortController();
      // Generous timeout for local inference
      const timeoutId = setTimeout(() => controller.abort(), 120000);

      const response = await fetch(`${normalizedUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          model: targetModel,
          messages: formattedMessages,
          stream: false,
          options: {
            temperature: options?.temperature ?? 0.7,
            num_predict: options?.maxTokens,
          },
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorDetail = '';
        try {
          const errorJson = await response.json();
          errorDetail = errorJson.error || JSON.stringify(errorJson);
        } catch {
          errorDetail = await response.text().catch(() => '');
        }

        // Handle specific case: model not found
        if (response.status === 404 || errorDetail.toLowerCase().includes('not found')) {
          throw new Error(
            `Model "${targetModel}" was not found in your local Ollama library.\n` +
            `Please run: ollama pull ${targetModel}\nin your Mac Terminal, or choose an installed model in Settings.`
          );
        }

        throw new Error(
          `Ollama returned error (${response.status}): ${errorDetail || response.statusText}`
        );
      }

      const data = await response.json();

      const replyContent = data.message?.content;
      if (typeof replyContent !== 'string' || replyContent.trim().length === 0) {
        throw new Error(
          `Ollama model "${targetModel}" returned an empty response. Verify model status and VRAM capacity.`
        );
      }

      return {
        message: replyContent.trim(),
        model: data.model || targetModel,
        usage: {
          promptTokens: data.prompt_eval_count || 0,
          completionTokens: data.eval_count || 0,
          totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0),
        },
      };
    } catch (err: unknown) {
      if (err instanceof Error) {
        // If it's already one of our customized descriptive errors, throw directly
        if (
          err.message.includes('was not found') ||
          err.message.includes('returned an empty response') ||
          err.message.includes('Ollama returned error')
        ) {
          throw err;
        }
      }

      const connectionError = this.formatNetworkError(err, normalizedUrl);
      throw new Error(connectionError);
    }
  }

  private formatNetworkError(err: unknown, url: string): string {
    if (err instanceof DOMException && err.name === 'AbortError') {
      return `Connection timed out while trying to reach Ollama at ${url}.`;
    }

    return (
      `Unable to reach local Ollama server at ${url}.\n` +
      `Ensure Ollama is running on your Mac (run "ollama serve" in Terminal).\n` +
      `Note: If accessing from a browser with strict origin rules, start Ollama with: OLLAMA_ORIGINS="*" ollama serve`
    );
  }
}

// Export singleton instance of Ollama AI service implementing IAIService
export const ollamaService: IAIService = new OllamaAIService();
