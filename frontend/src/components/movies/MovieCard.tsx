'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Movie } from '../../types';
import { getTmdbImageUrl, GENRE_MAP } from '../../lib/constants';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../lib/api-client';
import { Star, Bookmark, Check, Heart, Plus } from 'lucide-react';

interface MovieCardProps {
  movie: Movie;
  onWatchlistChanged?: () => void;
}

export function MovieCard({ movie, onWatchlistChanged }: MovieCardProps) {
  const { requireAuth } = useAuth();
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isWatched, setIsWatched] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const releaseYear = movie.releaseDate
    ? new Date(movie.releaseDate).getFullYear()
    : null;

  const topGenres = (movie.genreIds || [])
    .slice(0, 2)
    .map((id) => GENRE_MAP[id] || (movie.genres?.find((g) => g.id === id)?.name))
    .filter(Boolean);

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    requireAuth(async () => {
      setIsActionLoading(true);
      try {
        if (inWatchlist) {
          await apiClient.delete(`/watchlist/${movie.id}`);
          setInWatchlist(false);
        } else {
          await apiClient.post('/watchlist', {
            movieId: movie.id,
            title: movie.title,
            posterPath: movie.posterPath,
            backdropPath: movie.backdropPath,
            voteAverage: movie.voteAverage,
            releaseDate: movie.releaseDate,
            genreIds: movie.genreIds,
          });
          setInWatchlist(true);
        }
        onWatchlistChanged?.();
      } catch (err) {
        // Handled by interceptor
      } finally {
        setIsActionLoading(false);
      }
    }, 'Log in to add movies to your personal watchlist.');
  };

  const handleWatchedToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    requireAuth(async () => {
      setIsActionLoading(true);
      try {
        if (isWatched) {
          await apiClient.delete(`/watched/${movie.id}`);
          setIsWatched(false);
        } else {
          await apiClient.post('/watched', {
            movieId: movie.id,
            title: movie.title,
            posterPath: movie.posterPath,
            backdropPath: movie.backdropPath,
            genreIds: movie.genreIds,
          });
          setIsWatched(true);
        }
      } catch (err) {
        // Handled by interceptor
      } finally {
        setIsActionLoading(false);
      }
    }, 'Log in to track your watched movie history and taste profile.');
  };

  const handleFavoriteToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    requireAuth(async () => {
      setIsActionLoading(true);
      try {
        if (isFavorite) {
          await apiClient.delete(`/favorites/MOVIE/${movie.id}`);
          setIsFavorite(false);
        } else {
          await apiClient.post('/favorites', {
            type: 'MOVIE',
            itemId: String(movie.id),
            name: movie.title,
            imagePath: movie.posterPath,
          });
          setIsFavorite(true);
        }
      } catch (err) {
        // Handled
      } finally {
        setIsActionLoading(false);
      }
    }, 'Log in to favorite films and enhance AI match precision.');
  };

  return (
    <div className="group relative rounded-2xl overflow-hidden glass-card flex flex-col h-full">
      {/* Poster Media */}
      <Link href={`/movies/${movie.id}`} className="relative aspect-[2/3] w-full overflow-hidden bg-slate-900 block">
        <Image
          src={getTmdbImageUrl(movie.posterPath, 'w500')}
          alt={movie.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          priority={false}
        />

        {/* Rating Badge Overlay */}
        <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-lg bg-slate-950/80 backdrop-blur-md border border-amber-400/30 flex items-center space-x-1 text-amber-400 text-xs font-bold shadow-md">
          <Star className="w-3 h-3 fill-amber-400" />
          <span>{movie.voteAverage > 0 ? movie.voteAverage.toFixed(1) : 'NR'}</span>
        </div>

        {/* Floating Action Buttons */}
        <div className="absolute top-2.5 right-2.5 flex flex-col space-y-1.5 opacity-90 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={handleWatchlistToggle}
            disabled={isActionLoading}
            className={`p-2 rounded-xl backdrop-blur-md transition-all ${
              inWatchlist
                ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/40'
                : 'bg-slate-950/80 hover:bg-cyan-500/20 text-slate-200 hover:text-cyan-400 border border-slate-700/60'
            }`}
            title={inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
          >
            {inWatchlist ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Bookmark className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={handleFavoriteToggle}
            disabled={isActionLoading}
            className={`p-2 rounded-xl backdrop-blur-md transition-all ${
              isFavorite
                ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40'
                : 'bg-slate-950/80 hover:bg-rose-500/20 text-slate-200 hover:text-rose-400 border border-slate-700/60'
            }`}
            title={isFavorite ? 'Favorited' : 'Add to Favorites'}
          >
            <Heart className={`w-3.5 h-3.5 ${isFavorite ? 'fill-white' : ''}`} />
          </button>
        </div>

        {/* Bottom Dark Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent pointer-events-none" />
      </Link>

      {/* Card Body */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 font-medium mb-1">
            {releaseYear && <span>{releaseYear}</span>}
            {releaseYear && topGenres.length > 0 && <span>•</span>}
            <span className="truncate">{topGenres.join(', ')}</span>
          </div>

          <Link href={`/movies/${movie.id}`}>
            <h4 className="text-sm font-bold text-slate-100 group-hover:text-cyan-400 transition-colors line-clamp-1">
              {movie.title}
            </h4>
          </Link>
        </div>

        <p className="text-[11px] text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">
          {movie.overview || 'No synopsis available.'}
        </p>
      </div>
    </div>
  );
}
