'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { WatchlistItem } from '../../types';
import { getTmdbImageUrl } from '../../lib/constants';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { Bookmark, Trash2, CheckCircle, Star, Play, Lock } from 'lucide-react';

export default function WatchlistPage() {
  const { user, isAuthenticated, requireAuth } = useAuth();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>('');

  const {
    data: watchlistData,
    isLoading,
    error,
    refetch,
  } = useQuery<{ items: WatchlistItem[]; total: number }>({
    queryKey: ['watchlist', user?.id, selectedStatus],
    queryFn: async () => {
      const url = selectedStatus
        ? `/watchlist?status=${selectedStatus}`
        : '/watchlist';
      const res: any = await apiClient.get(url);
      return res.data || res;
    },
    enabled: isAuthenticated,
  });

  const removeMutation = useMutation({
    mutationFn: async (movieId: number) => {
      await apiClient.delete(`/watchlist/${movieId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ movieId, status }: { movieId: number; status: string }) => {
      await apiClient.patch(`/watchlist/${movieId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Watchlist Requires Login</h2>
        <p className="text-xs text-slate-400">
          Sign in to view and organize movies you are planning to watch.
        </p>
        <button
          onClick={() => requireAuth(() => {}, 'Log in to view your watchlist.')}
          className="py-2.5 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs"
        >
          Log In Now
        </button>
      </div>
    );
  }

  const items = watchlistData?.items || [];

  return (
    <div className="space-y-8 pb-16">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-1.5">
            <Bookmark className="w-4 h-4" />
            <span>My Library</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Your Movie Watchlist
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {items.length} film{items.length === 1 ? '' : 's'} saved to watch.
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          {[
            { id: '', label: 'All' },
            { id: 'PLAN_TO_WATCH', label: 'Plan to Watch' },
            { id: 'WATCHING', label: 'Watching' },
            { id: 'COMPLETED', label: 'Completed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedStatus(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedStatus === tab.id
                  ? 'bg-cyan-500 text-black font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingSpinner message="Loading your watchlist..." />
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : items.length === 0 ? (
        <EmptyState
          title="Your Watchlist is Empty"
          description="Browse trending and AI recommended movies to add to your personal queue."
          actionLabel="Discover Movies"
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
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-lg bg-slate-950/80 backdrop-blur-md border border-amber-400/30 text-amber-400 text-xs font-bold flex items-center space-x-1">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>{item.voteAverage ? item.voteAverage.toFixed(1) : 'NR'}</span>
                  </div>
                </Link>

                <div className="p-4 space-y-2">
                  <Link href={`/movies/${item.movieId}`}>
                    <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                  </Link>

                  {/* Status Dropdown */}
                  <select
                    value={item.status}
                    onChange={(e) =>
                      updateStatusMutation.mutate({
                        movieId: item.movieId,
                        status: e.target.value,
                      })
                    }
                    className="w-full py-1.5 px-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] text-slate-300 outline-none focus:border-cyan-500"
                  >
                    <option value="PLAN_TO_WATCH">Plan to Watch</option>
                    <option value="WATCHING">Currently Watching</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="DROPPED">Dropped</option>
                  </select>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-4 pt-0 flex items-center justify-between border-t border-slate-800/40 mt-auto">
                <Link
                  href={`/movies/${item.movieId}`}
                  className="inline-flex items-center space-x-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300"
                >
                  <Play className="w-3 h-3 fill-cyan-400" />
                  <span>View Details</span>
                </Link>

                <button
                  onClick={() => removeMutation.mutate(item.movieId)}
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Remove from watchlist"
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
