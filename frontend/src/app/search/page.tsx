'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { Movie } from '../../types';
import { MovieGrid } from '../../components/movies/MovieGrid';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { Search, Sparkles, Brain, ArrowRight } from 'lucide-react';

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [isSemanticMode, setIsSemanticMode] = useState(true);

  // Standard Keyword Search Query
  const {
    data: keywordResults,
    isLoading: isKeywordLoading,
    error: keywordError,
  } = useQuery<{ results: Movie[] }>({
    queryKey: ['movies', 'search', 'keyword', submittedQuery],
    queryFn: async () => {
      const res: any = await apiClient.get(`/movies/search?q=${encodeURIComponent(submittedQuery)}`);
      return res.data || res;
    },
    enabled: Boolean(submittedQuery && !isSemanticMode),
  });

  // Semantic Natural Language Search Query
  const {
    data: semanticResults,
    isLoading: isSemanticLoading,
    error: semanticError,
  } = useQuery<{ results: Array<Movie & { semanticScore?: number; semanticExplanation?: string }> }>({
    queryKey: ['movies', 'search', 'semantic', submittedQuery],
    queryFn: async () => {
      const res: any = await apiClient.post('/ai/semantic-search', {
        query: submittedQuery,
      });
      return res.data || res;
    },
    enabled: Boolean(submittedQuery && isSemanticMode),
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      setSubmittedQuery(searchTerm.trim());
    }
  };

  const isLoading = isSemanticMode ? isSemanticLoading : isKeywordLoading;
  const error = isSemanticMode ? semanticError : keywordError;
  const movies = (isSemanticMode ? semanticResults?.results : keywordResults?.results) || [];

  return (
    <div className="space-y-8 pb-12 max-w-6xl mx-auto">
      {/* Search Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Semantic & Hybrid Search</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Find Any Film by Meaning or Title
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Describe the mood, atmosphere, plot concept, or type a direct title.
        </p>
      </div>

      {/* Search Bar & Mode Selector */}
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Toggle Mode */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setIsSemanticMode(true)}
            className={`flex items-center space-x-2 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              isSemanticMode
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>AI Semantic / Mood Search</span>
          </button>

          <button
            onClick={() => setIsSemanticMode(false)}
            className={`flex items-center space-x-2 py-2 px-4 rounded-xl text-xs font-bold transition-all ${
              !isSemanticMode
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25'
                : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Search className="w-4 h-4" />
            <span>Standard Title Search</span>
          </button>
        </div>

        {/* Input Form */}
        <form onSubmit={handleSearch} className="relative flex items-center">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder={
              isSemanticMode
                ? 'E.g. A feel-good movie about friendship and road trips, or mind-bending noir...'
                : 'E.g. Inception, Dune, Interstellar...'
            }
            className="w-full py-4 pl-12 pr-28 rounded-2xl bg-slate-900/90 border border-slate-800 focus:border-cyan-500 text-sm text-white placeholder-slate-500 shadow-2xl outline-none transition-all"
          />

          <div className="absolute left-4 text-slate-400">
            {isSemanticMode ? <Brain className="w-5 h-5 text-cyan-400" /> : <Search className="w-5 h-5" />}
          </div>

          <button
            type="submit"
            className="absolute right-2.5 py-2 px-5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20 transition-all"
          >
            Search
          </button>
        </form>

        {/* Sample Prompt Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
          <span className="text-slate-500 text-[11px] font-semibold uppercase">Try:</span>
          {[
            'Inspirational Bollywood like 3 Idiots or Swades',
            'Epic South Indian action spectacle like RRR',
            'Gripping Korean thriller like Parasite',
            'Mind-bending sci-fi with philosophical themes',
            'Emotional anime like Spirited Away',
            'Feel-good road trip friendship comedy',
          ].map((sample) => (
            <button
              key={sample}
              onClick={() => {
                setSearchTerm(sample);
                setSubmittedQuery(sample);
                setIsSemanticMode(true);
              }}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-cyan-400 hover:border-cyan-500/30 transition-colors"
            >
              "{sample}"
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div className="pt-6">
        {isLoading ? (
          <LoadingSpinner message="Searching catalog and evaluating semantic similarity..." />
        ) : error ? (
          <ErrorState message={error.message} />
        ) : submittedQuery && movies.length === 0 ? (
          <EmptyState
            title="No Results Found"
            description={`We couldn't find any matches for "${submittedQuery}". Try refining your prompt or searching by movie title.`}
          />
        ) : submittedQuery ? (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider">
                Results for "{submittedQuery}"
              </h2>
              <span className="text-xs text-cyan-400 font-semibold">
                {movies.length} matches found
              </span>
            </div>
            <MovieGrid movies={movies} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
