import React, { useState } from 'react';
import { CheckSquare, Clock, Plus, Play, CheckCircle2, AlertCircle } from 'lucide-react';
import { OrchestratedTask } from '../types';
import { formatTimestamp } from '../lib/utils';

export const TasksPage: React.FC = () => {
  const [tasks, setTasks] = useState<OrchestratedTask[]>([
    {
      id: 'task_001',
      title: 'Organize ~/Downloads folder by month and extension',
      prompt: 'Clean up my Downloads directory, archive screenshots, and sort PDFs into Documents/Archive',
      status: 'queued',
      createdAt: Date.now() - 3600000,
      autoExecute: false,
      steps: [
        { id: 's1', description: 'Scan ~/Downloads directory structure', status: 'queued', skillId: 'filesystem' },
        { id: 's2', description: 'Group files by created month and file type', status: 'queued', skillId: 'filesystem' },
        { id: 's3', description: 'Move and organize with confirmation prompt', status: 'queued', skillId: 'mac_control' },
      ],
    },
    {
      id: 'task_002',
      title: 'Generate daily workspace brief from local calendar & reminders',
      prompt: 'Check upcoming events for today and format a prioritized markdown checklist',
      status: 'queued',
      createdAt: Date.now() - 7200000,
      autoExecute: false,
      steps: [
        { id: 's4', description: 'Query macOS EventKit for today’s schedule', status: 'queued', skillId: 'mac_control' },
        { id: 's5', description: 'Summarize tasks into priority checklist', status: 'queued', skillId: 'local_ai' },
      ],
    },
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: OrchestratedTask = {
      id: `task_${Date.now()}`,
      title: newTaskTitle.trim(),
      prompt: newTaskTitle.trim(),
      status: 'queued',
      createdAt: Date.now(),
      autoExecute: false,
      steps: [
        { id: `step_1`, description: 'Parse intent and generate execution plan', status: 'queued' },
        { id: `step_2`, description: 'Execute scheduled sub-actions via macOS bridge', status: 'queued' },
      ],
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle('');
    setShowNewTaskModal(false);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0e1014]">
      {/* Header */}
      <div className="h-12 border-b border-neutral-800/80 px-6 flex items-center justify-between shrink-0 bg-neutral-900/30">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-4 h-4 text-neutral-400" />
          <h2 className="text-sm font-semibold text-neutral-200">Autonomous Tasks & Workflows</h2>
        </div>
        <button
          type="button"
          onClick={() => setShowNewTaskModal(true)}
          className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-white text-neutral-900 text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-5xl mx-auto w-full space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-neutral-100 mb-1">Multi-Step Task Pipeline</h3>
          <p className="text-xs text-neutral-400">
            Tasks allow SOHAIL OS AI to plan and orchestrate compound macOS workflows across native applications.
          </p>
        </div>

        {/* Task Cards */}
        <div className="space-y-4">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="p-5 rounded-xl bg-neutral-900/50 border border-neutral-800/80 hover:border-neutral-700/80 transition-colors"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h4 className="text-sm font-semibold text-neutral-200 mb-1">{task.title}</h4>
                  <p className="text-xs text-neutral-400 leading-relaxed">{task.prompt}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <span className="text-[11px] font-mono text-neutral-400 tabular-nums">
                    {formatTimestamp(task.createdAt)}
                  </span>
                  <span className="text-xs px-2.5 py-1 rounded-md bg-neutral-800 text-neutral-300 border border-neutral-700/60 font-medium">
                    Queued
                  </span>
                </div>
              </div>

              {/* Execution Steps */}
              <div className="mt-4 pt-3 border-t border-neutral-800/60 space-y-2">
                <span className="text-[11px] font-medium uppercase tracking-wider text-neutral-400 block">
                  Planned Execution Graph
                </span>
                <div className="space-y-1.5">
                  {task.steps.map((step, idx) => (
                    <div
                      key={step.id}
                      className="flex items-center justify-between p-2 rounded-lg bg-neutral-950/60 border border-neutral-800/50 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-neutral-400 text-[11px]">
                          0{idx + 1}.
                        </span>
                        <span className="text-neutral-300">{step.description}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-neutral-400 text-[11px] font-mono">
                        <Clock className="w-3 h-3" />
                        <span>Pending</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-neutral-800/60 flex items-center justify-between text-xs text-neutral-400">
                <span>Requires local macOS execution bridge</span>
                <button
                  type="button"
                  disabled
                  className="px-2.5 py-1 rounded-md bg-neutral-800 text-neutral-400 cursor-not-allowed flex items-center gap-1.5 text-[11px]"
                >
                  <Play className="w-3 h-3" />
                  <span>Execute Workflow (Standby)</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Task Creation Modal */}
      {showNewTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6 max-w-lg w-full shadow-2xl">
            <h3 className="text-sm font-semibold text-neutral-100 mb-1">Create Local Workflow Task</h3>
            <p className="text-xs text-neutral-400 mb-4">
              Describe what task you want SOHAIL OS AI to plan for your Mac.
            </p>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <textarea
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                placeholder="e.g., Compress and backup current project repository to ~/Backups"
                rows={3}
                className="w-full px-3 py-2.5 rounded-lg bg-neutral-950 border border-neutral-800 text-xs text-neutral-100 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-700 resize-none leading-relaxed"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewTaskModal(false)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTaskTitle.trim()}
                  className="px-4 py-1.5 rounded-lg text-xs font-medium bg-neutral-100 text-neutral-900 hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
