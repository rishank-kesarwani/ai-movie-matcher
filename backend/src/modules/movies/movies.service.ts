import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { MovieProviderService } from '../movie-provider/movie-provider.service';
import { RedisService } from '../redis/redis.service';
import {
  MovieDetailDto,
  MovieCreditsDto,
  GenreDto,
  MovieSearchFilterDto,
  PaginatedMovieResultDto,
} from '../movie-provider/interfaces/movie-provider.interface';
import * as crypto from 'crypto';

@Injectable()
export class MoviesService {
  private readonly logger = new Logger(MoviesService.name);

  constructor(
    private readonly movieProvider: MovieProviderService,
    private readonly redisService: RedisService,
  ) {}

  async getTrending(
    timeWindow: 'day' | 'week' = 'week',
    page: number = 1,
  ): Promise<PaginatedMovieResultDto> {
    const cacheKey = `movie:trending:${timeWindow}:${page}`;
    const cached = await this.redisService.get<PaginatedMovieResultDto>(cacheKey);
    if (cached) return cached;

    const result = await this.movieProvider.getTrendingMovies(timeWindow, page);
    await this.redisService.set(cacheKey, result, 3600); // 1 hour TTL
    return result;
  }

  async getPopular(page: number = 1): Promise<PaginatedMovieResultDto> {
    const cacheKey = `movie:popular:${page}`;
    const cached = await this.redisService.get<PaginatedMovieResultDto>(cacheKey);
    if (cached) return cached;

    const result = await this.movieProvider.getPopularMovies(page);
    await this.redisService.set(cacheKey, result, 3600); // 1 hour TTL
    return result;
  }

  async getTopRated(page: number = 1): Promise<PaginatedMovieResultDto> {
    const cacheKey = `movie:top_rated:${page}`;
    const cached = await this.redisService.get<PaginatedMovieResultDto>(cacheKey);
    if (cached) return cached;

    const result = await this.movieProvider.getTopRatedMovies(page);
    await this.redisService.set(cacheKey, result, 21600); // 6 hours TTL
    return result;
  }

  async getUpcoming(page: number = 1): Promise<PaginatedMovieResultDto> {
    const cacheKey = `movie:upcoming:${page}`;
    const cached = await this.redisService.get<PaginatedMovieResultDto>(cacheKey);
    if (cached) return cached;

    const result = await this.movieProvider.getUpcomingMovies(page);
    await this.redisService.set(cacheKey, result, 21600); // 6 hours TTL
    return result;
  }

  async getMovieDetails(movieId: number): Promise<MovieDetailDto> {
    const cacheKey = `movie:details:${movieId}`;
    const cached = await this.redisService.get<MovieDetailDto>(cacheKey);
    if (cached) return cached;

    const movie = await this.movieProvider.getMovieDetails(movieId);
    if (!movie) {
      throw new NotFoundException(`Movie with ID ${movieId} not found`);
    }

    await this.redisService.set(cacheKey, movie, 43200); // 12 hours TTL
    return movie;
  }

  async getMovieCredits(movieId: number): Promise<MovieCreditsDto> {
    const cacheKey = `movie:credits:${movieId}`;
    const cached = await this.redisService.get<MovieCreditsDto>(cacheKey);
    if (cached) return cached;

    const credits = await this.movieProvider.getMovieCredits(movieId);
    await this.redisService.set(cacheKey, credits, 43200); // 12 hours TTL
    return credits;
  }

  async getSimilarMovies(
    movieId: number,
    page: number = 1,
  ): Promise<PaginatedMovieResultDto> {
    const cacheKey = `movie:similar:${movieId}:${page}`;
    const cached = await this.redisService.get<PaginatedMovieResultDto>(cacheKey);
    if (cached) return cached;

    const result = await this.movieProvider.getSimilarMovies(movieId, page);
    await this.redisService.set(cacheKey, result, 14400); // 4 hours TTL
    return result;
  }

  async searchMovies(
    query: string,
    filter?: MovieSearchFilterDto,
  ): Promise<PaginatedMovieResultDto> {
    const hash = crypto
      .createHash('md5')
      .update(`${query}_${JSON.stringify(filter || {})}`)
      .digest('hex');
    const cacheKey = `movie:search:${hash}`;

    const cached = await this.redisService.get<PaginatedMovieResultDto>(cacheKey);
    if (cached) return cached;

    const result = await this.movieProvider.searchMovies(query, filter);
    await this.redisService.set(cacheKey, result, 1800); // 30 mins TTL
    return result;
  }

  async discoverMovies(
    filter: MovieSearchFilterDto,
  ): Promise<PaginatedMovieResultDto> {
    const hash = crypto
      .createHash('md5')
      .update(`discover_${JSON.stringify(filter || {})}`)
      .digest('hex');
    const cacheKey = `movie:discover:${hash}`;

    const cached = await this.redisService.get<PaginatedMovieResultDto>(cacheKey);
    if (cached) return cached;

    const result = await this.movieProvider.discoverMovies(filter);
    await this.redisService.set(cacheKey, result, 1800); // 30 mins TTL
    return result;
  }

  async getGenres(): Promise<GenreDto[]> {
    const cacheKey = 'movie:genres';
    const cached = await this.redisService.get<GenreDto[]>(cacheKey);
    if (cached) return cached;

    const genres = await this.movieProvider.getGenres();
    await this.redisService.set(cacheKey, genres, 86400); // 24 hours TTL
    return genres;
  }
}
