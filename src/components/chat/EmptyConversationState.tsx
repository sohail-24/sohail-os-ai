import React from 'react';
import { Terminal, HardDrive, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { QUICK_PROMPTS } from '../../lib/constants';

interface EmptyConversationStateProps {
  onSelectPrompt: (promptText: string) => void;
}

export const EmptyConversationState: React.FC<EmptyConversationStateProps> = ({ onSelectPrompt }) => {
  return (
    <div className="max-w-3xl mx-auto py-12 px-6 flex flex-col items-center text-center">
      {/* OS Emblem / Futuristic Brand Symbol */}
      <div className="w-14 h-14 rounded-2xl bg-neutral-900 border border-neutral-800 flex items-center justify-center shadow-lg shadow-black/40 mb-6">
        <div className="w-8 h-8 rounded-lg bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-center">
          <span className="font-mono text-xs font-semibold text-neutral-200 tracking-wider">S•OS</span>
        </div>
      </div>

      <h1 className="text-3xl font-semibold tracking-tight text-neutral-100 mb-2.5">
        SOHAIL OS AI
      </h1>

      <div className="flex items-center gap-2 text-xs text-neutral-400 mb-6">
        <span>macOS Local-First</span>
        <span aria-hidden="true">·</span>
        <span>Local Model Ready</span>
        <span aria-hidden="true">·</span>
        <span>Zero Cloud Dependency</span>
      </div>

      <p className="text-sm text-neutral-400 max-w-xl leading-relaxed mb-10 text-balance">
        A personal desktop AI operating system designed to automate macOS tasks,
        manage local files, and interact with native applications through local inference.
      </p>

      {/* Core Architectural Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full mb-10 text-left">
        <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800/80 hover:border-neutral-700/80 transition-colors">
          <div className="flex items-center gap-2 text-neutral-300 text-xs font-medium mb-1.5">
            <HardDrive className="w-4 h-4 text-neutral-400" />
            <span>Local Inference Architecture</span>
          </div>
          <p className="text-xs text-neutral-400 leading-normal">
            Runs entirely on local hardware via Ollama or custom local models. No third-party AI keys or cloud data leaks.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800/80 hover:border-neutral-700/80 transition-colors">
          <div className="flex items-center gap-2 text-neutral-300 text-xs font-medium mb-1.5">
            <Terminal className="w-4 h-4 text-neutral-400" />
            <span>macOS System Bridge</span>
          </div>
          <p className="text-xs text-neutral-400 leading-normal">
            Modular hooks for Accessibility, Finder file automation, application control, and local terminal execution.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-neutral-900/50 border border-neutral-800/80 hover:border-neutral-700/80 transition-colors">
          <div className="flex items-center gap-2 text-neutral-300 text-xs font-medium mb-1.5">
            <ShieldCheck className="w-4 h-4 text-neutral-400" />
            <span>Isolated Security Boundary</span>
          </div>
          <p className="text-xs text-neutral-400 leading-normal">
            Every file manipulation and terminal operation is gated behind explicit user confirmation and local sandboxes.
          </p>
        </div>
      </div>

      {/* Suggested Command Prompts */}
      <div className="w-full text-left">
        <div className="flex items-center justify-between mb-3 px-1">
          <span className="text-xs font-medium text-neutral-400 uppercase tracking-wider">
            Suggested Automation Intent
          </span>
          <span className="text-xs text-neutral-400">
            Click to populate workspace
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {QUICK_PROMPTS.map((item, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectPrompt(item.prompt)}
              className="p-3.5 rounded-lg bg-neutral-900/40 hover:bg-neutral-800/50 border border-neutral-800/60 hover:border-neutral-700 text-left transition-all group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-neutral-200 group-hover:text-white">
                    {item.title}
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-neutral-400 group-hover:text-neutral-300 group-hover:translate-x-0.5 transition-all" />
                </div>
                <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                  {item.prompt}
                </p>
              </div>
              <div className="mt-2 pt-2 border-t border-neutral-800/40 flex items-center gap-1.5 text-[11px] text-neutral-400">
                <Sparkles className="w-3 h-3 text-neutral-400" />
                <span>{item.category}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
