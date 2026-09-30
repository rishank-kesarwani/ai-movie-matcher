import React from 'react';
import { QUICK_PROMPTS } from '../../lib/constants';
import { Sparkles } from 'lucide-react';

interface PromptChipsProps {
  onSelectPrompt: (prompt: string) => void;
  disabled?: boolean;
}

export function PromptChips({
  onSelectPrompt,
  disabled = false,
}: PromptChipsProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-semibold uppercase tracking-wider">
        <Sparkles className="w-3 h-3 text-cyan-400" />
        <span>Try Asking</span>
      </div>

      <div className="flex flex-wrap gap-2">
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSelectPrompt(prompt)}
            disabled={disabled}
            className="text-left text-xs py-2 px-3 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-all duration-200 disabled:opacity-50 shadow-sm"
          >
            "{prompt}"
          </button>
        ))}
      </div>
    </div>
  );
}
