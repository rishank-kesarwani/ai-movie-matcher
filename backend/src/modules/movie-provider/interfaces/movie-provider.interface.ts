export interface GenreDto {
  id: number;
  name: string;
}

export interface CastMemberDto {
  id: number;
  name: string;
  character: string;
  profilePath?: string | null;
  order: number;
}

export interface CrewMemberDto {
  id: number;
  name: string;
  job: string;
  department: string;
  profilePath?: string | null;
}

export interface MovieCreditsDto {
  cast: CastMemberDto[];
  crew: CrewMemberDto[];
  director?: CrewMemberDto | null;
}

export interface VideoDto {
  id: string;
  key: string;
  name: string;
  site: string;
  type: string;
  official: boolean;
}

export interface MovieDto {
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
  genres?: GenreDto[];
  originalLanguage?: string;
  adult?: boolean;
}

export interface MovieDetailDto extends MovieDto {
  runtime?: number;
  tagline?: string;
  status?: string;
  budget?: number;
  revenue?: number;
  spokenLanguages?: Array<{ iso_639_1: string; name: string }>;
  credits?: MovieCreditsDto;
  videos?: VideoDto[];
  director?: string;
  castMembers?: string[];
  imdbId?: string;
}

export interface MovieSearchFilterDto {
  query?: string;
  genreId?: number;
  genreIds?: number[];
  year?: number;
  minRating?: number;
  maxRuntime?: number;
  withOriginalLanguage?: string; // e.g. 'hi', 'te', 'ta', 'ko', 'ja', 'es', 'fr', 'en'
  region?: string;               // e.g. 'IN', 'US', 'KR', 'JP'
  sortBy?:
    | 'popularity.desc'
    | 'vote_average.desc'
    | 'primary_release_date.desc'
    | 'revenue.desc';
  page?: number;
  limit?: number;
}

export interface PaginatedMovieResultDto {
  page: number;
  totalPages: number;
  totalResults: number;
  results: MovieDto[];
}

export interface MovieProvider {
  searchMovies(
    query: string,
    filter?: MovieSearchFilterDto,
  ): Promise<PaginatedMovieResultDto>;
  getMovieDetails(movieId: number): Promise<MovieDetailDto | null>;
  getMovieCredits(movieId: number): Promise<MovieCreditsDto>;
  getSimilarMovies(
    movieId: number,
    page?: number,
  ): Promise<PaginatedMovieResultDto>;
  getTrendingMovies(
    timeWindow?: 'day' | 'week',
    page?: number,
    region?: string,
  ): Promise<PaginatedMovieResultDto>;
  getPopularMovies(
    page?: number,
    region?: string,
  ): Promise<PaginatedMovieResultDto>;
  getTopRatedMovies(page?: number): Promise<PaginatedMovieResultDto>;
  getUpcomingMovies(
    page?: number,
    region?: string,
  ): Promise<PaginatedMovieResultDto>;
  discoverMovies(
    filter: MovieSearchFilterDto,
  ): Promise<PaginatedMovieResultDto>;
  getGenres(): Promise<GenreDto[]>;
}
