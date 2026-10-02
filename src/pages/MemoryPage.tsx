import React, { useState } from 'react';
import { Database, Search, Plus, Key, Calendar, Folder, ShieldCheck } from 'lucide-react';
import { MemoryItem } from '../types';
import { formatDate } from '../lib/utils';

export const MemoryPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [items, setItems] = useState<MemoryItem[]>([
    {
      id: 'mem_1',
      category: 'user_profile',
      key: 'preferred_editor',
      value: 'VS Code / Cursor with Vim bindings',
      createdAt: Date.now() - 86400000,
      updatedAt: Date.now() - 86400000,
    },
    {
      id: 'mem_2',
      category: 'preferences',
      key: 'ai_inference_mode',
      value: 'Strictly Local First (Ollama localhost:11434)',
      createdAt: Date.now() - 72000000,
      updatedAt: Date.now() - 72000000,
    },
    {
      id: 'mem_3',
      category: 'system_context',
      key: 'primary_development_target',
      value: 'macOS Apple Silicon (Darwin arm64)',
      createdAt: Date.now() - 50000000,
      updatedAt: Date.now() - 50000000,
    },
    {
      id: 'mem_4',
      category: 'project',
      key: 'active_repository',
      value: 'SOHAIL OS AI (Personal macOS Agent)',
      createdAt: Date.now() - 36000000,
      updatedAt: Date.now() - 36000000,
    },
  ]);

  const filteredItems = items.filter(
    (item) =>
      item.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.value.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0e1014]">
      {/* Header */}
      <div className="h-12 border-b border-neutral-800/80 px-6 flex items-center justify-between shrink-0 bg-neutral-900/30">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-neutral-400" />
          <h2 className="text-sm font-semibold text-neutral-200">Local Long-Term Memory</h2>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-400 font-mono">
          <span>Storage: 1.4 KB</span>
          <span aria-hidden="true">·</span>
          <span>Vector Index: Standby</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 md:p-8 max-w-5xl mx-auto w-full space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-neutral-100 mb-1">Personal Context & Knowledge Store</h3>
          <p className="text-xs text-neutral-400">
            SOHAIL OS AI retains local facts, project preferences, and persistent configurations in an isolated on-device store.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search memory entries, preferences, system contexts..."
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:border-neutral-700"
          />
        </div>

        {/* Memory Grid */}
        <div className="space-y-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800/80 hover:border-neutral-700/80 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-neutral-200 font-medium">{item.key}</span>
                  <span className="text-neutral-600" aria-hidden="true">/</span>
                  <span className="text-neutral-500 text-[11px] capitalize">
                    {item.category.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-neutral-400">{item.value}</p>
              </div>

              <div className="flex items-center gap-3 text-[11px] text-neutral-500 shrink-0 font-mono">
                <span>Updated {formatDate(item.updatedAt)}</span>
              </div>
            </div>
          ))}

          {filteredItems.length === 0 && (
            <div className="text-center py-12 text-xs text-neutral-500">
              No memory entries match your search query.
            </div>
          )}
        </div>

        {/* Architecture Note */}
        <div className="p-4 rounded-xl bg-neutral-900/40 border border-neutral-800/80 flex items-start gap-3">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-neutral-400 space-y-1">
            <span className="font-medium text-neutral-300 block">Local-First Storage Guarantee</span>
            <p>
              All memory structures are designed to be persisted in a local embedded SQLite database on your Mac.
              No vector embeddings or profile data are transmitted to third-party cloud services.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
