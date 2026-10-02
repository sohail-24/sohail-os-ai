import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, CornerDownLeft, Sparkles } from 'lucide-react';

interface MessageInputAreaProps {
  onSendMessage: (content: string) => void;
  disabled?: boolean;
  initialValue?: string;
}

export const MessageInputArea: React.FC<MessageInputAreaProps> = ({
  onSendMessage,
  disabled = false,
  initialValue = '',
}) => {
  const [text, setText] = useState(initialValue);
  const [showMicTooltip, setShowMicTooltip] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (initialValue) {
      setText(initialValue);
      if (textareaRef.current) {
        textareaRef.current.focus();
      }
    }
  }, [initialValue]);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 180)}px`;
    }
  }, [text]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!text.trim() || disabled) return;
    onSendMessage(text.trim());
    setText('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleMicClick = () => {
    setShowMicTooltip(true);
    setTimeout(() => {
      setShowMicTooltip(false);
    }, 3200);
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4 pt-2">
      <div className="relative rounded-2xl bg-neutral-900/80 border border-neutral-800/90 shadow-xl shadow-black/40 backdrop-blur-md transition-all focus-within:border-neutral-700 focus-within:ring-1 focus-within:ring-neutral-700/50">
        {/* Upper text input */}
        <textarea
          ref={textareaRef}
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask SOHAIL OS AI to automate macOS, manage files, or inspect system..."
          rows={1}
          disabled={disabled}
          className="w-full bg-transparent text-neutral-100 placeholder:text-neutral-500 text-sm px-4 pt-3.5 pb-2 resize-none focus:outline-none min-h-[48px] max-h-[180px] leading-relaxed"
        />

        {/* Action Bar Footer */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1 border-t border-neutral-800/40">
          <div className="flex items-center gap-2">
            {/* Microphone button UI placeholder only */}
            <div className="relative">
              <button
                type="button"
                onClick={handleMicClick}
                title="Microphone (Voice Input - Standby Placeholder)"
                className="p-2 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60 transition-colors focus:outline-none focus:ring-1 focus:ring-neutral-600"
                aria-label="Voice input placeholder"
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* Tooltip feedback for microphone placeholder */}
              {showMicTooltip && (
                <div className="absolute left-0 bottom-full mb-2 z-50 whitespace-nowrap px-3 py-1.5 rounded-lg bg-neutral-800 border border-neutral-700 text-[11px] text-neutral-200 shadow-xl flex items-center gap-1.5 animate-in fade-in zoom-in-95 duration-150">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  <span>Voice input placeholder (Local Whisper engine in future step)</span>
                </div>
              )}
            </div>

            <span className="text-[11px] text-neutral-400 hidden sm:inline select-none">
              Shift + Return for newline
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={!text.trim() || disabled}
              className={`p-2 rounded-lg flex items-center justify-center transition-all ${
                text.trim() && !disabled
                  ? 'bg-neutral-100 text-neutral-900 hover:bg-white shadow-sm'
                  : 'bg-neutral-800/60 text-neutral-500 cursor-not-allowed'
              }`}
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 mt-2 text-[11px] text-neutral-400 select-none">
        <span>SOHAIL OS AI v0.1-alpha</span>
        <span aria-hidden="true">·</span>
        <span>Local-first architecture</span>
        <span aria-hidden="true">·</span>
        <span>Ollama provider boundary configured</span>
      </div>
    </div>
  );
};
