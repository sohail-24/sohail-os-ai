/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { MainLayout } from './layouts/MainLayout';
import { ChatWorkspacePage } from './pages/ChatWorkspacePage';
import { TasksPage } from './pages/TasksPage';
import { SkillsPage } from './pages/SkillsPage';
import { MemoryPage } from './pages/MemoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { NavigationTab } from './types';
import { useSystemStatus } from './hooks/useSystemStatus';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavigationTab>('chat');
  const { status: systemStatus, checkOllamaHealth } = useSystemStatus();

  return (
    <MainLayout
      currentTab={currentTab}
      onSelectTab={setCurrentTab}
      systemStatus={systemStatus}
    >
      {currentTab === 'chat' && <ChatWorkspacePage />}
      {currentTab === 'tasks' && <TasksPage />}
      {currentTab === 'skills' && <SkillsPage />}
      {currentTab === 'memory' && <MemoryPage />}
      {currentTab === 'settings' && <SettingsPage onRefreshStatus={checkOllamaHealth} />}
    </MainLayout>
  );
}
