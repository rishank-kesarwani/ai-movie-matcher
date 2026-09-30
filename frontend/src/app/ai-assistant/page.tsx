'use client';

import React from 'react';
import { AiChatWindow } from '../../components/ai-chat/AiChatWindow';
import { Bot, Sparkles, Cpu, ShieldCheck } from 'lucide-react';

export default function AiAssistantPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Page Intro */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/40 text-violet-300 text-xs font-bold">
          <Bot className="w-3.5 h-3.5" />
          <span>Conversational Intelligence</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          CineMatch AI Assistant
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Have an intelligent dialogue to uncover films by mood, narrative twists, director styles, and specific runtime parameters.
        </p>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs text-slate-300">
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center space-x-3">
          <Sparkles className="w-4 h-4 text-cyan-400 shrink-0" />
          <span>Natural language preference extraction</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center space-x-3">
          <Cpu className="w-4 h-4 text-violet-400 shrink-0" />
          <span>Multi-turn conversational context memory</span>
        </div>
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center space-x-3">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Verified film facts with zero hallucinations</span>
        </div>
      </div>

      {/* Main Chat Interface */}
      <AiChatWindow />
    </div>
  );
}
