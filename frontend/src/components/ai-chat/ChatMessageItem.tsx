'use client';

import React from 'react';
import Link from 'next/link';
import { ChatMessage } from '../../types';
import { getTmdbImageUrl } from '../../lib/constants';
import { MovieImage } from '../ui/MovieImage';
import { Bot, User, Star, Play, Sparkles } from 'lucide-react';

interface ChatMessageItemProps {
  message: ChatMessage;
}

export function ChatMessageItem({ message }: ChatMessageItemProps) {
  const isUser = message.role === 'user';
  const movies =
    (message.enrichedMovies && message.enrichedMovies.length > 0
      ? message.enrichedMovies
      : message.suggestedMovies) || [];

  return (
    <div className={`flex gap-3 sm:gap-4 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar Icon */}
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
          isUser
            ? 'bg-gradient-to-tr from-cyan-500 to-blue-600 text-white'
            : 'bg-gradient-to-tr from-violet-600 to-cyan-500 text-white'
        }`}
      >
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </div>

      {/* Message Content Bubble */}
      <div className={`flex flex-col max-w-[85%] sm:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-md ${
            isUser
              ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-tr-none'
              : 'bg-slate-900 border border-slate-800 text-slate-100 rounded-tl-none'
          }`}
        >
          <p className="whitespace-pre-wrap">{message.content || 'Here are the recommended movies for you:'}</p>
        </div>

        {/* Suggested Film Cards (if assistant returned structured suggestions) */}
        {!isUser && movies.length > 0 && (
          <div className="mt-4 w-full space-y-3">
            <div className="flex items-center space-x-1.5 text-xs text-cyan-400 font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Matched Recommendations ({movies.length})</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {movies.map((movie: any, idx: number) => {
                const targetId = movie.id || movie.tmdbId;
                const poster = movie.posterPath ? getTmdbImageUrl(movie.posterPath, 'w300') : null;

                return (
                  <div
                    key={targetId || idx}
                    className="flex gap-3 p-3 rounded-2xl bg-slate-950/80 border border-slate-800/80 hover:border-cyan-500/40 transition-all group"
                  >
                    <div className="relative w-16 h-24 rounded-lg overflow-hidden bg-slate-900 shrink-0">
                      <MovieImage
                        src={poster}
                        alt={movie.title}
                        title={movie.title}
                        fill
                        type="poster"
                        className="object-cover"
                      />
                    </div>

                    <div className="flex flex-col justify-between flex-1 min-w-0">
                      <div>
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <h4 className="text-xs font-bold text-white truncate group-hover:text-cyan-400 transition-colors">
                            {movie.title}
                          </h4>
                          <div className="flex items-center space-x-0.5 text-amber-400 text-[10px] font-bold shrink-0">
                            <Star className="w-2.5 h-2.5 fill-amber-400" />
                            <span>{movie.voteAverage ? movie.voteAverage.toFixed(1) : '8.0'}</span>
                          </div>
                        </div>

                        <p className="text-[11px] text-slate-300 line-clamp-2 leading-tight">
                          {movie.matchReason || movie.overview || 'Recommended match for your taste.'}
                        </p>
                      </div>

                      {targetId ? (
                        <Link
                          href={`/movies/${targetId}`}
                          className="inline-flex items-center space-x-1 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 mt-2"
                        >
                          <Play className="w-2.5 h-2.5 fill-cyan-400" />
                          <span>View Movie</span>
                        </Link>
                      ) : null}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
