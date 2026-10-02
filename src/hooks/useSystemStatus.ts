import { useState, useEffect, useCallback } from 'react';
import { SystemStatusState } from '../types';
import { INITIAL_SYSTEM_STATUS } from '../lib/constants';
import { aiService } from '../services/ai';
import { macControlService } from '../services/mac';

export function useSystemStatus() {
  const [status, setStatus] = useState<SystemStatusState>(() => {
    return {
      ...INITIAL_SYSTEM_STATUS,
      ollama: {
        ...INITIAL_SYSTEM_STATUS.ollama,
        status: 'checking',
        connected: false,
        detail: 'Testing local Ollama connection...',
      },
      macControl: {
        ...INITIAL_SYSTEM_STATUS.macControl,
        status: 'checking',
        accessibilityGranted: false,
        detail: 'Pinging local macOS bridge at http://127.0.0.1:11435...',
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

  const checkMacControlHealth = useCallback(async () => {
    setStatus((prev) => ({
      ...prev,
      macControl: {
        ...prev.macControl,
        status: 'checking',
        detail: 'Pinging native macOS bridge...',
      },
    }));

    try {
      const health = await macControlService.checkBridgeHealth();

      if (health.status === 'ok') {
        const isAccessGranted = Boolean(health.accessibilityGranted);
        const frontmostName = health.frontmostApp?.name || 'None';

        setStatus((prev) => ({
          ...prev,
          macControl: {
            status: isAccessGranted ? 'ready' : 'permission_required',
            bridgeVersion: `v${health.version || '0.1.0'}`,
            accessibilityGranted: isAccessGranted,
            detail: isAccessGranted
              ? `Connected to native macOS bridge (v${health.version || '0.1.0'}) on ${health.osVersion || 'macOS'}. Active App: ${frontmostName}`
              : 'Accessibility permission required. Please enable it in macOS System Settings → Privacy & Security → Accessibility.',
          },
        }));
        return health;
      } else if (health.status === 'error') {
        setStatus((prev) => ({
          ...prev,
          macControl: {
            status: 'error',
            bridgeVersion: 'Error',
            accessibilityGranted: false,
            detail: health.error || 'Mac Control Bridge error',
          },
        }));
        return health;
      } else {
        setStatus((prev) => ({
          ...prev,
          macControl: {
            status: 'offline',
            bridgeVersion: 'Unavailable',
            accessibilityGranted: false,
            detail: 'Mac Control Bridge unavailable (Run "swift run" in mac-bridge/)',
          },
        }));
        return health;
      }
    } catch {
      setStatus((prev) => ({
        ...prev,
        macControl: {
          status: 'offline',
          bridgeVersion: 'Unavailable',
          accessibilityGranted: false,
          detail: 'Mac Control Bridge unavailable (Run "swift run" in mac-bridge/)',
        },
      }));
      return { status: 'unavailable' as const };
    }
  }, []);

  // Ping on initial mount
  useEffect(() => {
    checkOllamaHealth();
    checkMacControlHealth();
  }, [checkOllamaHealth, checkMacControlHealth]);

  const updateStatus = (partial: Partial<SystemStatusState>) => {
    setStatus((prev) => ({ ...prev, ...partial }));
  };

  return {
    status,
    updateStatus,
    checkOllamaHealth,
    checkMacControlHealth,
  };
}
