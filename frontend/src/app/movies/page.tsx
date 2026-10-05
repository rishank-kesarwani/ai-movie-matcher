'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../lib/api-client';
import { Movie, Genre } from '../../types';
import { LANGUAGE_OPTIONS } from '../../lib/constants';
import { MovieGrid } from '../../components/movies/MovieGrid';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { ErrorState } from '../../components/ui/ErrorState';
import { EmptyState } from '../../components/ui/EmptyState';
import { Film, Filter, SlidersHorizontal, RotateCcw, Globe } from 'lucide-react';

const QUICK_INDUSTRY_PILLS = [
  { label: 'All Industries', code: '', flag: '🌍' },
  { label: 'Bollywood (Hindi)', code: 'hi', flag: '🇮🇳' },
  { label: 'Tollywood (Telugu)', code: 'te', flag: '🇮🇳' },
  { label: 'Kollywood (Tamil)', code: 'ta', flag: '🇮🇳' },
  { label: 'Mollywood (Malayalam)', code: 'ml', flag: '🇮🇳' },
  { label: 'Hollywood (English)', code: 'en', flag: '🇺🇸' },
  { label: 'Korean Cinema', code: 'ko', flag: '🇰🇷' },
  { label: 'Anime & Japanese', code: 'ja', flag: '🇯🇵' },
];

