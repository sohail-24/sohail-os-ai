import React, { useState } from 'react';
import { Layers, Terminal, FolderKanban, AppWindow, Cpu, Sliders, ToggleLeft, ToggleRight, Sparkles } from 'lucide-react';
import { MacSkill, SkillCategory } from '../types';

export const SkillsPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [skills, setSkills] = useState<MacSkill[]>([
    {
      id: 'skill_app_launch',
      name: 'Application Launcher & Focus',
      category: 'app_automation',
      description: 'Open, switch focus, and close native macOS applications via NSWorkspace',
      enabled: true,
      requiredPermissions: ['accessibility'],
      author: 'built-in',
    },
    {
      id: 'skill_fs_manager',
      name: 'Local Filesystem Operations',
      category: 'filesystem',
      description: 'List directories, search files, read documents, and safely move files locally',
      enabled: true,
      requiredPermissions: ['fullDiskAccess'],
      author: 'built-in',
    },
    {
      id: 'skill_window_arrange',
      name: 'Window Grid & Space Management',
      category: 'window_management',
      description: 'Snap windows, tile active applications, and manage multiple displays',
      enabled: false,
      requiredPermissions: ['accessibility'],
      author: 'built-in',
    },
    {
      id: 'skill_terminal_exec',
      name: 'Sandboxed Terminal Runner',
      category: 'terminal',
      description: 'Run authorized bash/zsh shell scripts with confirmation gates',
      enabled: false,
      requiredPermissions: ['terminal'],
      author: 'built-in',
    },
    {
      id: 'skill_system_control',
      name: 'macOS Volume & Display Controls',
      category: 'system_control',
      description: 'Adjust screen brightness, volume, Dark Mode, and Do Not Disturb',
      enabled: true,
      requiredPermissions: [],
      author: 'built-in',
    },
    {
      id: 'skill_notes_reminders',
      name: 'Apple Notes & Reminders Bridge',
      category: 'productivity',
      description: 'Read and append to local Apple Notes and macOS Reminders lists',
      enabled: true,
      requiredPermissions: ['automation'],
      author: 'built-in',
    },
  ]);

  const toggleSkill = (id: string) => {
    setSkills((prev) =>
      prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s))
    );
  };

  const filteredSkills =
    selectedCategory === 'all'
      ? skills
      : skills.filter((s) => s.category === selectedCategory);

  const getCategoryIcon = (category: SkillCategory) => {
    switch (category) {
      case 'app_automation':
        return AppWindow;
      case 'filesystem':
        return FolderKanban;
      case 'window_management':
        return Sliders;
      case 'terminal':
        return Terminal;
      case 'system_control':
        return Cpu;
      default:
        return Sparkles;
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0e1014]">
      {/* Header */}
      <div className="h-12 border-b border-neutral-800/80 px-6 flex items-center justify-between shrink-0 bg-neutral-900/30">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-neutral-400" />
          <h2 className="text-sm font-semibold text-neutral-200">macOS Skills Catalog</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span>{skills.filter((s) => s.enabled).length} Active</span>
          <span aria-hidden="true">·</span>
          <span>{skills.length} Registered</span>
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-5xl mx-auto w-full space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-neutral-100 mb-1">Native macOS Capabilities</h3>
          <p className="text-xs text-neutral-400">
            Skills are discrete execution modules that SOHAIL OS AI will use to control macOS features locally.
          </p>
        </div>

        {/* Filter Bar (Segmented Controls) */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-neutral-900/80 border border-neutral-800 rounded-xl w-fit">
          {[
            { id: 'all', label: 'All Capabilities' },
            { id: 'app_automation', label: 'App Automation' },
            { id: 'filesystem', label: 'Filesystem' },
            { id: 'terminal', label: 'Terminal' },
            { id: 'system_control', label: 'System Control' },
            { id: 'productivity', label: 'Productivity' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-neutral-800 text-neutral-100 shadow-xs'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Skills Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSkills.map((skill) => {
            const Icon = getCategoryIcon(skill.category);
            return (
              <div
                key={skill.id}
                className="p-5 rounded-xl bg-neutral-900/50 border border-neutral-800/80 hover:border-neutral-700/80 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-2.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-center shrink-0">
                        <Icon className="w-4 h-4 text-neutral-300" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold text-neutral-200">{skill.name}</h4>
                        <span className="text-[11px] text-neutral-400 capitalize">
                          {skill.category.replace('_', ' ')}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => toggleSkill(skill.id)}
                      className="text-neutral-400 hover:text-neutral-200 focus:outline-none"
                      title={skill.enabled ? 'Disable Skill' : 'Enable Skill'}
                    >
                      {skill.enabled ? (
                        <ToggleRight className="w-6 h-6 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-6 h-6 text-neutral-600" />
                      )}
                    </button>
                  </div>

                  <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                    {skill.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-neutral-800/60 flex items-center justify-between text-[11px] text-neutral-400">
                  <div className="flex items-center gap-1.5">
                    <span>Permissions:</span>
                    <span className="font-mono text-neutral-300">
                      {skill.requiredPermissions.length > 0
                        ? skill.requiredPermissions.join(', ')
                        : 'None'}
                    </span>
                  </div>
                  <span className="font-mono text-neutral-400">
                    {skill.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
