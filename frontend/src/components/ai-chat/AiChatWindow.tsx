'use client';

import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage } from '../../types';
import { ChatMessageItem } from './ChatMessageItem';
import { PromptChips } from './PromptChips';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../lib/api-client';
import { Send, Bot, Sparkles, Trash2, Cpu } from 'lucide-react';

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    role: 'assistant',
    content:
      'Hello! I am CineMatch AI, your cinematic recommendation intelligence. Ask me for recommendations matching any mood, theme, runtime, or combinations (e.g. "Something like Interstellar but less serious and under 2 hours"). What are you in the mood to watch?',
  },
];

export function AiChatWindow() {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { requireAuth } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    requireAuth(async () => {
      const newUserMessage: ChatMessage = {
        role: 'user',
        content: query,
        timestamp: new Date().toISOString(),
      };

      const updatedHistory = [...messages, newUserMessage];
      setMessages(updatedHistory);
      setInputValue('');
      setIsLoading(true);

      try {
        const response: any = await apiClient.post('/ai/chat', {
          messages: updatedHistory.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        });

        const assistantReply: ChatMessage = {
          role: 'assistant',
          content: response.reply,
          suggestedMovies: response.suggestedMovies,
          enrichedMovies: response.enrichedMovies,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantReply]);
      } catch (err: any) {
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content:
            err.message ||
            'I encountered an issue connecting to the AI Platform. Please try asking again in a moment.',
        };
        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }, 'Log in to have conversations with the CineMatch AI Assistant.');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleClearChat = () => {
    setMessages(INITIAL_MESSAGES);
  };

  return (
    <div className="flex flex-col h-[700px] w-full rounded-3xl bg-slate-950/80 border border-slate-800/80 overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* Chat Window Header */}
      <div className="px-6 py-4 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/20">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-sm font-extrabold text-white">CineMatch AI Assistant</h3>
              <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-[10px] font-bold">
                Online
              </span>
            </div>
            <div className="flex items-center space-x-1 text-[11px] text-slate-400 font-medium">
              <Cpu className="w-3 h-3 text-violet-400" />
              <span>Connected to Shared AI Platform</span>
            </div>
          </div>
        </div>

        <button
          onClick={handleClearChat}
          className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
          title="Reset conversation"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
        {messages.map((message, idx) => (
          <ChatMessageItem key={idx} message={message} />
        ))}

        {isLoading && (
          <div className="flex items-center space-x-3 text-xs text-cyan-400 font-medium animate-pulse py-2">
            <div className="w-8 h-8 rounded-xl bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-cyan-400">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <span>CineMatch AI is analyzing narrative themes & matching movies...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Prompt Suggestion Chips (when history is small) */}
      {messages.length <= 3 && (
        <div className="px-4 sm:px-6 pb-3">
          <PromptChips
            onSelectPrompt={(p) => handleSendMessage(p)}
            disabled={isLoading}
          />
        </div>
      )}

      {/* Chat Input Bar */}
      <div className="p-4 border-t border-slate-800 bg-slate-900/80">
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            placeholder="E.g. I want something like Interstellar but less serious and under 2 hours..."
            className="flex-1 py-3 px-4 rounded-2xl bg-slate-950 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputValue.trim() || isLoading}
            className="p-3 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg shadow-cyan-500/20"
            aria-label="Send message"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
