'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Movie } from '../../types';
import { getBackdropUrl, GENRE_MAP } from '../../lib/constants';
import { Sparkles, Star, Play, ChevronLeft, ChevronRight, Bookmark } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../lib/api-client';

interface MovieHeroCarouselProps {
  movies: Movie[];
}

export function MovieHeroCarousel({ movies }: MovieHeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { requireAuth } = useAuth();
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!movies || movies.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 7000);
    return () => clearInterval(interval);
  }, [movies]);

  if (!movies || movies.length === 0) return null;

  const currentMovie = movies[currentIndex] || movies[0];
  const genres = (currentMovie.genreIds || [])
    .slice(0, 3)
    .map((id) => GENRE_MAP[id])
    .filter(Boolean);

  const handleQuickWatchlist = () => {
    requireAuth(async () => {
      try {
        await apiClient.post('/watchlist', {
          movieId: currentMovie.id,
          title: currentMovie.title,
          posterPath: currentMovie.posterPath,
          backdropPath: currentMovie.backdropPath,
          voteAverage: currentMovie.voteAverage,
          releaseDate: currentMovie.releaseDate,
          genreIds: currentMovie.genreIds,
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      } catch (e) {
        // Handled
      }
    }, 'Log in to add featured movies to your watchlist.');
  };

  return (
    <div className="relative w-full h-[420px] sm:h-[500px] lg:h-[560px] rounded-3xl overflow-hidden border border-slate-800/80 shadow-2xl mb-12 group">
      {/* Background Image with Cinematic Overlay Gradients */}
      <Image
        src={getBackdropUrl(currentMovie.backdropPath, 'original')}
        alt={currentMovie.title}
        fill
        priority
        className="object-cover object-center transition-all duration-700 ease-in-out"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent z-10" />

      {/* Featured Content Area */}
      <div className="relative z-20 h-full flex flex-col justify-end p-6 sm:p-10 lg:p-14 max-w-2xl">
        {/* Badge & Highlights */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-xs font-bold tracking-wide uppercase flex items-center gap-1.5 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            Featured Match
          </span>

          <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md border border-amber-400/30 text-amber-400 text-xs font-bold">
            <Star className="w-3.5 h-3.5 fill-amber-400" />
            <span>{currentMovie.voteAverage.toFixed(1)} TMDB</span>
          </div>

          {currentMovie.releaseDate && (
            <span className="text-xs text-slate-400 font-medium">
              {new Date(currentMovie.releaseDate).getFullYear()}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight mb-3 line-clamp-2">
          {currentMovie.title}
        </h1>

        {/* Genres */}
        {genres.length > 0 && (
          <div className="flex items-center gap-2 mb-3">
            {genres.map((g) => (
              <span
                key={g}
                className="px-2.5 py-0.5 rounded-md bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-medium"
              >
                {g}
              </span>
            ))}
          </div>
        )}

        {/* Overview Synopsis */}
        <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 mb-6 leading-relaxed">
          {currentMovie.overview}
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/movies/${currentMovie.id}`}
            className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs sm:text-sm transition-all shadow-lg shadow-cyan-500/25"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>View Film Details</span>
          </Link>

          <button
            onClick={handleQuickWatchlist}
            className={`flex items-center space-x-2 px-4 py-3 rounded-xl backdrop-blur-md text-xs sm:text-sm font-semibold transition-all ${
              saved
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700'
            }`}
          >
            <Bookmark className="w-4 h-4 text-cyan-400" />
            <span>{saved ? 'Added to Watchlist!' : 'Add to Watchlist'}</span>
          </button>
        </div>
      </div>

      {/* Carousel Controls */}
      <div className="absolute bottom-6 right-6 z-30 hidden sm:flex items-center space-x-2">
        <button
          onClick={() =>
            setCurrentIndex((prev) => (prev === 0 ? movies.length - 1 : prev - 1))
          }
          className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 backdrop-blur-md transition-colors"
          aria-label="Previous featured movie"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-1.5 px-3">
          {movies.slice(0, 5).map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`h-1.5 rounded-full transition-all ${
                idx === currentIndex
                  ? 'w-6 bg-cyan-400'
                  : 'w-2 bg-slate-700 hover:bg-slate-500'
              }`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>

        <button
          onClick={() =>
            setCurrentIndex((prev) => (prev + 1) % movies.length)
          }
          className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-slate-700 backdrop-blur-md transition-colors"
          aria-label="Next featured movie"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