function MoviesContent() {
  const searchParams = useSearchParams();
  const initialLang = searchParams?.get('language') || '';

  const [selectedLanguage, setSelectedLanguage] = useState<string>(initialLang);
  const [selectedGenre, setSelectedGenre] = useState<number | undefined>(undefined);
  const [selectedYear, setSelectedYear] = useState<number | undefined>(undefined);
  const [minRating, setMinRating] = useState<number | undefined>(undefined);
  const [maxRuntime, setMaxRuntime] = useState<number | undefined>(undefined);
  const [sortBy, setSortBy] = useState<string>('popularity.desc');
  const [page, setPage] = useState(1);

  // Sync with searchParams when navigating (e.g. from home page link)
  useEffect(() => {
    if (searchParams) {
      const urlLang = searchParams.get('language');
      if (urlLang !== null) {
        setSelectedLanguage(urlLang);
      }
    }
  }, [searchParams]);

  // Fetch Genres
  const { data: genresData } = useQuery<Genre[]>({
    queryKey: ['movies', 'genres'],
    queryFn: async () => {
      const res: any = await apiClient.get('/movies/genres');
      return res.data || res;
    },
  });

  // Discover Movies Query
  const {
    data: moviesData,
    isLoading,
    error,
    refetch,
  } = useQuery<{ results: Movie[]; totalPages: number; totalResults: number }>({
    queryKey: [
      'movies',
      'discover',
      selectedLanguage,
      selectedGenre,
      selectedYear,
      minRating,
      maxRuntime,
      sortBy,
      page,
    ],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedLanguage) params.append('language', selectedLanguage);
      if (selectedGenre) params.append('genreId', String(selectedGenre));
      if (selectedYear) params.append('year', String(selectedYear));
      if (minRating) params.append('minRating', String(minRating));
      if (maxRuntime) params.append('maxRuntime', String(maxRuntime));
      if (sortBy) params.append('sortBy', sortBy);
      params.append('page', String(page));

      const res: any = await apiClient.get(`/movies/discover?${params.toString()}`);
      return res.data || res;
    },
  });

  const resetFilters = () => {
    setSelectedLanguage('');
    setSelectedGenre(undefined);
    setSelectedYear(undefined);
    setMinRating(undefined);
    setMaxRuntime(undefined);
    setSortBy('popularity.desc');
    setPage(1);
  };

  const genres = genresData || [];
  const movies = moviesData?.results || [];
  const totalPages = moviesData?.totalPages || 1;

  return (
    <div className="space-y-8 pb-12">
      {/* Page Header */}
      <div>
        <div className="flex items-center space-x-2 text-xs font-semibold text-cyan-400 uppercase tracking-wider mb-2">
          <Film className="w-4 h-4" />
          <span>Worldwide Movie Catalog</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Explore Movies & Global Cinema
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Filter through thousands of Bollywood, Hollywood, South Indian, Asian, and worldwide masterpieces by industry, genre, release era, rating, and runtime.
        </p>
      </div>

      {/* Quick Industry Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {QUICK_INDUSTRY_PILLS.map((pill) => {
          const isSelected = selectedLanguage === pill.code;
          return (
            <button
              key={pill.code}
              onClick={() => {
                setSelectedLanguage(pill.code);
                setPage(1);
              }}
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold shrink-0 transition-all ${
                isSelected
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 border border-cyan-400/40'
                  : 'bg-slate-900/90 text-slate-300 hover:text-white hover:bg-slate-800 border border-slate-800'
              }`}
            >
              <span>{pill.flag}</span>
              <span>{pill.label}</span>
            </button>
          );
        })}
      </div>

      {/* Filter Control Bar */}
      <div className="p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-slate-200">
            <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
            <span>Filters & Sorting</span>
          </div>

          <button
            onClick={resetFilters}
            className="flex items-center space-x-1 text-xs text-slate-400 hover:text-cyan-400 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>

        {/* Filter Dropdowns Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {/* Language / Industry */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Industry / Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => {
                setSelectedLanguage(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-cyan-500 font-medium"
            >
              {LANGUAGE_OPTIONS.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.flag} {lang.label}
                </option>
              ))}
            </select>
          </div>

          {/* Genre */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Genre
            </label>
            <select
              value={selectedGenre || ''}
              onChange={(e) => {
                setSelectedGenre(e.target.value ? Number(e.target.value) : undefined);
                setPage(1);
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-cyan-500"
            >
              <option value="">All Genres</option>
              {genres.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          {/* Release Year */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Year
            </label>
            <select
              value={selectedYear || ''}
              onChange={(e) => {
                setSelectedYear(e.target.value ? Number(e.target.value) : undefined);
                setPage(1);
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-cyan-500"
            >
              <option value="">Any Year</option>
              {[2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2015, 2010, 2000, 1990].map(
                (yr) => (
                  <option key={yr} value={yr}>
                    {yr}
                  </option>
                ),
              )}
            </select>
          </div>

          {/* Min Rating */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Minimum Rating
            </label>
            <select
              value={minRating || ''}
              onChange={(e) => {
                setMinRating(e.target.value ? Number(e.target.value) : undefined);
                setPage(1);
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-cyan-500"
            >
              <option value="">Any Rating</option>
              <option value="8.0">★ 8.0+ Highly Acclaimed</option>
              <option value="7.5">★ 7.5+ Great</option>
              <option value="7.0">★ 7.0+ Good</option>
              <option value="6.0">★ 6.0+ Average</option>
            </select>
          </div>

          {/* Max Runtime */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Max Runtime
            </label>
            <select
              value={maxRuntime || ''}
              onChange={(e) => {
                setMaxRuntime(e.target.value ? Number(e.target.value) : undefined);
                setPage(1);
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-cyan-500"
            >
              <option value="">Any Runtime</option>
              <option value="90">Under 90 Mins</option>
              <option value="120">Under 2 Hours (120 Mins)</option>
              <option value="150">Under 2.5 Hours</option>
              <option value="180">Under 3 Hours</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-slate-200 outline-none focus:border-cyan-500"
            >
              <option value="popularity.desc">Most Popular</option>
              <option value="vote_average.desc">Highest Rated</option>
              <option value="primary_release_date.desc">Release Date (Newest)</option>
              <option value="revenue.desc">Box Office Revenue</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content State */}
      {isLoading ? (
        <LoadingSpinner message="Filtering movie catalog..." />
      ) : error ? (
        <ErrorState
          title="Could Not Filter Movies"
          message={(error as any)?.message || 'Failed to load movies'}
          onRetry={() => refetch()}
        />
      ) : movies.length === 0 ? (
        <EmptyState
          title="No Movies Found"
          description="Try broadening your filter criteria or choosing another industry / language."
          actionLabel="Reset Filters"
          onAction={resetFilters}
        />
      ) : (
        <>
          <MovieGrid movies={movies} />

          {/* Pagination */}
          <div className="flex items-center justify-center space-x-3 pt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition-colors"
            >
              Previous
            </button>

            <span className="text-xs text-slate-400 font-medium">
              Page <strong className="text-slate-200">{page}</strong> of{' '}
              <strong className="text-slate-200">{totalPages}</strong>
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 disabled:opacity-40 hover:bg-slate-800 transition-colors"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function MoviesPage() {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading movie catalog..." />}>
      <MoviesContent />
    </Suspense>
  );
}
