export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: 'USER' | 'ADMIN';
  notificationPreferences?: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    weeklyDigest: boolean;
    movieReleases: boolean;
    recommendationAlerts: boolean;
  };
  createdAt?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface Genre {
  id: number;
  name: string;
}

export interface WatchProviderItem {
  providerId: number;
  providerName: string;
  logoPath?: string | null;
  displayPriority?: number;
}

export interface WatchProviders {
  link?: string;
  flatrate?: WatchProviderItem[]; // Streaming (Netflix, Prime Video, Disney+ Hotstar, JioCinema, etc.)
  free?: WatchProviderItem[];     // Free / Ad-supported streaming
  rent?: WatchProviderItem[];     // Rental platforms
  buy?: WatchProviderItem[];      // Purchase platforms
}

export interface Movie {
  id: number;
  title: string;
  originalTitle?: string;
  overview: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  releaseDate?: string;
  voteAverage: number;
  voteCount: number;
  popularity: number;
  genreIds: number[];
  genres?: Genre[];
  runtime?: number;
  tagline?: string;
  status?: string;
  director?: string;
  castMembers?: string[];
  credits?: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profilePath?: string | null;
    }>;
    crew: Array<{
      id: number;
      name: string;
      job: string;
    }>;
  };
  videos?: Array<{
    id: string;
    key: string;
    name: string;
    site: string;
    type: string;
  }>;
  watchProviders?: WatchProviders;
}

export interface WatchlistItem {
  _id: string;
  userId: string;
  movieId: number;
  title: string;
  posterPath?: string;
  backdropPath?: string;
  voteAverage: number;
  releaseDate?: string;
  genreIds: number[];
  status: 'PLAN_TO_WATCH' | 'WATCHING' | 'COMPLETED' | 'DROPPED';
  notes?: string;
  createdAt: string;
}

export interface WatchedMovie {
  _id: string;
  userId: string;
  movieId: number;
  title: string;
  posterPath?: string;
  backdropPath?: string;
  userRating?: number;
  review?: string;
  genreIds: number[];
  watchedAt: string;
}

export interface MovieRating {
  _id: string;
  userId: string;
  movieId: number;
  title: string;
  rating: number;
  review?: string;
  updatedAt: string;
}

export interface FavoriteItem {
  _id: string;
  userId: string;
  type: 'MOVIE' | 'GENRE' | 'ACTOR' | 'DIRECTOR';
  itemId: string;
  name: string;
  imagePath?: string;
  metadata?: string;
  createdAt: string;
}

export interface ScoredRecommendation {
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
  semanticScore?: number;
  preferenceScore?: number;
  ratingScore?: number;
  popularityScore?: number;
  explanation: string;
  reasons: string[];
}

export interface UserPreference {
  userId: string;
  favoriteGenres: number[];
  dislikedGenres: number[];
  favoriteDirectors: string[];
  favoriteActors: string[];
  preferredLanguages: string[];
  preferredReleasePeriod: {
    minYear?: number;
    maxYear?: number;
  };
  preferredRuntime: {
    min?: number;
    max?: number;
  };
  minimumRating: number;
  tasteSummary?: string;
}

export interface ChatMessage {
  id?: string;
  role: 'system' | 'user' | 'assistant';
  content: string;
  suggestedMovies?: Array<{
    id?: number;
    title: string;
    tmdbId?: number;
    year?: number;
    posterPath?: string;
    voteAverage?: number;
    matchReason: string;
  }>;
  enrichedMovies?: Movie[];
  timestamp?: string;
}

export interface ApiError {
  success: false;
  statusCode: number;
  code: string;
  message: string;
  errors?: any;
  path: string;
  timestamp: string;
  requestId?: string;
}
