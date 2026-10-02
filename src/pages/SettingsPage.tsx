import React, { useState, useEffect, useCallback } from 'react';
import {
  Settings,
  Cpu,
  Terminal,
  Shield,
  Mic,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  AppWindow,
  ExternalLink,
  Info
} from 'lucide-react';
import { APP_CONFIG } from '../lib/constants';
import { aiService } from '../services/ai';
import { macControlService } from '../services/mac';
import { MacAppInfo, MacBridgeHealth, MacAccessibilityStatus } from '../types';

interface SettingsPageProps {
  onRefreshStatus?: () => Promise<unknown>;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onRefreshStatus }) => {
  const [activeTab, setActiveTab] = useState<'models' | 'mac' | 'voice' | 'general'>('models');

  // Configurable local Ollama settings (default http://localhost:11434)
  const [ollamaEndpoint, setOllamaEndpoint] = useState<string>(() =>
    aiService.getEndpoint ? aiService.getEndpoint() : 'http://localhost:11434'
  );

  const [selectedModel, setSelectedModel] = useState<string>(() =>
    aiService.getModel ? aiService.getModel() : 'llama3.2'
  );

  const [customModelInput, setCustomModelInput] = useState<string>('');
  const [isCustomModel, setIsCustomModel] = useState<boolean>(false);

  // Connection testing state for Ollama
  const [isTestingOllama, setIsTestingOllama] = useState(false);
  const [ollamaTestResult, setOllamaTestResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message?: string;
    latencyMs?: number;
    version?: string;
  }>({ status: 'idle' });

  // Installed models discovered on local machine
  const [availableModels, setAvailableModels] = useState<string[]>([]);

  // Mac Control Bridge state
  const [bridgeEndpoint, setBridgeEndpoint] = useState<string>(() =>
    macControlService.getEndpoint ? macControlService.getEndpoint() : 'http://127.0.0.1:11435'
  );
  const [isRefreshingMac, setIsRefreshingMac] = useState(false);
  const [macHealth, setMacHealth] = useState<MacBridgeHealth | null>(null);
  const [macAccessibility, setMacAccessibility] = useState<MacAccessibilityStatus | null>(null);
  const [runningApps, setRunningApps] = useState<MacAppInfo[]>([]);
  const [frontmostApp, setFrontmostApp] = useState<MacAppInfo | null>(null);

  const defaultSuggestedModels = [
    'llama3.2:latest',
    'llama3.2',
    'llama3.1:8b',
    'qwen2.5-coder:7b',
    'qwen2.5-coder:latest',
    'mistral:latest',
    'deepseek-r1:8b',
    'phi4:latest',
  ];

  // Refresh Mac Control Status
  const refreshMacStatus = useCallback(async () => {
    setIsRefreshingMac(true);
    try {
      const health = await macControlService.checkBridgeHealth();
      setMacHealth(health);

      if (health.status === 'ok') {
        const [access, apps, front] = await Promise.all([
          macControlService.checkAccessibility(),
          macControlService.getRunningApps(),
          macControlService.getFrontmostApp(),
        ]);
        setMacAccessibility(access);
        setRunningApps(apps);
        setFrontmostApp(front);
      } else {
        setMacAccessibility(null);
        setRunningApps([]);
        setFrontmostApp(null);
      }

      if (onRefreshStatus) {
        await onRefreshStatus();
      }
    } catch {
      setMacHealth({
        status: 'unavailable',
        error: 'Mac Control Bridge unavailable (Run "swift run" in mac-bridge/)',
      });
      setMacAccessibility(null);
      setRunningApps([]);
      setFrontmostApp(null);
    } finally {
      setIsRefreshingMac(false);
    }
  }, [onRefreshStatus]);

  // Initial load
  useEffect(() => {
    aiService.getAvailableModels().then((models) => {
      if (models.length > 0) {
        setAvailableModels(models);
      }
    });
    refreshMacStatus();
  }, [refreshMacStatus]);

  const handleEndpointChange = (val: string) => {
    setOllamaEndpoint(val);
    if (aiService.setEndpoint) {
      aiService.setEndpoint(val);
    }
  };

  const handleBridgeEndpointChange = (val: string) => {
    setBridgeEndpoint(val);
    if (macControlService.setEndpoint) {
      macControlService.setEndpoint(val);
    }
  };

  const handleModelSelect = (val: string) => {
    if (val === '__custom__') {
      setIsCustomModel(true);
      return;
    }
    setIsCustomModel(false);
    setSelectedModel(val);
    if (aiService.setModel) {
      aiService.setModel(val);
    }
  };

  const handleCustomModelApply = () => {
    const trimmed = customModelInput.trim();
    if (!trimmed) return;
    setSelectedModel(trimmed);
    if (aiService.setModel) {
      aiService.setModel(trimmed);
    }
  };

  const handleTestOllamaConnection = async () => {
    setIsTestingOllama(true);
    setOllamaTestResult({ status: 'idle' });

    if (aiService.setEndpoint) {
      aiService.setEndpoint(ollamaEndpoint);
    }

    try {
      const health = await aiService.checkHealth();

      if (health.isAvailable) {
        setOllamaTestResult({
          status: 'success',
          version: health.version,
          latencyMs: health.latencyMs,
          message: `Ollama is running (${health.version || 'active'}) at ${ollamaEndpoint}.`,
        });

        const models = await aiService.getAvailableModels();
        if (models.length > 0) {
          setAvailableModels(models);
        }
      } else {
        setOllamaTestResult({
          status: 'error',
          message: health.error || `Cannot reach Ollama at ${ollamaEndpoint}.`,
        });
      }

      if (onRefreshStatus) {
        await onRefreshStatus();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Connection failed';
      setOllamaTestResult({
        status: 'error',
        message: msg,
      });
      if (onRefreshStatus) {
        await onRefreshStatus();
      }
    } finally {
      setIsTestingOllama(false);
    }
  };

  const allModelOptions = Array.from(new Set([...availableModels, ...defaultSuggestedModels]));

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0e1014]">
      {/* Settings Header */}
      <div className="h-12 border-b border-neutral-800/80 px-6 flex items-center justify-between shrink-0 bg-neutral-900/30">
        <div className="flex items-center gap-2">
          <Settings className="w-4 h-4 text-neutral-400" />
          <h2 className="text-sm font-semibold text-neutral-200">System Preferences</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <span>{APP_CONFIG.targetPlatform}</span>
          <span aria-hidden="true">·</span>
          <span>v{APP_CONFIG.version}</span>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        {/* Settings Secondary Navigation */}
        <div className="w-56 border-r border-neutral-800/80 p-3 space-y-1 shrink-0 bg-neutral-950/40">
          <button
            type="button"
            onClick={() => setActiveTab('models')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
              activeTab === 'models'
                ? 'bg-neutral-800 text-neutral-100'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <Cpu className="w-4 h-4" />
            <span>Local Models (Ollama)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('mac')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
              activeTab === 'mac'
                ? 'bg-neutral-800 text-neutral-100'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Mac Control & Bridge</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('voice')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
              activeTab === 'voice'
                ? 'bg-neutral-800 text-neutral-100'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>Speech & Voice</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
              activeTab === 'general'
                ? 'bg-neutral-800 text-neutral-100'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Security & Privacy</span>
          </button>
        </div>

        {/* Settings Tab Content */}
        <div className="flex-1 overflow-y-auto p-8 max-w-3xl">
          {/* TAB 1: LOCAL OLLAMA MODELS */}
          {activeTab === 'models' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-neutral-100 mb-1">Local Ollama AI Configuration</h3>
                <p className="text-xs text-neutral-400">
                  Configure connection to your on-device Ollama HTTP API. Zero cloud calls, zero API keys required.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                    Ollama Server Endpoint
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ollamaEndpoint}
                      onChange={(e) => handleEndpointChange(e.target.value)}
                      placeholder="http://localhost:11434"
                      className="flex-1 px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-200 focus:outline-none focus:border-neutral-700"
                    />
                    <button
                      type="button"
                      onClick={handleTestOllamaConnection}
                      disabled={isTestingOllama}
                      className="px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isTestingOllama ? 'animate-spin' : ''}`} />
                      <span>{isTestingOllama ? 'Testing...' : 'Test Ollama Connection'}</span>
                    </button>
                  </div>
                  <span className="text-[11px] text-neutral-500 mt-1.5 block">
                    Default endpoint is <code className="text-neutral-400 font-mono">http://localhost:11434</code>.
                  </span>
                </div>

                {ollamaTestResult.status !== 'idle' && (
                  <div
                    className={`p-3 rounded-lg border text-xs leading-relaxed ${
                      ollamaTestResult.status === 'success'
                        ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
                        : 'bg-rose-950/20 border-rose-900/40 text-rose-300'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {ollamaTestResult.status === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-1">
                        <div className="font-medium">
                          {ollamaTestResult.status === 'success'
                            ? `Connected to Ollama (latency: ${ollamaTestResult.latencyMs || 0}ms)`
                            : 'Ollama Connection Failed'}
                        </div>
                        <p className="text-[11px] opacity-90 whitespace-pre-line font-mono">
                          {ollamaTestResult.message}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-neutral-800/80 space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-neutral-300 mb-1.5">
                      Active Local Model
                    </label>
                    <select
                      value={isCustomModel ? '__custom__' : selectedModel}
                      onChange={(e) => handleModelSelect(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-200 focus:outline-none focus:border-neutral-700"
                    >
                      {allModelOptions.map((model) => (
                        <option key={model} value={model}>
                          {model} {availableModels.includes(model) ? '(installed locally)' : ''}
                        </option>
                      ))}
                      <option value="__custom__">+ Enter custom model name...</option>
                    </select>
                  </div>

                  {isCustomModel && (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={customModelInput}
                        onChange={(e) => setCustomModelInput(e.target.value)}
                        placeholder="e.g. codellama:13b or hermes3:latest"
                        className="flex-1 px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-200 focus:outline-none focus:border-neutral-700"
                      />
                      <button
                        type="button"
                        onClick={handleCustomModelApply}
                        disabled={!customModelInput.trim()}
                        className="px-3 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium disabled:opacity-50"
                      >
                        Apply Model
                      </button>
                    </div>
                  )}

                  <div className="text-[11px] text-neutral-400">
                    Currently configured model: <span className="font-mono text-neutral-200">{selectedModel}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/80 space-y-3">
                <div className="flex items-center gap-2 text-xs font-medium text-neutral-300">
                  <Terminal className="w-4 h-4 text-neutral-400" />
                  <span>How to Run Ollama Locally on your Mac</span>
                </div>
                <div className="text-xs text-neutral-400 space-y-2">
                  <p>1. Start the local Ollama service in Terminal:</p>
                  <pre className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 font-mono text-[11px] text-neutral-300 select-all">
                    OLLAMA_ORIGINS="*" ollama serve
                  </pre>
                  <p>2. Download a recommended model:</p>
                  <pre className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-800 font-mono text-[11px] text-neutral-300 select-all">
                    ollama pull llama3.2
                  </pre>
                  <p className="text-[11px] text-neutral-500">
                    Tip: Setting <code className="text-neutral-400 font-mono">OLLAMA_ORIGINS="*"</code> allows web applications to communicate with your Mac's local daemon without browser CORS restriction.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MAC CONTROL & NATIVE BRIDGE DIAGNOSTICS */}
          {activeTab === 'mac' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-neutral-100 mb-1">Mac Control & Native Bridge</h3>
                <p className="text-xs text-neutral-400">
                  Real-time status of the local Swift bridge that connects SOHAIL OS AI to native macOS APIs.
                </p>
              </div>

              {/* Bridge Connection & Diagnostics Card */}
              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-800/80">
                  <div>
                    <h4 className="text-xs font-semibold text-neutral-200">Mac Control Bridge</h4>
                    <span className="text-[11px] font-mono text-neutral-400">{bridgeEndpoint}</span>
                  </div>
                  <button
                    type="button"
                    onClick={refreshMacStatus}
                    disabled={isRefreshingMac}
                    className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRefreshingMac ? 'animate-spin' : ''}`} />
                    <span>{isRefreshingMac ? 'Checking...' : 'Refresh Mac Status'}</span>
                  </button>
                </div>

                {/* Primary Diagnostics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  {/* Status */}
                  <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/60">
                    <span className="text-[11px] text-neutral-400 block mb-1">Bridge Status</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${
                          macHealth?.status === 'ok'
                            ? macAccessibility?.granted
                              ? 'bg-emerald-500'
                              : 'bg-amber-500'
                            : 'bg-neutral-500'
                        }`}
                      />
                      <span className="font-semibold text-neutral-100">
                        {isRefreshingMac
                          ? 'Checking'
                          : macHealth?.status === 'ok'
                          ? macAccessibility?.granted
                            ? 'Connected'
                            : 'Permission Required'
                          : 'Disconnected'}
                      </span>
                    </div>
                  </div>

                  {/* Accessibility Permission */}
                  <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/60">
                    <span className="text-[11px] text-neutral-400 block mb-1">Accessibility Permission</span>
                    <div className="flex items-center gap-2">
                      {macAccessibility?.granted ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                      )}
                      <span
                        className={`font-semibold ${
                          macAccessibility?.granted ? 'text-emerald-300' : 'text-amber-300'
                        }`}
                      >
                        {macHealth?.status === 'ok'
                          ? macAccessibility?.granted
                            ? 'Granted'
                            : 'Accessibility permission required'
                          : 'Bridge Not Connected'}
                      </span>
                    </div>
                  </div>

                  {/* Frontmost Application */}
                  <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/60">
                    <span className="text-[11px] text-neutral-400 block mb-1">Frontmost Application</span>
                    <div className="flex items-center gap-2 min-w-0">
                      <AppWindow className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span className="font-mono text-neutral-200 truncate">
                        {frontmostApp
                          ? `${frontmostApp.name} (${frontmostApp.bundleId || `PID ${frontmostApp.processId}`})`
                          : 'Unavailable'}
                      </span>
                    </div>
                  </div>

                  {/* Running Application Count */}
                  <div className="p-3 rounded-lg bg-neutral-950/60 border border-neutral-800/60">
                    <span className="text-[11px] text-neutral-400 block mb-1">Running Application Count</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-neutral-100 text-sm font-semibold tabular-nums">
                        {macHealth?.status === 'ok' ? `${runningApps.length} active apps` : 'Unavailable'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* If Bridge Unavailable: Clear Instruction Banner */}
                {macHealth?.status !== 'ok' && !isRefreshingMac && (
                  <div className="p-4 rounded-xl bg-neutral-950/80 border border-neutral-800 space-y-2">
                    <div className="flex items-center gap-2 text-neutral-300 text-xs font-semibold">
                      <Info className="w-4 h-4 text-neutral-400" />
                      <span>Mac Control Bridge unavailable</span>
                    </div>
                    <p className="text-xs text-neutral-400 leading-relaxed">
                      The browser application continues working normally. To activate native macOS inspection, build and launch the local Swift bridge:
                    </p>
                    <pre className="bg-neutral-900 p-2.5 rounded-lg border border-neutral-800 font-mono text-[11px] text-neutral-300 select-all">
                      cd mac-bridge && swift run
                    </pre>
                  </div>
                )}

                {/* Accessibility Missing Instructions */}
                {macHealth?.status === 'ok' && !macAccessibility?.granted && (
                  <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 text-xs text-amber-200 space-y-2">
                    <div className="flex items-center gap-2 font-semibold text-amber-300">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Accessibility permission required</span>
                    </div>
                    <p className="text-neutral-300 leading-relaxed text-[11px]">
                      macOS requires affirmative user consent for applications inspecting window and process state.
                      Please enable it manually in:
                    </p>
                    <div className="p-2.5 rounded-lg bg-neutral-950 border border-neutral-800 font-mono text-[11px] text-neutral-200">
                      System Settings → Privacy & Security → Accessibility
                    </div>
                    <p className="text-neutral-400 text-[11px]">
                      Toggle ON your Terminal application (or the compiled <code className="font-mono text-neutral-300">sohail-mac-bridge</code> executable). Then click <strong>Refresh Mac Status</strong> above.
                    </p>
                  </div>
                )}

                {/* Running Applications Explorer (when connected) */}
                {macHealth?.status === 'ok' && runningApps.length > 0 && (
                  <div className="pt-3 border-t border-neutral-800/80 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-neutral-300">Running GUI Applications (NSWorkspace)</span>
                      <span className="font-mono text-[11px] text-neutral-500 tabular-nums">
                        {runningApps.length} processes
                      </span>
                    </div>
                    <div className="max-h-48 overflow-y-auto space-y-1 pr-1">
                      {runningApps.map((app) => (
                        <div
                          key={`${app.bundleId}-${app.processId}`}
                          className="flex items-center justify-between p-2 rounded-lg bg-neutral-950/40 border border-neutral-800/40 text-xs"
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-medium text-neutral-200 truncate">{app.name}</span>
                            {app.isActive && (
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-emerald-950 border border-emerald-800 text-emerald-400">
                                Active
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] font-mono text-neutral-500 shrink-0">
                            {app.processId && <span>PID: {app.processId}</span>}
                            <span>{app.bundleId}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Endpoint Configuration & Security Note */}
              <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/80 space-y-3">
                <h4 className="text-xs font-semibold text-neutral-300">Bridge Configuration & Security Sandbox</h4>
                <div className="space-y-2">
                  <label className="block text-[11px] text-neutral-400">
                    Localhost Bridge URL
                  </label>
                  <input
                    type="text"
                    value={bridgeEndpoint}
                    onChange={(e) => handleBridgeEndpointChange(e.target.value)}
                    placeholder="http://127.0.0.1:11435"
                    className="w-full px-3 py-2 rounded-lg bg-neutral-950 border border-neutral-800 text-xs font-mono text-neutral-200 focus:outline-none focus:border-neutral-700"
                  />
                  <p className="text-[11px] text-neutral-500">
                    The bridge listens strictly on <code className="font-mono text-neutral-400">127.0.0.1</code>. It is never exposed to the local network or the internet.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: VOICE & AUDIO */}
          {activeTab === 'voice' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-neutral-100 mb-1">Voice & Audio Pipeline</h3>
                <p className="text-xs text-neutral-400">
                  Settings for future on-device speech recognition and voice response synthesis.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-neutral-200 block">Speech-to-Text Engine</span>
                    <span className="text-[11px] text-neutral-400">Local Whisper (whisper.cpp / CoreML)</span>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400">Standby</span>
                </div>

                <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-neutral-200 block">Text-to-Speech Engine</span>
                    <span className="text-[11px] text-neutral-400">macOS System Voices (Samantha / Siri)</span>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400">Standby</span>
                </div>

                <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-medium text-neutral-200 block">Wake Word Activation</span>
                    <span className="text-[11px] text-neutral-400">"Hey Sohail" hotword detection</span>
                  </div>
                  <span className="text-[11px] font-mono text-neutral-400">Disabled</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GENERAL & PRIVACY */}
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-neutral-100 mb-1">Security & Local Isolation</h3>
                <p className="text-xs text-neutral-400">
                  Architectural guarantees for SOHAIL OS AI.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-neutral-900/60 border border-neutral-800 space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-0.5">
                    <span className="font-medium text-neutral-200 block">Zero Telemetry Collection</span>
                    <p className="text-neutral-400">No user prompts, system metrics, or keystrokes leave your machine.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3 border-t border-neutral-800/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-0.5">
                    <span className="font-medium text-neutral-200 block">No Cloud AI Dependencies</span>
                    <p className="text-neutral-400">No Gemini, OpenAI, Claude, or third-party cloud API keys.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-3 border-t border-neutral-800/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="text-xs space-y-0.5">
                    <span className="font-medium text-neutral-200 block">Explicit Confirmation Gates</span>
                    <p className="text-neutral-400">Destructive actions (file delete, shell scripts) require affirmative approval.</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
