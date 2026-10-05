'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';
import { Movie } from '../types';
import { MovieHeroCarousel } from '../components/movies/MovieHeroCarousel';
import { MovieGrid } from '../components/movies/MovieGrid';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { ErrorState } from '../components/ui/ErrorState';
import { Sparkles, TrendingUp, Star, Calendar, ArrowRight, Bot, Compass, Flame } from 'lucide-react';

export default function HomePage() {
  const {
    data: trendingData,
    isLoading: isTrendingLoading,
    error: trendingError,
    refetch: refetchTrending,
  } = useQuery<{ results: Movie[] }>({
    queryKey: ['movies', 'trending'],
    queryFn: async () => {
      const res: any = await apiClient.get('/movies/trending?timeWindow=week');
      return res.data || res;
    },
  });

  const {
    data: bollywoodData,
    isLoading: isBollywoodLoading,
  } = useQuery<{ results: Movie[] }>({
    queryKey: ['movies', 'bollywood'],
    queryFn: async () => {
      const res: any = await apiClient.get('/movies/bollywood');
      return res.data || res;
    },
  });

  const {
    data: popularData,
    isLoading: isPopularLoading,
  } = useQuery<{ results: Movie[] }>({
    queryKey: ['movies', 'popular'],
    queryFn: async () => {
      const res: any = await apiClient.get('/movies/popular');
      return res.data || res;
    },
  });

  const {
    data: topRatedData,
    isLoading: isTopRatedLoading,
  } = useQuery<{ results: Movie[] }>({
    queryKey: ['movies', 'top-rated'],
    queryFn: async () => {
      const res: any = await apiClient.get('/movies/top-rated');
      return res.data || res;
    },
  });

  const {
    data: upcomingData,
    isLoading: isUpcomingLoading,
  } = useQuery<{ results: Movie[] }>({
    queryKey: ['movies', 'upcoming'],
    queryFn: async () => {
      const res: any = await apiClient.get('/movies/upcoming');
      return res.data || res;
    },
  });

  if (isTrendingLoading) {
    return <LoadingSpinner message="Curating trending films and AI match candidates..." />;
  }

  if (trendingError) {
    return (
      <ErrorState
        title="Could Not Load Trending Movies"
        message={trendingError.message}
        onRetry={() => refetchTrending()}
      />
    );
  }

  const trendingMovies = trendingData?.results || [];
  const bollywoodMovies = bollywoodData?.results?.slice(0, 5) || [];
  const popularMovies = popularData?.results?.slice(0, 5) || [];
  const topRatedMovies = topRatedData?.results?.slice(0, 5) || [];
  const upcomingMovies = upcomingData?.results?.slice(0, 5) || [];

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Carousel */}
      <section>
        <MovieHeroCarousel movies={trendingMovies.slice(0, 5)} />
      </section>

      {/* AI Movie Matcher Banner / Call to Action */}
      <section className="relative rounded-3xl p-8 sm:p-12 overflow-hidden bg-gradient-to-r from-slate-900 via-cyan-950/40 to-slate-900 border border-cyan-500/30 shadow-2xl">
        <div className="absolute -top-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-bold mb-4">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>AI Hybrid Recommendation Engine</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight mb-3">
            Find Movies Matched Specifically to Your Taste
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 mb-8 leading-relaxed">
            Our multi-factor scoring model combines vector semantic similarity, explicit preferences, implicit viewing habits, and verified film attributes with explainable reasoning.
          </p>

          <div className="flex flex-wrap items-center gap-4">
            <Link
              href="/recommendations"
              className="flex items-center space-x-2 py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-cyan-500/25"
            >
              <Sparkles className="w-4 h-4" />
              <span>Personalized Recommendations</span>
            </Link>

            <Link
              href="/ai-assistant"
              className="flex items-center space-x-2 py-3 px-6 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-xs sm:text-sm transition-colors"
            >
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>Ask AI Assistant</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Trending in Bollywood & Indian Cinema Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-400 border border-orange-500/30">
              <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Trending in Bollywood & Indian Cinema
                </h2>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/30 text-orange-300 text-[10px] font-bold">
                  🇮🇳 Hindi & Regional
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/movies?language=hi"
            className="flex items-center space-x-1 text-xs font-semibold text-orange-400 hover:text-orange-300 transition-colors"
          >
            <span>Explore All Indian Cinema</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isBollywoodLoading ? (
          <LoadingSpinner message="Curating trending Bollywood & Indian cinema..." />
        ) : (
          <MovieGrid movies={bollywoodMovies} />
        )}
      </section>

      {/* Popular Movies Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400 border border-cyan-500/30">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Popular Right Now
            </h2>
          </div>

          <Link
            href="/movies?sortBy=popularity.desc"
            className="flex items-center space-x-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isPopularLoading ? (
          <LoadingSpinner message="Loading popular movies..." />
        ) : (
          <MovieGrid movies={popularMovies} />
        )}
      </section>

      {/* Top Rated Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 border border-amber-500/30">
              <Star className="w-4 h-4 fill-amber-400" />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Top Rated Masterpieces
            </h2>
          </div>

          <Link
            href="/movies?sortBy=vote_average.desc"
            className="flex items-center space-x-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isTopRatedLoading ? (
          <LoadingSpinner message="Loading top-rated masterpieces..." />
        ) : (
          <MovieGrid movies={topRatedMovies} />
        )}
      </section>

      {/* Upcoming Releases Section */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-violet-500/20 flex items-center justify-center text-violet-400 border border-violet-500/30">
              <Calendar className="w-4 h-4" />
            </div>
            <h2 className="text-xl font-extrabold text-white tracking-tight">
              Anticipated Upcoming Releases
            </h2>
          </div>

          <Link
            href="/movies?sortBy=primary_release_date.desc"
            className="flex items-center space-x-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>Explore All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {isUpcomingLoading ? (
          <LoadingSpinner message="Loading upcoming releases..." />
        ) : (
          <MovieGrid movies={upcomingMovies} />
        )}
      </section>
    </div>
  );
}
