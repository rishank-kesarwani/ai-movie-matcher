'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { FavoriteItem } from '../../types';
import { getTmdbImageUrl } from '../../lib/constants';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { Heart, Trash2, Film, User, Tag, Lock, Play } from 'lucide-react';

export default function FavoritesPage() {
  const { user, isAuthenticated, requireAuth } = useAuth();
  const queryClient = useQueryClient();
  const [selectedType, setSelectedType] = useState<string>('');

  const {
    data: favoritesData,
    isLoading,
    error,
    refetch,
  } = useQuery<FavoriteItem[]>({
    queryKey: ['favorites', user?.id, selectedType],
    queryFn: async () => {
      const url = selectedType ? `/favorites?type=${selectedType}` : '/favorites';
      const res: any = await apiClient.get(url);
      return res.data || res;
    },
    enabled: isAuthenticated,
  });

  const removeMutation = useMutation({
    mutationFn: async ({ type, itemId }: { type: string; itemId: string }) => {
      await apiClient.delete(`/favorites/${type}/${itemId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    },
  });

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-rose-400 mx-auto">
          <Heart className="w-8 h-8 fill-rose-400" />
        </div>
        <h2 className="text-2xl font-bold text-white">Favorites Require Login</h2>
        <p className="text-xs text-slate-400">
          Sign in to save your favorite movies, actors, directors, and genres.
        </p>
        <button
          onClick={() => requireAuth(() => {}, 'Log in to view your favorite movies.')}
          className="py-2.5 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs"
        >
          Log In
        </button>
      </div>
    );
  }

  const items = favoritesData || [];

  return (
    <div className="space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1.5">
            <Heart className="w-4 h-4 fill-rose-400" />
            <span>Hall of Fame</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Your Favorite Cinema
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            {items.length} item{items.length === 1 ? '' : 's'} favorited.
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-xl">
          {[
            { id: '', label: 'All Favorites' },
            { id: 'MOVIE', label: 'Movies' },
            { id: 'GENRE', label: 'Genres' },
            { id: 'ACTOR', label: 'Actors' },
            { id: 'DIRECTOR', label: 'Directors' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedType(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                selectedType === tab.id
                  ? 'bg-rose-500 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <LoadingSpinner message="Loading your favorites..." />
      ) : error ? (
        <ErrorState message={error.message} onRetry={() => refetch()} />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Heart}
          title="No Favorites Saved Yet"
          description="Mark films, genres, and directors as favorites to boost their recommendation ranking."
          actionLabel="Browse Movies"
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
                {item.type === 'MOVIE' && (
                  <Link
                    href={`/movies/${item.itemId}`}
                    className="relative aspect-[16/10] w-full block overflow-hidden bg-slate-900"
                  >
                    <Image
                      src={getTmdbImageUrl(item.imagePath, 'w780')}
                      alt={item.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </Link>
                )}

                <div className="p-5 space-y-2">
                  <div className="flex items-center space-x-1.5 text-[10px] font-bold uppercase tracking-wider text-rose-400">
                    {item.type === 'MOVIE' ? (
                      <Film className="w-3 h-3" />
                    ) : item.type === 'GENRE' ? (
                      <Tag className="w-3 h-3" />
                    ) : (
                      <User className="w-3 h-3" />
                    )}
                    <span>{item.type}</span>
                  </div>

                  <h3 className="text-base font-bold text-white group-hover:text-rose-400 transition-colors line-clamp-1">
                    {item.name}
                  </h3>
                </div>
              </div>

              <div className="p-5 pt-0 flex items-center justify-between border-t border-slate-800/40 mt-auto">
                {item.type === 'MOVIE' ? (
                  <Link
                    href={`/movies/${item.itemId}`}
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-rose-400 hover:text-rose-300"
                  >
                    <Play className="w-3 h-3 fill-rose-400" />
                    <span>Watch Info</span>
                  </Link>
                ) : (
                  <span className="text-xs text-slate-500">Preference Signal</span>
                )}

                <button
                  onClick={() =>
                    removeMutation.mutate({ type: item.type, itemId: item.itemId })
                  }
                  className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  title="Remove from favorites"
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
