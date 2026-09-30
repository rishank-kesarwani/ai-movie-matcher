import React from 'react';
import { ScoredRecommendation } from '../../types';
import { MatchScoreBadge } from './MatchScoreBadge';
import { X, Sparkles, CheckCircle, Brain, Sliders, Star, TrendingUp } from 'lucide-react';

interface WhyThisMovieModalProps {
  recommendation: ScoredRecommendation | null;
  isOpen: boolean;
  onClose: () => void;
}

export function WhyThisMovieModal({
  recommendation,
  isOpen,
  onClose,
}: WhyThisMovieModalProps) {
  if (!isOpen || !recommendation) return null;

  const factors = [
    {
      name: 'Preference Alignment',
      score: Math.round((recommendation.preferenceScore || 0.85) * 100),
      icon: Sliders,
      desc: 'Matches your favorite genres, directors, and past viewing behavior.',
    },
    {
      name: 'Semantic Theme Match',
      score: Math.round((recommendation.semanticScore || 0.88) * 100),
      icon: Brain,
      desc: 'High conceptual similarity with your historical favorite storylines.',
    },
    {
      name: 'Critical & Audience Rating',
      score: Math.round((recommendation.ratingScore || 0.84) * 100),
      icon: Star,
      desc: `High TMDB community rating (${recommendation.voteAverage}/10).`,
    },
    {
      name: 'Popularity & Relevance',
      score: Math.round((recommendation.popularityScore || 0.75) * 100),
      icon: TrendingUp,
      desc: 'Trending momentum among cinema enthusiasts worldwide.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-lg p-6 sm:p-8 bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl text-slate-100 overflow-hidden">
        {/* Top Glow Bar */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-1.5 bg-gradient-to-r from-cyan-400 via-violet-500 to-amber-400 blur-[1px]" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xs font-semibold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              AI Match Explainability
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            Why "{recommendation.title}"?
          </h3>
          <div className="mt-2">
            <MatchScoreBadge score={recommendation.matchScore} size="md" />
          </div>
        </div>

        {/* AI Explanation Summary */}
        <div className="p-4 rounded-2xl bg-cyan-950/30 border border-cyan-500/30 mb-6">
          <p className="text-xs sm:text-sm text-cyan-100 leading-relaxed font-medium">
            "{recommendation.explanation}"
          </p>
        </div>

        {/* Specific Bullet Reasons */}
        {recommendation.reasons && recommendation.reasons.length > 0 && (
          <div className="mb-6 space-y-2">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
              Key Match Signals
            </h4>
            <div className="space-y-1.5">
              {recommendation.reasons.map((reason, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-xs text-slate-300">
                  <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Multi-factor Score Breakdown */}
        <div className="space-y-3 pt-2 border-t border-slate-800">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
            Hybrid Scoring Breakdown
          </h4>
          <div className="space-y-2.5">
            {factors.map((factor) => {
              const Icon = factor.icon;
              return (
                <div key={factor.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-1.5 text-slate-300 font-medium">
                      <Icon className="w-3.5 h-3.5 text-cyan-400" />
                      <span>{factor.name}</span>
                    </div>
                    <span className="font-bold text-slate-200">{factor.score}%</span>
                  </div>
                  {/* Progress Bar */}
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-violet-500 rounded-full transition-all duration-500"
                      style={{ width: `${factor.score}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Close */}
        <button
          onClick={onClose}
          className="w-full mt-6 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
