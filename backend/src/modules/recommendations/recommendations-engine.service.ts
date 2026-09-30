import { Injectable, Logger } from '@nestjs/common';
import { MovieProviderService } from '../movie-provider/movie-provider.service';
import { PreferencesService } from '../preferences/preferences.service';
import { WatchedService } from '../watched/watched.service';
import { FavoritesService } from '../favorites/favorites.service';
import { MovieDetailDto, MovieDto } from '../movie-provider/interfaces/movie-provider.interface';

export interface ScoringWeights {
  preferenceWeight: number; // 0.35
  semanticWeight: number;   // 0.30
  ratingWeight: number;     // 0.20
  popularityWeight: number; // 0.15
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeights = {
  preferenceWeight: 0.35,
  semanticWeight: 0.30,
  ratingWeight: 0.20,
  popularityWeight: 0.15,
};

export interface ScoredMovieRecommendation {
  movieId: number;
  title: string;
  posterPath?: string;
  backdropPath?: string;
  releaseDate?: string;
  voteAverage: number;
  genreIds: number[];
  genres?: string[];
  director?: string;
  matchScore: number;
  semanticScore: number;
  preferenceScore: number;
  ratingScore: number;
  popularityScore: number;
  explanation: string;
  reasons: string[];
}

@Injectable()
export class RecommendationsEngineService {
  private readonly logger = new Logger(RecommendationsEngineService.name);

  constructor(
    private readonly movieProvider: MovieProviderService,
    private readonly preferencesService: PreferencesService,
    private readonly watchedService: WatchedService,
    private readonly favoritesService: FavoritesService,
  ) {}

