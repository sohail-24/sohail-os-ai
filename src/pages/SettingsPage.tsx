import React, { useState, useEffect } from 'react';
import { Settings, Cpu, HardDrive, Terminal, Shield, Mic, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { APP_CONFIG } from '../lib/constants';
import { aiService } from '../services/ai';

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

  // Connection testing state
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    status: 'idle' | 'success' | 'error';
    message?: string;
    latencyMs?: number;
    version?: string;
  }>({ status: 'idle' });

  // Installed models discovered on local machine
  const [availableModels, setAvailableModels] = useState<string[]>([]);

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

  // Sync endpoint changes
  const handleEndpointChange = (val: string) => {
    setOllamaEndpoint(val);
    if (aiService.setEndpoint) {
      aiService.setEndpoint(val);
    }
  };

  // Sync model changes
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

  // Action: Test Ollama Connection
  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult({ status: 'idle' });

    // Ensure endpoint in service is updated before test
    if (aiService.setEndpoint) {
      aiService.setEndpoint(ollamaEndpoint);
    }

    try {
      const health = await aiService.checkHealth();

      if (health.isAvailable) {
        setTestResult({
          status: 'success',
          version: health.version,
          latencyMs: health.latencyMs,
          message: `Ollama is running (${health.version || 'active'}) at ${ollamaEndpoint}.`,
        });

        // Query available models from the local instance
        const models = await aiService.getAvailableModels();
        if (models.length > 0) {
          setAvailableModels(models);
        }
      } else {
        setTestResult({
          status: 'error',
          message: health.error || `Cannot reach Ollama at ${ollamaEndpoint}.`,
        });
      }

      // Notify global status hook to re-evaluate
      if (onRefreshStatus) {
        await onRefreshStatus();
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Connection failed';
      setTestResult({
        status: 'error',
        message: msg,
      });
      if (onRefreshStatus) {
        await onRefreshStatus();
      }
    } finally {
      setIsTesting(false);
    }
  };

  // Load existing models if connected on load
  useEffect(() => {
    aiService.getAvailableModels().then((models) => {
      if (models.length > 0) {
        setAvailableModels(models);
      }
    });
  }, []);

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
            <span>macOS Permissions</span>
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
          {activeTab === 'models' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-neutral-100 mb-1">Local Ollama AI Configuration</h3>
                <p className="text-xs text-neutral-400">
                  Configure connection to your on-device Ollama HTTP API. Zero cloud calls, zero API keys required.
                </p>
              </div>

              {/* Server Endpoint Box */}
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
                      onClick={handleTestConnection}
                      disabled={isTesting}
                      className="px-3.5 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                      <span>{isTesting ? 'Testing...' : 'Test Ollama Connection'}</span>
                    </button>
                  </div>
                  <span className="text-[11px] text-neutral-500 mt-1.5 block">
                    Default endpoint is <code className="text-neutral-400 font-mono">http://localhost:11434</code>.
                  </span>
                </div>

                {/* Connection Test Feedback Result */}
                {testResult.status !== 'idle' && (
                  <div
                    className={`p-3 rounded-lg border text-xs leading-relaxed ${
                      testResult.status === 'success'
                        ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
                        : 'bg-rose-950/20 border-rose-900/40 text-rose-300'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      {testResult.status === 'success' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div className="space-y-1">
                        <div className="font-medium">
                          {testResult.status === 'success'
                            ? `Connected to Ollama (latency: ${testResult.latencyMs || 0}ms)`
                            : 'Ollama Connection Failed'}
                        </div>
                        <p className="text-[11px] opacity-90 whitespace-pre-line font-mono">
                          {testResult.message}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Model Configuration */}
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

                  {/* Custom model input if chosen */}
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

              {/* Mac Terminal Command Instructions */}
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

          {activeTab === 'mac' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-semibold text-neutral-100 mb-1">macOS System Entitlements</h3>
                <p className="text-xs text-neutral-400">
                  Capabilities required by SOHAIL OS AI to interact with your Mac via the upcoming native daemon bridge.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    title: 'Accessibility API',
                    desc: 'Required for UI automation, clicking buttons, and reading window hierarchy',
                    status: 'Pending Bridge Setup',
                  },
                  {
                    title: 'Full Disk Access',
                    desc: 'Required for indexing local project directories and reorganizing ~/Downloads',
                    status: 'Pending Bridge Setup',
                  },
                  {
                    title: 'Apple Events & Automation',
                    desc: 'Required for scripting Safari, Finder, Calendar, Notes, and Mail',
                    status: 'Pending Bridge Setup',
                  },
                  {
                    title: 'Terminal / Shell Execution',
                    desc: 'Required for developer commands and git automation',
                    status: 'Pending Bridge Setup',
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-medium text-neutral-200 mb-0.5">{item.title}</h4>
                      <p className="text-[11px] text-neutral-400">{item.desc}</p>
                    </div>
                    <span className="text-[11px] text-neutral-400 font-mono">
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

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
