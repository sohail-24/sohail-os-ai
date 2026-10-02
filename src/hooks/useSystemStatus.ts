import { useState, useEffect, useCallback } from 'react';
import { SystemStatusState } from '../types';
import { INITIAL_SYSTEM_STATUS } from '../lib/constants';
import { aiService } from '../services/ai';

export function useSystemStatus() {
  const [status, setStatus] = useState<SystemStatusState>(() => {
    // Start with offline / unverified state; never show "Connected" until verified
    return {
      ...INITIAL_SYSTEM_STATUS,
      ollama: {
        ...INITIAL_SYSTEM_STATUS.ollama,
        status: 'checking',
        connected: false,
        detail: 'Testing local Ollama connection...',
      },
    };
  });

  const checkOllamaHealth = useCallback(async () => {
    const endpoint = aiService.getEndpoint ? aiService.getEndpoint() : 'http://localhost:11434';
    const currentModel = aiService.getModel ? aiService.getModel() : 'llama3.2';

    setStatus((prev) => ({
      ...prev,
      ollama: {
        ...prev.ollama,
        status: 'checking',
        endpoint,
        connected: false,
        detail: `Pinging ${endpoint}...`,
      },
    }));

    try {
      const health = await aiService.checkHealth();

      if (health.isAvailable) {
        setStatus((prev) => ({
          ...prev,
          aiEngine: {
            status: 'ready',
            provider: 'Local Ollama Engine',
            model: currentModel,
            detail: `Active local inference engine powered by Ollama. Latency: ${health.latencyMs || 0}ms`,
          },
          ollama: {
            status: 'ready',
            endpoint,
            connected: true,
            detail: `Ollama is running (${health.version || 'active'}) at ${endpoint}.`,
          },
        }));
        return { isAvailable: true, latencyMs: health.latencyMs, version: health.version };
      } else {
        setStatus((prev) => ({
          ...prev,
          aiEngine: {
            status: 'idle',
            provider: 'Local Engine (Ollama)',
            model: `${currentModel} (Offline)`,
            detail: 'Local Ollama daemon is offline or unreachable.',
          },
          ollama: {
            status: 'offline',
            endpoint,
            connected: false,
            detail: health.error || `Cannot reach Ollama at ${endpoint}`,
          },
        }));
        return { isAvailable: false, error: health.error };
      }
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Connection failed';
      setStatus((prev) => ({
        ...prev,
        aiEngine: {
          status: 'idle',
          provider: 'Local Engine (Ollama)',
          model: `${currentModel} (Offline)`,
          detail: 'Local Ollama daemon is offline or unreachable.',
        },
        ollama: {
          status: 'offline',
          endpoint,
          connected: false,
          detail: errorMsg,
        },
      }));
      return { isAvailable: false, error: errorMsg };
    }
  }, []);

  // Ping on initial mount
  useEffect(() => {
    checkOllamaHealth();
  }, [checkOllamaHealth]);

  const updateStatus = (partial: Partial<SystemStatusState>) => {
    setStatus((prev) => ({ ...prev, ...partial }));
  };

  return {
    status,
    updateStatus,
    checkOllamaHealth,
  };
}
