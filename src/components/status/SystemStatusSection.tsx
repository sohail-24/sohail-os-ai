import React, { useState } from 'react';
import { Cpu, HardDrive, Terminal, Mic, X } from 'lucide-react';
import { SystemStatusState, ServiceHealth } from '../../types';

interface SystemStatusSectionProps {
  status: SystemStatusState;
  collapsed?: boolean;
}

export const SystemStatusSection: React.FC<SystemStatusSectionProps> = ({ status, collapsed = false }) => {
  const [selectedService, setSelectedService] = useState<string | null>(null);

  const getServiceStatusDisplay = (
    key: string,
    health: ServiceHealth,
    connected?: boolean
  ): { text: string; dotClass: string } => {
    // Mac Control exact states: Checking, Connected, Permission Required, Disconnected, Error
    if (key === 'macControl') {
      if (health === 'checking') {
        return { text: 'Checking', dotClass: 'bg-amber-400 animate-pulse' };
      }
      if (health === 'ready') {
        return { text: 'Connected', dotClass: 'bg-emerald-500' };
      }
      if (health === 'permission_required') {
        return { text: 'Permission Required', dotClass: 'bg-amber-500' };
      }
      if (health === 'error') {
        return { text: 'Error', dotClass: 'bg-rose-500' };
      }
      return { text: 'Disconnected', dotClass: 'bg-neutral-500' };
    }

    // Ollama exact states: Checking, Connected, Disconnected
    if (key === 'ollama') {
      if (health === 'checking') {
        return { text: 'Checking', dotClass: 'bg-amber-400 animate-pulse' };
      }
      if (connected && health === 'ready') {
        return { text: 'Connected', dotClass: 'bg-emerald-500' };
      }
      return { text: 'Disconnected', dotClass: 'bg-neutral-500' };
    }

    if (key === 'aiEngine') {
      if (health === 'ready') {
        return { text: 'Ready', dotClass: 'bg-emerald-500' };
      }
      if (health === 'idle') {
        return { text: 'Standby', dotClass: 'bg-amber-500' };
      }
      return { text: 'Offline', dotClass: 'bg-neutral-500' };
    }

    switch (health) {
      case 'ready':
        return { text: 'Ready', dotClass: 'bg-emerald-500' };
      case 'idle':
        return { text: 'Standby', dotClass: 'bg-amber-500' };
      case 'offline':
        return { text: 'Offline', dotClass: 'bg-neutral-500' };
      case 'unconfigured':
        return { text: 'Unconfigured', dotClass: 'bg-neutral-600' };
      case 'permission_required':
        return { text: 'Permission Required', dotClass: 'bg-amber-500' };
      case 'error':
        return { text: 'Error', dotClass: 'bg-rose-500' };
      case 'checking':
        return { text: 'Checking', dotClass: 'bg-amber-400 animate-pulse' };
      default:
        return { text: 'Standby', dotClass: 'bg-neutral-500' };
    }
  };

  const items = [
    {
      key: 'aiEngine',
      label: 'AI Engine',
      icon: Cpu,
      health: status.aiEngine.status,
      connected: status.aiEngine.status === 'ready',
      primaryValue: status.aiEngine.provider,
      secondaryValue: status.aiEngine.model,
      detail: status.aiEngine.detail,
    },
    {
      key: 'ollama',
      label: 'Ollama',
      icon: HardDrive,
      health: status.ollama.status,
      connected: status.ollama.connected,
      primaryValue: status.ollama.endpoint,
      secondaryValue: status.ollama.connected ? 'Daemon Reachable' : 'Not Connected',
      detail: status.ollama.detail,
    },
    {
      key: 'macControl',
      label: 'Mac Control',
      icon: Terminal,
      health: status.macControl.status,
      connected: status.macControl.status === 'ready',
      primaryValue: '127.0.0.1:11435',
      secondaryValue: status.macControl.accessibilityGranted ? 'Accessibility Authorized' : 'Bridge Dormant / No AX',
      detail: status.macControl.detail,
    },
    {
      key: 'voice',
      label: 'Voice',
      icon: Mic,
      health: status.voice.status,
      connected: false,
      primaryValue: status.voice.inputEngine,
      secondaryValue: 'Engine Idle',
      detail: status.voice.detail,
    },
  ];

  if (collapsed) {
    return (
      <div className="p-3 border-t border-neutral-800/80 flex flex-col gap-2 items-center">
        {items.map((item) => {
          const Icon = item.icon;
          const display = getServiceStatusDisplay(item.key, item.health, item.connected);
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setSelectedService(item.key)}
              title={`${item.label}: ${display.text}`}
              className="relative p-2 rounded-md hover:bg-neutral-800/60 text-neutral-400 hover:text-neutral-200 transition-colors"
            >
              <Icon className="w-4 h-4" />
              <span
                className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${display.dotClass}`}
              />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="border-t border-neutral-800/80 bg-neutral-900/40 p-3.5">
      <div className="flex items-center justify-between mb-2.5">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-neutral-400">
          System Status
        </span>
        <span className="text-[11px] font-mono text-neutral-400 tabular-nums">
          macOS Bridge
        </span>
      </div>

      <div className="space-y-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const display = getServiceStatusDisplay(item.key, item.health, item.connected);

          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setSelectedService(item.key)}
              className="w-full text-left px-2 py-1.5 rounded-md hover:bg-neutral-800/50 transition-colors flex items-center justify-between group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <Icon className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-300 shrink-0" />
                <span className="text-xs font-medium text-neutral-300 truncate">
                  {item.label}
                </span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[11px] text-neutral-400 group-hover:text-neutral-300">
                  {display.text}
                </span>
                <span className={`w-1.5 h-1.5 rounded-full ${display.dotClass}`} />
              </div>
            </button>
          );
        })}
      </div>

      {/* Detail Inspector Modal */}
      {selectedService && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-5 max-w-md w-full shadow-2xl">
            {(() => {
              const current = items.find((i) => i.key === selectedService);
              if (!current) return null;
              const Icon = current.icon;
              const display = getServiceStatusDisplay(current.key, current.health, current.connected);

              return (
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5 text-neutral-300" />
                      <h4 className="text-sm font-semibold text-neutral-100">{current.label} Diagnostics</h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedService(null)}
                      className="text-neutral-400 hover:text-neutral-200 p-1 rounded-md hover:bg-neutral-800 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="py-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-400">Current Health</span>
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${display.dotClass}`} />
                        <span className="font-medium text-neutral-200">{display.text}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-400">Target / Endpoint</span>
                      <span className="font-mono text-neutral-200">{current.primaryValue}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="text-neutral-400">Runtime Status</span>
                      <span className="text-neutral-300">{current.secondaryValue}</span>
                    </div>

                    <div className="pt-2 border-t border-neutral-800/80">
                      <span className="text-[11px] font-medium text-neutral-400 block mb-1">
                        Diagnostics & Details:
                      </span>
                      <p className="text-xs text-neutral-400 leading-relaxed bg-neutral-950/60 p-3 rounded-md border border-neutral-800/50 whitespace-pre-line font-mono text-[11px]">
                        {current.detail}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-800 flex justify-end">
                    <button
                      type="button"
                      onClick={() => setSelectedService(null)}
                      className="px-3 py-1.5 text-xs font-medium text-neutral-300 hover:text-white bg-neutral-800 hover:bg-neutral-700 rounded-md transition-colors"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
