import { Test, TestingModule } from '@nestjs/testing';
import { MoviesService } from './movies.service';
import { MovieProviderService } from '../movie-provider/movie-provider.service';
import { RedisService } from '../redis/redis.service';

describe('MoviesService', () => {
  let service: MoviesService;
  let movieProvider: Partial<MovieProviderService>;
  let redisService: Partial<RedisService>;

  const mockMovie = {
    id: 157336,
    title: 'Interstellar',
    overview: 'Space adventure',
    voteAverage: 8.4,
    voteCount: 30000,
    popularity: 150,
    genreIds: [878, 12],
    runtime: 169,
  };

  beforeEach(async () => {
    movieProvider = {
      getTrendingMovies: jest.fn().mockResolvedValue({
        page: 1,
        totalPages: 1,
        totalResults: 1,
        results: [mockMovie],
      }),
      getMovieDetails: jest.fn().mockResolvedValue(mockMovie),
    };

    redisService = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        { provide: MovieProviderService, useValue: movieProvider },
        { provide: RedisService, useValue: redisService },
      ],
    }).compile();

    service = module.get<MoviesService>(MoviesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should get trending movies, querying provider and writing to Redis cache', async () => {
    const result = await service.getTrending('week', 1);
    expect(result.results.length).toBe(1);
    expect(movieProvider.getTrendingMovies).toHaveBeenCalledWith('week', 1);
    expect(redisService.set).toHaveBeenCalled();
  });

  it('should return cached result if Redis cache hits', async () => {
    (redisService.get as jest.Mock).mockResolvedValue({
      page: 1,
      totalPages: 1,
      totalResults: 1,
      results: [mockMovie],
    });

    const result = await service.getTrending('week', 1);
    expect(result.results.length).toBe(1);
    expect(movieProvider.getTrendingMovies).not.toHaveBeenCalled();
  });
});
