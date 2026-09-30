import React from 'react';
import Link from 'next/link';
import { Film, Sparkles, Cpu, Bell, ShieldCheck, Github, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/90 text-slate-400 text-sm mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Mission */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400">
                <Film className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold text-white tracking-tight">CineMatch AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Production-grade AI movie discovery & recommendation system. Powered by hybrid scoring algorithms, vector embeddings, and real-time preference learning.
            </p>
            <div className="flex items-center space-x-2 text-xs text-emerald-400 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span>All Portfolio Microservices Operational</span>
            </div>
          </div>

          {/* AI Platform Architecture */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Shared AI Platform
            </h3>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center space-x-2 text-slate-400">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                <a
                  href="https://github.com/rishank-kesarwani/ai-platform"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-cyan-400 transition-colors flex items-center gap-1"
                >
                  <span>ai-platform</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li className="flex items-center space-x-2 text-slate-400">
                <Sparkles className="w-3.5 h-3.5 text-violet-400" />
                <span>Multi-factor Hybrid Recommender</span>
              </li>
              <li className="flex items-center space-x-2 text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                <span>Non-Hallucinatory Explanations</span>
              </li>
            </ul>
          </div>

          {/* Notification Engine */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Notification Engine
            </h3>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center space-x-2 text-slate-400">
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <a
                  href="https://github.com/rishank-kesarwani/notification-service"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-amber-400 transition-colors flex items-center gap-1"
                >
                  <span>notification-service</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </li>
              <li className="flex items-center space-x-2 text-slate-400">
                <span>Dual-Channel Email & Push Delivery</span>
              </li>
              <li className="flex items-center space-x-2 text-slate-400">
                <span>Idempotent Asynchronous BullMQ</span>
              </li>
            </ul>
          </div>

          {/* TMDB Attribution (Mandatory) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              TMDB Attribution
            </h3>
            <div className="p-3 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-cyan-400">TMDB API</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Data Source</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-snug">
                This product uses the TMDB API but is not endorsed or certified by TMDB.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} AI Movie Matcher. Engineered by Rishank Kesarwani.</p>
          <div className="flex items-center space-x-4">
            <a
              href="https://github.com/rishank-kesarwani/ai-movie-matcher"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 flex items-center gap-1 transition-colors"
            >
              <Github className="w-4 h-4" />
              <span>ai-movie-matcher</span>
            </a>
            <a
              href="https://github.com/rishank-kesarwani/ai-travel-planner"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-cyan-400 flex items-center gap-1 transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>ai-travel-planner</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
