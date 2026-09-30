import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationsEngineService } from './recommendations-engine.service';
import { MovieProviderService } from '../movie-provider/movie-provider.service';
import { PreferencesService } from '../preferences/preferences.service';
import { WatchedService } from '../watched/watched.service';
import { FavoritesService } from '../favorites/favorites.service';

describe('RecommendationsEngineService', () => {
  let service: RecommendationsEngineService;

  const mockPreferences = {
    favoriteGenres: [878, 12],
    dislikedGenres: [27],
    favoriteDirectors: ['Denis Villeneuve'],
    favoriteActors: ['Leonardo DiCaprio'],
  };

  const mockCandidateMovie = {
    id: 157336,
    title: 'Interstellar',
    overview: 'Space journey across wormhole',
    posterPath: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdropPath: '/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    releaseDate: '2014-11-05',
    voteAverage: 8.4,
    voteCount: 34000,
    popularity: 145,
    genreIds: [878, 12, 18],
  };

  beforeEach(async () => {
    const movieProviderMock = {
      getPopularMovies: jest.fn().mockResolvedValue({ results: [mockCandidateMovie] }),
      getTopRatedMovies: jest.fn().mockResolvedValue({ results: [mockCandidateMovie] }),
      getTrendingMovies: jest.fn().mockResolvedValue({ results: [mockCandidateMovie] }),
      discoverMovies: jest.fn().mockResolvedValue({ results: [mockCandidateMovie] }),
      getGenres: jest.fn().mockResolvedValue([
        { id: 878, name: 'Science Fiction' },
        { id: 12, name: 'Adventure' },
        { id: 18, name: 'Drama' },
      ]),
    };

    const preferencesServiceMock = {
      getPreferences: jest.fn().mockResolvedValue(mockPreferences),
    };

    const watchedServiceMock = {
      getWatchedHistory: jest.fn().mockResolvedValue({ items: [] }),
    };

    const favoritesServiceMock = {
      getFavorites: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationsEngineService,
        { provide: MovieProviderService, useValue: movieProviderMock },
        { provide: PreferencesService, useValue: preferencesServiceMock },
        { provide: WatchedService, useValue: watchedServiceMock },
        { provide: FavoritesService, useValue: favoritesServiceMock },
      ],
    }).compile();

    service = module.get<RecommendationsEngineService>(
      RecommendationsEngineService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should generate recommendations with score breakdown and explainable reasons', async () => {
    const result = await service.generateRecommendations('usr_123', 5);
    expect(result.recommendations).toBeDefined();
    expect(result.recommendations.length).toBeGreaterThan(0);

    const firstRec = result.recommendations[0];
    expect(firstRec.matchScore).toBeGreaterThanOrEqual(60);
    expect(firstRec.explanation).toBeDefined();
    expect(firstRec.reasons.length).toBeGreaterThan(0);
    expect(firstRec).toHaveProperty('semanticScore');
    expect(firstRec).toHaveProperty('preferenceScore');
    expect(firstRec).toHaveProperty('ratingScore');
    expect(firstRec).toHaveProperty('popularityScore');
  });
});
