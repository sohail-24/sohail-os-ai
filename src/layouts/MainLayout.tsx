import React from 'react';
import { TitleBar } from './TitleBar';
import { Sidebar } from './Sidebar';
import { NavigationTab, SystemStatusState } from '../types';

interface MainLayoutProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  systemStatus: SystemStatusState;
  children: React.ReactNode;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  currentTab,
  onSelectTab,
  systemStatus,
  children,
}) => {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0c0d10] text-neutral-100">
      {/* Outer macOS Desktop Container Frame */}
      <div className="flex-1 flex flex-col h-full w-full overflow-hidden bg-[#0e1014] border border-neutral-800/80 shadow-2xl">
        {/* macOS Window Title Bar */}
        <TitleBar currentTab={currentTab} systemStatus={systemStatus} />

        {/* Inner Content Area: Sidebar + Active Workspace */}
        <div className="flex-1 flex overflow-hidden">
          <Sidebar
            currentTab={currentTab}
            onSelectTab={onSelectTab}
            systemStatus={systemStatus}
          />
          <main className="flex-1 flex flex-col overflow-hidden relative">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
