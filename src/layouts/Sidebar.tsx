import React from 'react';
import { MessageSquare, CheckSquare, Layers, Database, Settings, Terminal, Shield } from 'lucide-react';
import { NavigationTab, SystemStatusState } from '../types';
import { SystemStatusSection } from '../components/status/SystemStatusSection';
import { APP_CONFIG } from '../lib/constants';

interface SidebarProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  systemStatus: SystemStatusState;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  systemStatus,
}) => {
  const navItems: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'chat', label: 'Chat & Workspace', icon: MessageSquare },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'skills', label: 'macOS Skills', icon: Layers },
    { id: 'memory', label: 'Memory', icon: Database },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-[#111317] border-r border-neutral-800/80 flex flex-col justify-between shrink-0 select-none z-10">
      {/* Brand Lockup & OS Header */}
      <div>
        <div className="p-4 pb-3 border-b border-neutral-800/60 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-neutral-800 border border-neutral-700/80 flex items-center justify-center shadow-xs">
              <span className="font-mono text-xs font-bold text-neutral-100">S</span>
            </div>
            <div>
              <h1 className="text-xs font-bold text-neutral-100 tracking-tight leading-none">
                {APP_CONFIG.name}
              </h1>
              <span className="text-[10px] text-neutral-400 font-mono leading-none mt-1 block">
                Local-First OS
              </span>
            </div>
          </div>
          <span className="text-[10px] font-mono text-neutral-400 bg-neutral-900 border border-neutral-800 px-1.5 py-0.5 rounded">
            ARM64
          </span>
        </div>

        {/* Primary Navigation Links */}
        <nav className="p-2 space-y-1" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-neutral-800/90 text-neutral-100 shadow-xs border border-neutral-700/50'
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-850/50'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-neutral-200' : 'text-neutral-400'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* System Status Section (Bottom of Sidebar) */}
      <SystemStatusSection status={systemStatus} />
    </aside>
  );
};
