'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../lib/api-client';
import { Movie, WatchlistItem } from '../../../types';
import { getBackdropUrl, getTmdbImageUrl } from '../../../lib/constants';
import { useAuth } from '../../../context/AuthContext';
import { LoadingSpinner } from '../../../components/ui/LoadingSpinner';
import { ErrorState } from '../../../components/ui/ErrorState';
import { MovieGrid } from '../../../components/movies/MovieGrid';
import {
  Star,
  Bookmark,
  CheckCircle2,
  Heart,
  Clock,
  Calendar,
  Sparkles,
  Play,
  Share2,
  Film,
  Check,
} from 'lucide-react';

export default function MovieDetailsPage() {
  const params = useParams();
  const movieId = params.id as string;
  const queryClient = useQueryClient();
  const { user, requireAuth } = useAuth();

  const [userRatingInput, setUserRatingInput] = useState<number>(8);
  const [reviewInput, setReviewInput] = useState('');
  const [showRatingBox, setShowRatingBox] = useState(false);
  const [shareToast, setShareToast] = useState(false);

  // Fetch Movie Details
  const {
    data: movie,
    isLoading,
    error,
    refetch,
  } = useQuery<Movie>({
    queryKey: ['movies', 'details', movieId],
    queryFn: async () => {
      const res: any = await apiClient.get(`/movies/${movieId}`);
      return res.data || res;
    },
    enabled: Boolean(movieId),
  });

  // Fetch Similar Movies
  const { data: similarData } = useQuery<{ results: Movie[] }>({
    queryKey: ['movies', 'similar', movieId],
    queryFn: async () => {
      const res: any = await apiClient.get(`/movies/${movieId}/similar`);
      return res.data || res;
    },
    enabled: Boolean(movieId),
  });

  // Watchlist status check
  const { data: watchlistCheck } = useQuery<{ inWatchlist: boolean; item?: WatchlistItem }>({
    queryKey: ['watchlist', 'check', movieId, user?.id],
    queryFn: async () => {
      const res: any = await apiClient.get(`/watchlist/${movieId}/check`);
      return res.data || res;
    },
    enabled: Boolean(movieId && user),
  });

  // Watched status check
  const { data: watchedCheck } = useQuery<{ isWatched: boolean; item?: any }>({
    queryKey: ['watched', 'check', movieId, user?.id],
    queryFn: async () => {
      const res: any = await apiClient.get(`/watched/${movieId}/check`);
      return res.data || res;
    },
    enabled: Boolean(movieId && user),
  });

  // Favorite status check
  const { data: favoriteCheck } = useQuery<{ isFavorite: boolean }>({
    queryKey: ['favorites', 'check', movieId, user?.id],
    queryFn: async () => {
      const res: any = await apiClient.get(`/favorites/MOVIE/${movieId}/check`);
      return res.data || res;
    },
    enabled: Boolean(movieId && user),
  });

  // User Rating check
  const { data: ratingCheck } = useQuery<{ hasRated: boolean; rating?: any }>({
    queryKey: ['ratings', 'check', movieId, user?.id],
    queryFn: async () => {
      const res: any = await apiClient.get(`/movies/${movieId}/rating`);
      return res.data || res;
    },
    enabled: Boolean(movieId && user),
  });

  const inWatchlist = Boolean(watchlistCheck?.inWatchlist);
  const isWatched = Boolean(watchedCheck?.isWatched);
  const isFavorite = Boolean(favoriteCheck?.isFavorite);
  const userRating = ratingCheck?.rating;

  // Toggle Watchlist Mutation
  const toggleWatchlist = async () => {
    requireAuth(async () => {
      if (inWatchlist) {
        await apiClient.delete(`/watchlist/${movieId}`);
      } else {
        await apiClient.post('/watchlist', {
          movieId: Number(movieId),
          title: movie?.title,
          posterPath: movie?.posterPath,
          backdropPath: movie?.backdropPath,
          voteAverage: movie?.voteAverage,
          releaseDate: movie?.releaseDate,
          genreIds: movie?.genreIds,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['watchlist'] });
    }, 'Log in to add this film to your watchlist.');
  };

  // Toggle Favorite Mutation
  const toggleFavorite = async () => {
    requireAuth(async () => {
      if (isFavorite) {
        await apiClient.delete(`/favorites/MOVIE/${movieId}`);
      } else {
        await apiClient.post('/favorites', {
          type: 'MOVIE',
          itemId: String(movieId),
          name: movie?.title,
          imagePath: movie?.posterPath,
        });
      }
      queryClient.invalidateQueries({ queryKey: ['favorites'] });
    }, 'Log in to save this movie to your favorites.');
  };

  // Mark Watched & Submit Rating
  const submitWatchedAndRating = async () => {
    requireAuth(async () => {
      await Promise.all([
        apiClient.post('/watched', {
          movieId: Number(movieId),
          title: movie?.title,
          posterPath: movie?.posterPath,
          backdropPath: movie?.backdropPath,
          userRating: userRatingInput,
          review: reviewInput || undefined,
          genreIds: movie?.genreIds,
        }),
        apiClient.post(`/movies/${movieId}/rating`, {
          title: movie?.title,
          rating: userRatingInput,
          review: reviewInput || undefined,
        }),
      ]);

      setShowRatingBox(false);
      queryClient.invalidateQueries({ queryKey: ['watched'] });
      queryClient.invalidateQueries({ queryKey: ['ratings'] });
    }, 'Log in to rate this film and log it to your viewing history.');
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setShareToast(true);
      setTimeout(() => setShareToast(false), 2500);
    }
  };

  if (isLoading) {
    return <LoadingSpinner message="Retrieving film details, cast, and AI insights..." />;
  }

  if (error || !movie) {
    return (
      <ErrorState
        title="Movie Not Found"
        message={error?.message || 'Unable to load movie details.'}
        onRetry={() => refetch()}
      />
    );
  }

  const releaseYear = movie.releaseDate
    ? new Date(movie.releaseDate).getFullYear()
    : null;

  const trailer = movie.videos?.find(
    (v) => v.type === 'Trailer' && v.site === 'YouTube',
  );

  const castList = movie.credits?.cast?.slice(0, 8) || [];
  const director = movie.director || movie.credits?.crew?.find((c) => c.job === 'Director')?.name;

  return (
    <div className="space-y-12 pb-16">
      {/* Top Hero Backdrop Header */}
      <div className="relative w-full rounded-3xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
        {/* Backdrop Image */}
        <div className="relative h-[320px] sm:h-[420px] lg:h-[480px] w-full">
          <Image
            src={getBackdropUrl(movie.backdropPath, 'original')}
            alt={movie.title}
            fill
            priority
            className="object-cover object-top opacity-60"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/40 to-transparent" />
        </div>

        {/* Floating Details Content */}
        <div className="relative z-10 px-6 sm:px-10 pb-8 -mt-36 sm:-mt-48 flex flex-col md:flex-row gap-8 items-start">
          {/* Poster */}
          <div className="relative w-44 sm:w-56 aspect-[2/3] rounded-2xl overflow-hidden shadow-2xl border border-slate-700/80 shrink-0 bg-slate-900 mx-auto md:mx-0">
            <Image
              src={getTmdbImageUrl(movie.posterPath, 'w500')}
              alt={movie.title}
              fill
              className="object-cover"
            />
          </div>

          {/* Details & Actions */}
          <div className="flex-1 space-y-4">
            {/* Tagline & Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold shadow-md">
                <Star className="w-3.5 h-3.5 fill-amber-300" />
                <span>{movie.voteAverage.toFixed(1)} TMDB ({movie.voteCount.toLocaleString()} votes)</span>
              </div>

              {movie.runtime && (
                <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-medium">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{movie.runtime} mins</span>
                </div>
              )}

              {releaseYear && (
                <div className="flex items-center space-x-1 px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-medium">
                  <Calendar className="w-3.5 h-3.5 text-violet-400" />
                  <span>{releaseYear}</span>
                </div>
              )}
            </div>

            {/* Title & Tagline */}
            <div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight">
                {movie.title}
              </h1>
              {movie.tagline && (
                <p className="text-xs sm:text-sm text-cyan-400 italic mt-1">
                  "{movie.tagline}"
                </p>
              )}
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 pt-1">
              {(movie.genres || []).map((g) => (
                <span
                  key={g.id}
                  className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 text-xs font-semibold"
                >
                  {g.name}
                </span>
              ))}
            </div>

            {/* Action Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-3">
              <button
                onClick={toggleWatchlist}
                className={`flex items-center space-x-2 py-2.5 px-5 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-md ${
                  inWatchlist
                    ? 'bg-cyan-500 text-black shadow-cyan-500/30'
                    : 'bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-cyan-400'
                }`}
              >
                {inWatchlist ? <Check className="w-4 h-4 stroke-[3]" /> : <Bookmark className="w-4 h-4" />}
                <span>{inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}</span>
              </button>

              <button
                onClick={() => setShowRatingBox(!showRatingBox)}
                className={`flex items-center space-x-2 py-2.5 px-5 rounded-xl font-bold text-xs sm:text-sm transition-all ${
                  isWatched
                    ? 'bg-emerald-500/20 border border-emerald-500/40 text-emerald-400'
                    : 'bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 hover:text-emerald-400'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isWatched ? `Watched (${userRating?.rating || 8}/10)` : 'Mark as Watched'}</span>
              </button>

              <button
                onClick={toggleFavorite}
                className={`p-2.5 rounded-xl border transition-all ${
                  isFavorite
                    ? 'bg-rose-500/20 border-rose-500/40 text-rose-400 shadow-rose-950/40'
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-700 text-slate-300 hover:text-rose-400'
                }`}
                title="Favorite"
              >
                <Heart className={`w-5 h-5 ${isFavorite ? 'fill-rose-400' : ''}`} />
              </button>

              <button
                onClick={handleShare}
                className="p-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-cyan-400 transition-colors"
                title="Share link"
              >
                <Share2 className="w-5 h-5" />
              </button>

              {shareToast && (
                <span className="text-xs text-cyan-400 font-bold animate-fadeIn">
                  Link copied to clipboard!
                </span>
              )}
            </div>

            {/* Rating / Review Box (Collapsible) */}
            {showRatingBox && (
              <div className="p-4 rounded-2xl bg-slate-900/95 border border-cyan-500/40 shadow-xl space-y-3 mt-4 max-w-lg animate-fadeIn">
                <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                  Log Rating & Review
                </h4>

                <div className="flex items-center space-x-3">
                  <label className="text-xs text-slate-300">Your Score (1-10):</label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={userRatingInput}
                    onChange={(e) => setUserRatingInput(parseFloat(e.target.value))}
                    className="flex-1 accent-cyan-400"
                  />
                  <span className="font-extrabold text-cyan-400 text-sm">
                    ★ {userRatingInput}
                  </span>
                </div>

                <textarea
                  value={reviewInput}
                  onChange={(e) => setReviewInput(e.target.value)}
                  placeholder="Optional review or note on your thoughts..."
                  rows={2}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-100 placeholder-slate-500 outline-none focus:border-cyan-500"
                />

                <div className="flex justify-end space-x-2">
                  <button
                    onClick={() => setShowRatingBox(false)}
                    className="px-3 py-1.5 text-xs text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={submitWatchedAndRating}
                    className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs shadow-md"
                  >
                    Save Entry
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid: Synopsis, Cast, Director, Trailer */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Story, Cast, Trailer */}
        <div className="lg:col-span-2 space-y-8">
          {/* Story Overview */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-3">
            <h3 className="text-lg font-bold text-white">Story Synopsis</h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {movie.overview || 'No synopsis provided.'}
            </p>
          </div>

          {/* Official Trailer Video Embed */}
          {trailer && (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center space-x-2">
                <Play className="w-5 h-5 text-cyan-400 fill-cyan-400" />
                <h3 className="text-lg font-bold text-white">Official Trailer</h3>
              </div>
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-xl border border-slate-800">
                <iframe
                  src={`https://www.youtube.com/embed/${trailer.key}`}
                  title={`${movie.title} Trailer`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 w-full h-full"
                />
              </div>
            </div>
          )}

          {/* Key Cast Members */}
          {castList.length > 0 && (
            <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
              <h3 className="text-lg font-bold text-white">Featured Cast</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {castList.map((cast) => (
                  <div
                    key={cast.id}
                    className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex flex-col items-center text-center space-y-2"
                  >
                    <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-900 border border-slate-700">
                      <Image
                        src={getTmdbImageUrl(cast.profilePath, 'w300')}
                        alt={cast.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-100 truncate max-w-[120px]">
                        {cast.name}
                      </p>
                      <p className="text-[10px] text-slate-400 truncate max-w-[120px]">
                        {cast.character}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Director, Film Facts & AI Taste Match */}
        <div className="space-y-6">
          {/* AI Cinematic Match Insights */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-cyan-950/40 via-slate-900 to-slate-900 border border-cyan-500/30 space-y-4 shadow-xl">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold text-xs uppercase tracking-wider">
              <Sparkles className="w-4 h-4 animate-pulse" />
              <span>AI Cinematic Match</span>
            </div>

            <h4 className="text-base font-extrabold text-white">
              Why You Should Watch
            </h4>

            <p className="text-xs text-slate-300 leading-relaxed">
              Based on your taste profile, "{movie.title}" combines stellar directorial precision with thought-provoking storytelling and iconic cinematography.
            </p>

            <div className="space-y-2 pt-2 border-t border-slate-800 text-xs text-slate-400">
              <div className="flex justify-between">
                <span>Thematic Depth:</span>
                <strong className="text-slate-200">High</strong>
              </div>
              <div className="flex justify-between">
                <span>Critical Consensus:</span>
                <strong className="text-amber-400">★ {movie.voteAverage}/10</strong>
              </div>
            </div>
          </div>

          {/* Film Metadata Card */}
          <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Film Metadata
            </h3>

            <div className="space-y-3 text-xs">
              {director && (
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Director</span>
                  <span className="font-semibold text-slate-200">{director}</span>
                </div>
              )}

              {movie.status && (
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Status</span>
                  <span className="font-semibold text-slate-200">{movie.status}</span>
                </div>
              )}

              {movie.releaseDate && (
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Release Date</span>
                  <span className="font-semibold text-slate-200">{movie.releaseDate}</span>
                </div>
              )}

              {movie.popularity && (
                <div className="flex justify-between">
                  <span className="text-slate-400">Popularity Score</span>
                  <span className="font-semibold text-cyan-400">{movie.popularity.toFixed(1)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Similar Movies Section */}
      {similarData?.results && similarData.results.length > 0 && (
        <section className="space-y-6 pt-6 border-t border-slate-800">
          <div className="flex items-center space-x-2">
            <Film className="w-5 h-5 text-cyan-400" />
            <h2 className="text-2xl font-black text-white tracking-tight">
              Similar Films You Might Like
            </h2>
          </div>
          <MovieGrid movies={similarData.results.slice(0, 5)} />
        </section>
      )}
    </div>
  );
}
