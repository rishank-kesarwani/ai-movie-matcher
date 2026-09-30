import React from 'react';
import { Sparkles } from 'lucide-react';

interface MatchScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

export function MatchScoreBadge({ score, size = 'md' }: MatchScoreBadgeProps) {
  let colorStyles = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-cyan-950/40';
  if (score >= 90) {
    colorStyles = 'bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-300 border-emerald-400/40 shadow-emerald-950/40';
  } else if (score >= 80) {
    colorStyles = 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-cyan-950/40';
  } else {
    colorStyles = 'bg-violet-500/20 text-violet-300 border-violet-500/40 shadow-violet-950/40';
  }

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3.5 py-1.5 text-sm font-extrabold',
  }[size];

  return (
    <div
      className={`inline-flex items-center space-x-1.5 rounded-full border backdrop-blur-md font-bold shadow-md ${colorStyles} ${sizeStyles}`}
    >
      <Sparkles className="w-3.5 h-3.5" />
      <span>{score}% Match</span>
    </div>
  );
}
