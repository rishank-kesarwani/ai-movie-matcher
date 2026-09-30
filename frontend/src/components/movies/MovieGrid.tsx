import React from 'react';
import { Movie } from '../../types';
import { MovieCard } from './MovieCard';

interface MovieGridProps {
  movies: Movie[];
  onWatchlistChanged?: () => void;
}

export function MovieGrid({ movies, onWatchlistChanged }: MovieGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
      {movies.map((movie) => (
        <MovieCard
          key={movie.id}
          movie={movie}
          onWatchlistChanged={onWatchlistChanged}
        />
      ))}
    </div>
  );
}