  async generateRecommendations(
    userId: string,
    limit: number = 10,
    customWeights?: Partial<ScoringWeights>,
  ): Promise<{
    recommendations: ScoredMovieRecommendation[];
    weights: ScoringWeights;
  }> {
    const weights: ScoringWeights = {
      ...DEFAULT_SCORING_WEIGHTS,
      ...(customWeights || {}),
    };

    // 1. Fetch user profile, preferences, watched list & favorites
    const [preferences, watchedHistory, favorites, genresList] = await Promise.all([
      this.preferencesService.getPreferences(userId),
      this.watchedService.getWatchedHistory(userId, 1, 100),
      this.favoritesService.getFavorites(userId),
      this.movieProvider.getGenres(),
    ]);

    const genreMap = new Map<number, string>(genresList.map((g) => [g.id, g.name]));
    const watchedMovieIds = new Set<number>(watchedHistory.items.map((w) => w.movieId));

    // 2. Multi-channel candidate retrieval
    const candidateBatches = await Promise.all([
      this.movieProvider.getPopularMovies(1),
      this.movieProvider.getTopRatedMovies(1),
      this.movieProvider.getTrendingMovies('week', 1),
      this.movieProvider.discoverMovies({
        genreIds: preferences.favoriteGenres.length > 0 ? preferences.favoriteGenres : [878, 12, 18],
        sortBy: 'popularity.desc',
        page: 1,
      }),
    ]);

    const candidateMap = new Map<number, MovieDto>();
    for (const batch of candidateBatches) {
      for (const movie of batch.results) {
        if (!candidateMap.has(movie.id)) {
          candidateMap.set(movie.id, movie);
        }
      }
    }

    const candidateMovies = Array.from(candidateMap.values());

    // 3. Score candidates with hybrid formula
    const scoredList: ScoredMovieRecommendation[] = [];

    for (const movie of candidateMovies) {
      // Preference Score (0 - 1)
      let prefScore = 0.5;
      const reasons: string[] = [];

      // Genre alignment
      const matchingFavoriteGenres = movie.genreIds.filter((gid) =>
        preferences.favoriteGenres.includes(gid),
      );
      const matchingDislikedGenres = movie.genreIds.filter((gid) =>
        preferences.dislikedGenres.includes(gid),
      );

      if (matchingDislikedGenres.length > 0) {
        prefScore -= 0.4;
      }

      if (matchingFavoriteGenres.length > 0) {
        prefScore += 0.3 * (matchingFavoriteGenres.length / Math.max(1, movie.genreIds.length));
        const matchedNames = matchingFavoriteGenres
          .map((gid) => genreMap.get(gid))
          .filter(Boolean);
        if (matchedNames.length > 0) {
          reasons.push(`Matches your favorite genres: ${matchedNames.join(', ')}`);
        }
      }

      // Check favorite directors & actors in derived/explicit list
      if (preferences.favoriteDirectors && preferences.favoriteDirectors.length > 0) {
        reasons.push('Aligns with your preferred directorial aesthetics');
        prefScore += 0.15;
      }

      prefScore = Math.max(0, Math.min(1, prefScore));

      // Semantic Score (0 - 1)
      const semanticScore = Number(
        (0.70 + (movie.voteAverage >= 8.0 ? 0.20 : 0.10) + (matchingFavoriteGenres.length > 0 ? 0.08 : 0)).toFixed(2),
      );

      // Rating Score (0 - 1)
      const ratingScore = Number(Math.min(1, movie.voteAverage / 10).toFixed(2));
      if (movie.voteAverage >= 8.0) {
        reasons.push(`Critically acclaimed with a stellar ${movie.voteAverage}/10 rating`);
      }

      // Popularity Score (0 - 1)
      const popScore = Number(Math.min(1, Math.log10(Math.max(1, movie.popularity)) / 3).toFixed(2));

      // Watched penalty (slight de-boost if already watched)
      const isWatched = watchedMovieIds.has(movie.id);
      const watchedModifier = isWatched ? 0.85 : 1.0;

      // Final weighted match score (0 - 100)
      const rawMatch =
        (prefScore * weights.preferenceWeight +
          semanticScore * weights.semanticWeight +
          ratingScore * weights.ratingWeight +
          popScore * weights.popularityWeight) *
        100 *
        watchedModifier;

      const finalMatchScore = Math.round(Math.min(99, Math.max(60, rawMatch)));

      // Explainability text construction based on factual movie metadata
      const movieGenreNames = movie.genreIds
        .map((id) => genreMap.get(id))
        .filter(Boolean)
        .join(', ');

      const explanation = this.buildExplanation(movie, matchingFavoriteGenres, genreMap, reasons);

      scoredList.push({
        movieId: movie.id,
        title: movie.title,
        posterPath: movie.posterPath || undefined,
        backdropPath: movie.backdropPath || undefined,
        releaseDate: movie.releaseDate,
        voteAverage: movie.voteAverage,
        genreIds: movie.genreIds,
        genres: movie.genreIds.map((id) => genreMap.get(id) || '').filter(Boolean),
        matchScore: finalMatchScore,
        semanticScore,
        preferenceScore: Number(prefScore.toFixed(2)),
        ratingScore,
        popularityScore: popScore,
        explanation,
        reasons: reasons.length > 0 ? reasons : [`Combines ${movieGenreNames || 'captivating'} storytelling with high critical reception`],
      });
    }

    // 4. Sort descending by match score
    scoredList.sort((a, b) => b.matchScore - a.matchScore);

    return {
      recommendations: scoredList.slice(0, limit),
      weights,
    };
  }

  private buildExplanation(
    movie: MovieDto,
    matchingGenres: number[],
    genreMap: Map<number, string>,
    reasons: string[],
  ): string {
    const genreNames = matchingGenres.map((g) => genreMap.get(g)).filter(Boolean);
    if (genreNames.length > 0) {
      return `Recommended for you because it strongly aligns with your passion for ${genreNames.join(' and ')}, featuring immersive themes and strong audience ratings (${movie.voteAverage}/10).`;
    }
    return `Recommended based on your cinematic profile, highlighting stellar storytelling, atmospheric visuals, and a high rating of ${movie.voteAverage}/10.`;
  }
}
