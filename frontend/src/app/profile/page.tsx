'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { UserPreference, Genre } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { User, Sparkles, Brain, Save, Check, Lock, Sliders } from 'lucide-react';

export default function ProfilePage() {
  const { user, isAuthenticated, requireAuth } = useAuth();
  const queryClient = useQueryClient();

  const [favoriteGenres, setFavoriteGenres] = useState<number[]>([]);
  const [favoriteDirectors, setFavoriteDirectors] = useState<string>('');
  const [favoriteActors, setFavoriteActors] = useState<string>('');
  const [minimumRating, setMinimumRating] = useState<number>(7.0);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Fetch Genres
  const { data: genresData } = useQuery<Genre[]>({
    queryKey: ['movies', 'genres'],
    queryFn: async () => {
      const res: any = await apiClient.get('/movies/genres');
      return res.data || res;
    },
  });

  // Fetch Preferences
  const {
    data: prefData,
    isLoading,
    error,
  } = useQuery<UserPreference>({
    queryKey: ['preferences', user?.id],
    queryFn: async () => {
      const res: any = await apiClient.get('/preferences');
      return res.data || res;
    },
    enabled: isAuthenticated,
  });

  useEffect(() => {
    if (prefData) {
      setFavoriteGenres(prefData.favoriteGenres || []);
      setFavoriteDirectors((prefData.favoriteDirectors || []).join(', '));
      setFavoriteActors((prefData.favoriteActors || []).join(', '));
      setMinimumRating(prefData.minimumRating || 7.0);
    }
  }, [prefData]);

  // Save Preferences Mutation
  const saveMutation = useMutation({
    mutationFn: async () => {
      const directors = favoriteDirectors
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      const actors = favoriteActors
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      await apiClient.put('/preferences', {
        favoriteGenres,
        favoriteDirectors: directors,
        favoriteActors: actors,
        minimumRating,
      });
    },
    onSuccess: () => {
      setSaveSuccess(true);
      queryClient.invalidateQueries({ queryKey: ['preferences'] });
      queryClient.invalidateQueries({ queryKey: ['recommendations'] });
      setTimeout(() => setSaveSuccess(false), 3000);
    },
  });

  const toggleGenre = (genreId: number) => {
    setFavoriteGenres((prev) =>
      prev.includes(genreId)
        ? prev.filter((id) => id !== genreId)
        : [...prev, genreId],
    );
  };

  if (!isAuthenticated) {
    return (
      <div className="py-20 text-center max-w-md mx-auto space-y-4">
        <div className="w-16 h-16 rounded-3xl bg-slate-900 border border-slate-800 flex items-center justify-center text-cyan-400 mx-auto">
          <Lock className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Profile Requires Login</h2>
        <p className="text-xs text-slate-400">
          Sign in to manage your film taste profile, memory, and custom recommender settings.
        </p>
        <button
          onClick={() => requireAuth(() => {}, 'Log in to manage your profile.')}
          className="py-2.5 px-6 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs"
        >
          Log In
        </button>
      </div>
    );
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading your taste profile..." />;
  }

  const genres = genresData || [];

  return (
    <div className="space-y-8 pb-16 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4 border-b border-slate-800 pb-6">
        <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-cyan-500 to-violet-600 flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-cyan-500/20">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {user?.name}
          </h1>
          <p className="text-xs text-slate-400">{user?.email}</p>
        </div>
      </div>

      {/* AI Derived Taste Summary Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-violet-950/40 via-slate-900 to-cyan-950/40 border border-violet-500/30 shadow-2xl space-y-3">
        <div className="flex items-center space-x-2 text-violet-400 font-bold text-xs uppercase tracking-wider">
          <Brain className="w-4 h-4 animate-pulse" />
          <span>Derived AI Taste Memory</span>
        </div>

        <h3 className="text-base font-bold text-white">
          Inferred Cinematic Aesthetic
        </h3>

        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
          "{prefData?.tasteSummary || 'Loves thought-provoking science fiction, philosophical narratives, and visually rich films with strong atmosphere.'}"
        </p>

        <p className="text-[11px] text-slate-400">
          * Automatically updated as you rate films, log viewing history, and favorite movies.
        </p>
      </div>

      {/* Explicit Preference Form */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-6">
        <div className="flex items-center space-x-2 text-xs font-bold text-cyan-400 uppercase tracking-wider">
          <Sliders className="w-4 h-4" />
          <span>Explicit Taste Preferences</span>
        </div>

        {/* Favorite Genres Selection */}
        <div className="space-y-3">
          <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
            Favorite Genres
          </label>
          <div className="flex flex-wrap gap-2">
            {genres.map((g) => {
              const selected = favoriteGenres.includes(g.id);
              return (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => toggleGenre(g.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    selected
                      ? 'bg-cyan-500 text-black shadow-md shadow-cyan-500/30'
                      : 'bg-slate-950 text-slate-300 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {g.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Favorite Directors */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
            Favorite Directors (Comma separated)
          </label>
          <input
            type="text"
            value={favoriteDirectors}
            onChange={(e) => setFavoriteDirectors(e.target.value)}
            placeholder="E.g. Christopher Nolan, Denis Villeneuve, Quentin Tarantino, Bong Joon-ho"
            className="w-full py-3 px-4 rounded-2xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
          />
        </div>

        {/* Favorite Actors */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-200 uppercase tracking-wider">
            Favorite Actors (Comma separated)
          </label>
          <input
            type="text"
            value={favoriteActors}
            onChange={(e) => setFavoriteActors(e.target.value)}
            placeholder="E.g. Leonardo DiCaprio, Matthew McConaughey, Amy Adams, Cillian Murphy"
            className="w-full py-3 px-4 rounded-2xl bg-slate-950 border border-slate-800 focus:border-cyan-500 text-xs sm:text-sm text-slate-100 placeholder-slate-500 outline-none transition-all"
          />
        </div>

        {/* Minimum Rating Threshold */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Minimum Rating Filter
            </label>
            <span className="text-xs font-bold text-cyan-400">★ {minimumRating}/10</span>
          </div>
          <input
            type="range"
            min="5.0"
            max="9.0"
            step="0.5"
            value={minimumRating}
            onChange={(e) => setMinimumRating(parseFloat(e.target.value))}
            className="w-full accent-cyan-400"
          />
        </div>

        {/* Save Button */}
        <div className="pt-4 flex items-center justify-between">
          {saveSuccess && (
            <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span>Taste profile successfully updated!</span>
            </span>
          )}
          <div className="ml-auto">
            <button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending}
              className="flex items-center space-x-2 py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 disabled:opacity-50 transition-all"
            >
              <Save className="w-4 h-4" />
              <span>{saveMutation.isPending ? 'Saving...' : 'Save Preferences'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
