'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { ScoredRecommendation } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { RecommendationCard } from '../../components/recommendations/RecommendationCard';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { Sparkles, RefreshCw, Sliders, History, Lock } from 'lucide-react';

export default function RecommendationsPage() {
  const { user, isAuthenticated, requireAuth } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'matches' | 'weights'>('matches');

  // Weights state for fine-tuning
  const [weights, setWeights] = useState({
    preferenceWeight: 0.35,
    semanticWeight: 0.30,
    ratingWeight: 0.20,
    popularityWeight: 0.15,
  });

  const {
    data: recData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<{ recommendations: ScoredRecommendation[]; generatedAt?: string }>({
    queryKey: ['recommendations', user?.id],
    queryFn: async () => {
      const res: any = await apiClient.get('/recommendations?limit=12');
      return res.data || res;
    },
    enabled: isAuthenticated,
  });

  // Re-generate recommendations mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const res: any = await apiClient.post('/recommendations/generate', {
        limit: 12,
        weights,
      });
      return res.data || res;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['recommendations', user?.id], data);
    },
  });

  const handleGenerateFresh = () => {
    requireAuth(() => {
      generateMutation.mutate();
    }, 'Log in to generate personalized AI recommendations.');
  };

  if (!isAuthenticated) {
    return (
      <div className="py-16 text-center max-w-xl mx-auto space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto shadow-xl">
          <Sparkles className="w-8 h-8 animate-pulse" />
        </div>

        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Personalized AI Recommendations
        </h1>

        <p className="text-sm text-slate-400 leading-relaxed">
          Log in to activate our personalized recommendation engine. We analyze your watchlist, ratings, favorite directors, and viewing history to curate spot-on film recommendations with transparent matching scores.
        </p>

        <button
          onClick={() => requireAuth(() => {}, 'Log in to view personalized movie matches.')}
          className="inline-flex items-center space-x-2 py-3 px-8 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-sm shadow-xl shadow-cyan-500/25 transition-all"
        >
          <Lock className="w-4 h-4" />
          <span>Log In to Unlock Recommendations</span>
        </button>
      </div>
    );
  }

  const recommendations = recData?.recommendations || [];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1.5">
            <Sparkles className="w-4 h-4 animate-pulse" />
            <span>AI Match Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Curated For You
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Hybrid scoring combining your taste profile, vector embeddings, and verified TMDB ratings.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab(activeTab === 'matches' ? 'weights' : 'matches')}
            className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-xl border text-xs font-semibold transition-colors ${
              activeTab === 'weights'
                ? 'bg-slate-800 text-cyan-400 border-cyan-500/40'
                : 'bg-slate-900 border-slate-800 text-slate-300 hover:bg-slate-800'
            }`}
          >
            <Sliders className="w-4 h-4" />
            <span>Tweak Scoring Weights</span>
          </button>

          <button
            onClick={handleGenerateFresh}
            disabled={generateMutation.isPending || isFetching}
            className="flex items-center space-x-2 py-2.5 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-md shadow-cyan-500/20 disabled:opacity-50 transition-all"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${
                generateMutation.isPending || isFetching ? 'animate-spin' : ''
              }`}
            />
            <span>Refresh AI Picks</span>
          </button>
        </div>
      </div>

      {/* Tweak Scoring Weights Panel (Collapsible) */}
      {activeTab === 'weights' && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-cyan-500/30 shadow-2xl space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Scoring Weight Adjuster
            </h3>
            <span className="text-xs text-cyan-400">
              Customizes how recommendations are prioritized
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Preferences ({Math.round(weights.preferenceWeight * 100)}%)</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.6"
                step="0.05"
                value={weights.preferenceWeight}
                onChange={(e) => setWeights({ ...weights, preferenceWeight: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Semantic Theme ({Math.round(weights.semanticWeight * 100)}%)</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.6"
                step="0.05"
                value={weights.semanticWeight}
                onChange={(e) => setWeights({ ...weights, semanticWeight: parseFloat(e.target.value) })}
                className="w-full accent-violet-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Critical Rating ({Math.round(weights.ratingWeight * 100)}%)</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="0.6"
                step="0.05"
                value={weights.ratingWeight}
                onChange={(e) => setWeights({ ...weights, ratingWeight: parseFloat(e.target.value) })}
                className="w-full accent-amber-400"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Popularity ({Math.round(weights.popularityWeight * 100)}%)</span>
              </div>
              <input
                type="range"
                min="0.05"
                max="0.4"
                step="0.05"
                value={weights.popularityWeight}
                onChange={(e) => setWeights({ ...weights, popularityWeight: parseFloat(e.target.value) })}
                className="w-full accent-blue-400"
              />
            </div>
          </div>
        </div>
      )}

      {/* Recommendations Cards Grid */}
      {isLoading ? (
        <LoadingSpinner message="Calculating multi-vector hybrid match scores..." />
      ) : error ? (
        <ErrorState
          title="Could Not Generate Recommendations"
          message={error.message}
          onRetry={() => refetch()}
        />
      ) : recommendations.length === 0 ? (
        <EmptyState
          title="No Recommendations Yet"
          description="Rate a few movies or configure your favorite genres to generate your personalized AI recommendations."
          actionLabel="Configure Taste Profile"
          actionHref="/profile"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recommendations.map((rec) => (
            <RecommendationCard key={rec.movieId} recommendation={rec} />
          ))}
        </div>
      )}
    </div>
  );
}
