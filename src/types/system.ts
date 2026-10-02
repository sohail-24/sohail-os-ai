export type NavigationTab = 'chat' | 'tasks' | 'skills' | 'memory' | 'settings';

export type ServiceHealth = 'ready' | 'idle' | 'offline' | 'unconfigured' | 'error' | 'checking' | 'permission_required';

export interface SystemStatusState {
  aiEngine: {
    status: ServiceHealth;
    provider: string; // e.g. "Local Engine (Ollama Ready)"
    model: string; // e.g. "Not Loaded"
    detail: string;
  };
  ollama: {
    status: ServiceHealth;
    endpoint: string; // e.g. "http://localhost:11434"
    connected: boolean;
    detail: string;
  };
  macControl: {
    status: ServiceHealth;
    bridgeVersion: string; // e.g. "macOS Bridge v0.1"
    accessibilityGranted: boolean;
    detail: string;
  };
  voice: {
    status: ServiceHealth;
    inputEngine: string; // e.g. "Local Whisper (Standby)"
    outputEngine: string; // e.g. "System Speech Synthesizer"
    detail: string;
  };
}
