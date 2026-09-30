'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { WatchedMovie } from '../../types';
import { getTmdbImageUrl } from '../../lib/constants';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { CheckCircle2, Star, Trash2, Calendar, Play } from 'lucide-react';

export default function WatchedPage() {
  const { user, isAuthenticated, requireAuth } = useAuth();
  const queryClient = useQueryClient();

  const {
    data: watchedData,
    isLoading,
    error,
    refetch,
  } = useQuery<{ items: WatchedMovie[]; total: number }>({
    queryKey: ['watched', user?.id],
    queryFn: async () => {
      const res: any = await apiClient.get('/watched');
      return res.data || res;
    },
    enabled: isAuthenticated,
  });

  const unmarkMutation = useMutation({
    mutationFn: async (movieId: number) => {
      await apiClient.delete(`/watched/${movieId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watched'] });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-emerald-400 mx-auto">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Viewing History Requires Login</h2>
        <p className="text-xs text-slate-400">
          Sign in to track films you've watched, personal ratings, and notes.
        </p>
        <button
          onClick={() => requireAuth(() => {}, 'Log in to view watched films.')}
          className="py-2.5 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs"
        >
          Log In
        </button>
      </div>
    );
  }

  const items = watchedData?.items || [];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6">
        <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider mb-1.5">
          <CheckCircle2 className="w-4 h-4" />
          <span>Viewing History</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Watched Movies & Ratings
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          {items.length} film{items.length === 1 ? '' : 's'} watched and logged to your taste profile.
        </p>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading watched film log..." />
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="No Watched Films Yet"
          description="Log movies you have watched to refine AI matching accuracy and train your personal taste memory."
          actionLabel="Explore Movies"
          actionHref="/movies"
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {items.map((item) => (
            <div
              key={item._id}
              className="group rounded-3xl overflow-hidden glass-card flex flex-col justify-between border border-slate-800 shadow-xl"
            >
              <div>
                <Link
                  href={`/movies/${item.movieId}`}
                  className="relative aspect-[16/10] w-full block overflow-hidden bg-slate-900"
                >
                  <Image
                    src={getTmdbImageUrl(item.backdropPath || item.posterPath, 'w780')}
                    alt={item.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {item.userRating && (
                    <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-slate-950/90 backdrop-blur-md border border-cyan-400/40 text-cyan-300 text-xs font-black flex items-center space-x-1 shadow-md">
                      <Star className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
                      <span>★ {item.userRating}/10</span>
                    </div>
                  )}
                </Link>

                <div className="p-4 space-y-2">
                  <Link href={`/movies/${item.movieId}`}>
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                  </Link>

                  {item.review && (
                    <p className="text-[11px] text-slate-300 italic line-clamp-2 bg-slate-950/60 p-2 rounded-lg border border-slate-800/80">
                      "{item.review}"
                    </p>
                  )}

                  <div className="flex items-center space-x-1 text-[10px] text-slate-500">
                    <Calendar className="w-3 h-3" />
                    <span>Watched on {new Date(item.watchedAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-800/40 mt-auto">
                <Link
                  href={`/movies/${item.movieId}`}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  <Play className="w-3 h-3 fill-cyan-400" />
                  <span>Film Details</span>
                </Link>

                <button
                  onClick={() => unmarkMutation.mutate(item.movieId)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Remove from watched history"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
