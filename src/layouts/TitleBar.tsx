import React from 'react';
import { MacWindowControls } from '../components/common/MacWindowControls';
import { NavigationTab, SystemStatusState } from '../types';
import { APP_CONFIG } from '../lib/constants';
import { Shield, Sparkles } from 'lucide-react';

interface TitleBarProps {
  currentTab: NavigationTab;
  systemStatus: SystemStatusState;
}

export const TitleBar: React.FC<TitleBarProps> = ({ currentTab, systemStatus }) => {
  const getTabLabel = (tab: NavigationTab) => {
    switch (tab) {
      case 'chat':
        return 'Workspace';
      case 'tasks':
        return 'Autonomous Tasks';
      case 'skills':
        return 'macOS Skills';
      case 'memory':
        return 'Local Memory';
      case 'settings':
        return 'Preferences';
    }
  };

  return (
    <header className="h-10 bg-[#121418] border-b border-neutral-800/80 px-4 flex items-center justify-between select-none shrink-0 z-20">
      {/* Zone 1: macOS Window Controls & App Title */}
      <div className="flex items-center gap-4">
        <MacWindowControls />
        <div className="h-4 w-[1px] bg-neutral-800 hidden sm:block" />
        <span className="text-xs font-semibold tracking-tight text-neutral-200">
          {APP_CONFIG.name}
        </span>
      </div>

      {/* Zone 2: Navigation Breadcrumb */}
      <div className="hidden md:flex items-center gap-1.5 text-xs text-neutral-400">
        <span className="font-mono text-neutral-400 text-[11px]">macOS</span>
        <span className="text-neutral-400" aria-hidden="true">/</span>
        <span className="text-neutral-300 font-medium">{getTabLabel(currentTab)}</span>
      </div>

      {/* Zone 3: Privacy & Target Indicator */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-[11px] text-neutral-400">
          <Shield className="w-3.5 h-3.5 text-neutral-400" />
          <span className="hidden sm:inline">Offline Sandbox</span>
        </div>
      </div>
    </header>
  );
};
