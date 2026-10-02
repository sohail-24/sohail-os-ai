export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  metadata?: {
    modelUsed?: string;
    inferenceTimeMs?: number;
    actionsPlanned?: string[];
  };
}

export interface AIProviderConfig {
  id: string;
  name: string;
  endpoint?: string;
  model: string;
  isLocal: boolean;
}

export interface AICapabilities {
  supportsStreaming: boolean;
  supportsToolCalling: boolean;
  supportsVision: boolean;
  contextWindowTokens: number;
}
