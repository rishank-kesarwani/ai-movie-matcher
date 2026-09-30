'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ScoredRecommendation } from '../../types';
import { getTmdbImageUrl } from '../../lib/constants';
import { MatchScoreBadge } from './MatchScoreBadge';
import { WhyThisMovieModal } from './WhyThisMovieModal';
import { Info, Star, Bookmark, Play, Check } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../lib/api-client';

interface RecommendationCardProps {
  recommendation: ScoredRecommendation;
}

export function RecommendationCard({
  recommendation,
}: RecommendationCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const { requireAuth } = useAuth();
  const [inWatchlist, setInWatchlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const releaseYear = recommendation.releaseDate
    ? new Date(recommendation.releaseDate).getFullYear()
    : null;

  const handleWatchlistToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    requireAuth(async () => {
      setIsLoading(true);
      try {
        if (inWatchlist) {
          await apiClient.delete(`/watchlist/${recommendation.movieId}`);
          setInWatchlist(false);
        } else {
          await apiClient.post('/watchlist', {
            movieId: recommendation.movieId,
            title: recommendation.title,
            posterPath: recommendation.posterPath,
            backdropPath: recommendation.backdropPath,
            voteAverage: recommendation.voteAverage,
            releaseDate: recommendation.releaseDate,
            genreIds: recommendation.genreIds,
          });
          setInWatchlist(true);
        }
      } catch (err) {
        // Handled
      } finally {
        setIsLoading(false);
      }
    }, 'Log in to add recommended films to your watchlist.');
  };

  return (
    <>
      <div className="group relative rounded-3xl overflow-hidden glass-panel border border-slate-800 hover:border-cyan-500/40 transition-all duration-300 flex flex-col justify-between h-full shadow-lg hover:shadow-cyan-950/30">
        {/* Top Poster & Image Banner */}
        <div>
          <Link
            href={`/movies/${recommendation.movieId}`}
            className="relative aspect-[16/10] w-full block overflow-hidden bg-slate-900"
          >
            <Image
              src={getTmdbImageUrl(
                recommendation.backdropPath || recommendation.posterPath,
                'w780',
              )}
              alt={recommendation.title}
              fill
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
            />

            {/* Match Score Overlay */}
            <div className="absolute top-3 left-3 z-10">
              <MatchScoreBadge score={recommendation.matchScore} size="md" />
            </div>

            {/* Rating */}
            <div className="absolute top-3 right-3 z-10 flex items-center space-x-1 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-amber-400/30 text-amber-400 text-xs font-bold">
              <Star className="w-3 h-3 fill-amber-400" />
              <span>{recommendation.voteAverage.toFixed(1)}</span>
            </div>

            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
          </Link>

          {/* Card Body */}
          <div className="p-5">
            <div className="flex items-center space-x-2 text-xs text-slate-400 font-medium mb-1.5">
              {releaseYear && <span>{releaseYear}</span>}
              {releaseYear && recommendation.genres && recommendation.genres.length > 0 && <span>•</span>}
              {recommendation.genres && (
                <span className="truncate text-cyan-400">
                  {recommendation.genres.slice(0, 2).join(', ')}
                </span>
              )}
            </div>

            <Link href={`/movies/${recommendation.movieId}`}>
              <h3 className="text-base font-extrabold text-white group-hover:text-cyan-400 transition-colors line-clamp-1 mb-2">
                {recommendation.title}
              </h3>
            </Link>

            {/* AI Explanation Snippet */}
            <p className="text-xs text-slate-300 line-clamp-2 leading-relaxed bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/80 mb-4">
              "{recommendation.explanation}"
            </p>
          </div>
        </div>

        {/* Card Footer Actions */}
        <div className="p-5 pt-0 flex items-center justify-between gap-2 border-t border-slate-800/40 mt-auto">
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center space-x-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 py-1.5 px-3 rounded-lg hover:bg-cyan-500/10 transition-colors"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Why this pick?</span>
          </button>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleWatchlistToggle}
              disabled={isLoading}
              className={`p-2 rounded-xl border transition-all ${
                inWatchlist
                  ? 'bg-cyan-500 border-cyan-400 text-black'
                  : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-cyan-400 hover:bg-slate-800'
              }`}
              title={inWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
            >
              {inWatchlist ? <Check className="w-4 h-4 stroke-[3]" /> : <Bookmark className="w-4 h-4" />}
            </button>

            <Link
              href={`/movies/${recommendation.movieId}`}
              className="p-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-md shadow-cyan-500/20"
              title="View Movie Details"
            >
              <Play className="w-4 h-4 fill-white" />
            </Link>
          </div>
        </div>
      </div>

      {/* Transparency Modal */}
      <WhyThisMovieModal
        recommendation={recommendation}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
      />
    </>
  );
}
