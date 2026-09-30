'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLoginRequired } from '../../context/LoginRequiredModalContext';
import { Sparkles, Lock, X } from 'lucide-react';

export function LoginRequiredModal() {
  const { isOpen, message, closeModal } = useLoginRequired();
  const pathname = usePathname();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md p-6 bg-slate-900/95 border border-cyan-500/30 rounded-2xl shadow-2xl shadow-cyan-950/50 text-slate-100 overflow-hidden">
        {/* Decorative Top Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-[2px]" />

        {/* Close Button */}
        <button
          onClick={closeModal}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Content */}
        <div className="flex flex-col items-center text-center mt-2">
          <div className="w-14 h-14 mb-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
            <Lock className="w-7 h-7" />
          </div>

          <h3 className="text-xl font-bold tracking-tight text-white mb-2 flex items-center gap-2">
            Login Required
            <Sparkles className="w-4 h-4 text-cyan-400" />
          </h3>

          <p className="text-sm text-slate-300 mb-6 leading-relaxed">
            {message}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col w-full gap-3">
            <Link
              href={`/login?redirect=${encodeURIComponent(pathname)}`}
              onClick={closeModal}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold text-sm transition-all duration-200 shadow-lg shadow-cyan-500/20 text-center"
            >
              Login to Account
            </Link>

            <Link
              href={`/register?redirect=${encodeURIComponent(pathname)}`}
              onClick={closeModal}
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-medium text-sm transition-colors text-center"
            >
              Create Free Account
            </Link>

            <button
              onClick={closeModal}
              className="w-full py-2.5 px-4 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
