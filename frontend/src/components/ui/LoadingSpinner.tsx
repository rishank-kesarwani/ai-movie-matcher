import React from 'react';
import { Sparkles } from 'lucide-react';

export function LoadingSpinner({
  message = 'Curating cinematic matches...',
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      <div className="relative w-16 h-16 flex items-center justify-center">
        {/* Outer Ring */}
        <div className="absolute inset-0 rounded-full border-2 border-cyan-500/20 border-t-cyan-400 animate-spin" />
        {/* Inner Glow */}
        <div className="w-8 h-8 rounded-full bg-cyan-500/10 flex items-center justify-center text-cyan-400 animate-pulse">
          <Sparkles className="w-4 h-4" />
        </div>
      </div>
      <p className="mt-4 text-xs font-medium text-slate-400 tracking-wide uppercase">
        {message}
      </p>
    </div>
  );
}
