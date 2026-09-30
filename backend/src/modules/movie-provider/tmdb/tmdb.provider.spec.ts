import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TmdbMovieProvider } from './tmdb.provider';

describe('TmdbMovieProvider', () => {
  let provider: TmdbMovieProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TmdbMovieProvider,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultValue: any) => defaultValue),
          },
        },
      ],
    }).compile();

    provider = module.get<TmdbMovieProvider>(TmdbMovieProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  it('should return trending movies with proper attributes', async () => {
    const result = await provider.getTrendingMovies('week', 1);
    expect(result).toHaveProperty('results');
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results[0]).toHaveProperty('title');
    expect(result.results[0]).toHaveProperty('voteAverage');
  });

  it('should search movies and filter appropriately', async () => {
    const result = await provider.searchMovies('Interstellar');
    expect(result.results).toBeDefined();
    expect(result.results.some((m) => m.title.includes('Interstellar'))).toBe(true);
  });

  it('should return movie details with credits structure', async () => {
    const movie = await provider.getMovieDetails(157336);
    expect(movie).toBeDefined();
    expect(movie?.title).toBe('Interstellar');
    expect(movie?.runtime).toBeGreaterThan(0);
  });
});
