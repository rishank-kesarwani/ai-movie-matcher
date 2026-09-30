import { Injectable, Logger } from '@nestjs/common';
import {
  MovieProvider,
  MovieDetailDto,
  MovieCreditsDto,
  GenreDto,
  MovieSearchFilterDto,
  PaginatedMovieResultDto,
} from './interfaces/movie-provider.interface';
import { TmdbMovieProvider } from './tmdb/tmdb.provider';

@Injectable()
export class MovieProviderService implements MovieProvider {
  private readonly logger = new Logger(MovieProviderService.name);
  private provider: MovieProvider;

  constructor(private readonly tmdbProvider: TmdbMovieProvider) {
    // Current primary provider is TMDB, easily swappable
    this.provider = this.tmdbProvider;
  }

  setProvider(provider: MovieProvider) {
    this.provider = provider;
  }

  async searchMovies(
    query: string,
    filter?: MovieSearchFilterDto,
  ): Promise<PaginatedMovieResultDto> {
    return this.provider.searchMovies(query, filter);
  }

  async getMovieDetails(movieId: number): Promise<MovieDetailDto | null> {
    return this.provider.getMovieDetails(movieId);
  }

  async getMovieCredits(movieId: number): Promise<MovieCreditsDto> {
    return this.provider.getMovieCredits(movieId);
  }

  async getSimilarMovies(
    movieId: number,
    page?: number,
  ): Promise<PaginatedMovieResultDto> {
    return this.provider.getSimilarMovies(movieId, page);
  }

  async getTrendingMovies(
    timeWindow?: 'day' | 'week',
    page?: number,
  ): Promise<PaginatedMovieResultDto> {
    return this.provider.getTrendingMovies(timeWindow, page);
  }

  async getPopularMovies(page?: number): Promise<PaginatedMovieResultDto> {
    return this.provider.getPopularMovies(page);
  }

  async getTopRatedMovies(page?: number): Promise<PaginatedMovieResultDto> {
    return this.provider.getTopRatedMovies(page);
  }

  async getUpcomingMovies(page?: number): Promise<PaginatedMovieResultDto> {
    return this.provider.getUpcomingMovies(page);
  }

  async discoverMovies(
    filter: MovieSearchFilterDto,
  ): Promise<PaginatedMovieResultDto> {
    return this.provider.discoverMovies(filter);
  }

  async getGenres(): Promise<GenreDto[]> {
    return this.provider.getGenres();
  }
}
