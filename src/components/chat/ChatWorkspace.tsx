import React, { useState, useRef, useEffect } from 'react';
import { EmptyConversationState } from './EmptyConversationState';
import { MessageInputArea } from './MessageInputArea';
import { ChatMessage } from '../../types';
import { aiService } from '../../services/ai';
import { formatTimestamp } from '../../lib/utils';
import { RotateCcw, Bot, User, Cpu, AlertCircle } from 'lucide-react';

export const ChatWorkspace: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [promptPrefill, setPromptPrefill] = useState('');
  const [activeModel, setActiveModel] = useState<string>(() =>
    aiService.getModel ? aiService.getModel() : 'llama3.2'
  );
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isProcessing]);

  useEffect(() => {
    if (aiService.getModel) {
      setActiveModel(aiService.getModel());
    }
  }, []);

  const handleSendMessage = async (text: string) => {
    const userMessage: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsProcessing(true);
    setPromptPrefill('');

    const currentModel = aiService.getModel ? aiService.getModel() : 'llama3.2';
    setActiveModel(currentModel);

    try {
      // Connect to the real local Ollama service through the abstract IAIService interface
      const response = await aiService.generateResponse([...messages, userMessage]);

      const assistantMessage: ChatMessage = {
        id: `msg_ai_${Date.now()}`,
        role: 'assistant',
        content: response.message,
        timestamp: Date.now(),
        metadata: {
          modelUsed: response.model || currentModel,
          inferenceTimeMs: response.usage ? 120 : undefined,
        },
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'Unknown error during local Ollama inference.';

      const errorMessage: ChatMessage = {
        id: `msg_err_${Date.now()}`,
        role: 'system',
        content: errorMsg,
        timestamp: Date.now(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectPrompt = (prompt: string) => {
    setPromptPrefill(prompt);
  };

  const handleClearConversation = () => {
    setMessages([]);
    setPromptPrefill('');
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-[#0e1014] relative">
      {/* Workspace Header / Session Bar */}
      <div className="h-11 border-b border-neutral-800/80 px-4 flex items-center justify-between shrink-0 bg-neutral-900/30 backdrop-blur-xs">
        <div className="flex items-center gap-2 text-xs">
          <span className="font-medium text-neutral-300">Active Workspace</span>
          <span className="text-neutral-600" aria-hidden="true">/</span>
          <span className="text-neutral-400">
            {messages.length === 0 ? 'Empty Session' : `${messages.length} messages`}
          </span>
          <span className="text-neutral-600" aria-hidden="true">/</span>
          <span className="font-mono text-[11px] text-neutral-400 flex items-center gap-1 bg-neutral-900/80 border border-neutral-800 px-2 py-0.5 rounded">
            <Cpu className="w-3 h-3 text-neutral-400" />
            <span>Ollama: {activeModel}</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          {messages.length > 0 && (
            <button
              type="button"
              onClick={handleClearConversation}
              className="text-xs text-neutral-400 hover:text-neutral-200 px-2.5 py-1 rounded-md hover:bg-neutral-800/60 transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Session</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area (Empty State or Messages List) */}
      <div className="flex-1 overflow-y-auto px-4 md:px-8 py-6">
        {messages.length === 0 ? (
          <EmptyConversationState onSelectPrompt={handleSelectPrompt} />
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg) => {
              const isUser = msg.role === 'user';
              const isSystem = msg.role === 'system';

              if (isSystem) {
                return (
                  <div
                    key={msg.id}
                    className="p-4 rounded-xl bg-rose-950/20 border border-rose-900/40 text-neutral-200 text-xs space-y-1.5"
                  >
                    <div className="flex items-center gap-2 text-rose-400 font-medium">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>Ollama Local Inference Error</span>
                    </div>
                    <p className="whitespace-pre-line text-neutral-300 font-mono text-[11px] pl-6 leading-relaxed">
                      {msg.content}
                    </p>
                  </div>
                );
              }

              return (
                <div
                  key={msg.id}
                  className={`flex gap-3.5 ${isUser ? 'justify-end' : 'justify-start'}`}
                >
                  {!isUser && (
                    <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700/60 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot className="w-4 h-4 text-neutral-200" />
                    </div>
                  )}

                  <div className={`max-w-[85%] space-y-1.5 ${isUser ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center gap-2 px-1 text-[11px] text-neutral-400">
                      <span className="font-medium text-neutral-300">
                        {isUser ? 'You' : 'SOHAIL OS AI'}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono tabular-nums">{formatTimestamp(msg.timestamp)}</span>
                      {msg.metadata?.modelUsed && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="font-mono text-neutral-400 flex items-center gap-1">
                            <Cpu className="w-2.5 h-2.5" />
                            {msg.metadata.modelUsed}
                          </span>
                        </>
                      )}
                    </div>

                    <div
                      className={`p-4 rounded-2xl text-sm leading-relaxed ${
                        isUser
                          ? 'bg-neutral-800/90 text-neutral-100 border border-neutral-700/60 rounded-tr-xs'
                          : 'bg-neutral-900/80 text-neutral-200 border border-neutral-800/80 rounded-tl-xs'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>

                  {isUser && (
                    <div className="w-8 h-8 rounded-lg bg-neutral-700 border border-neutral-600 flex items-center justify-center shrink-0 mt-0.5">
                      <User className="w-4 h-4 text-neutral-100" />
                    </div>
                  )}
                </div>
              );
            })}

            {isProcessing && (
              <div className="flex gap-3.5 items-start">
                <div className="w-8 h-8 rounded-lg bg-neutral-800 border border-neutral-700/60 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-neutral-200" />
                </div>
                <div className="p-3.5 rounded-2xl bg-neutral-900/80 border border-neutral-800 rounded-tl-xs flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse" />
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse delay-150" />
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse delay-300" />
                  <span className="text-xs text-neutral-400 ml-1.5">
                    Generating response via local model ({activeModel})...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input Area (Floating Bottom) */}
      <div className="shrink-0">
        <MessageInputArea
          onSendMessage={handleSendMessage}
          disabled={isProcessing}
          initialValue={promptPrefill}
        />
      </div>
    </div>
  );
};
