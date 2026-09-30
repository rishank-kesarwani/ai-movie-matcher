import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import {
  MovieProvider,
  MovieDto,
  MovieDetailDto,
  MovieCreditsDto,
  GenreDto,
  MovieSearchFilterDto,
  PaginatedMovieResultDto,
} from '../interfaces/movie-provider.interface';

// Curated high-fidelity fallback dataset for offline resilience, testing, and dev without TMDB keys
const FALLBACK_GENRES: GenreDto[] = [
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 99, name: 'Documentary' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Science Fiction' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' },
];

const FALLBACK_MOVIES: MovieDetailDto[] = [
  {
    id: 157336,
    title: 'Interstellar',
    originalTitle: 'Interstellar',
    overview:
      'The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.',
    posterPath: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    backdropPath: '/xJHokMbljvjADYdit5fK5VQsXEG.jpg',
    releaseDate: '2014-11-05',
    voteAverage: 8.4,
    voteCount: 34500,
    popularity: 145.8,
    genreIds: [12, 18, 878],
    genres: [
      { id: 12, name: 'Adventure' },
      { id: 18, name: 'Drama' },
      { id: 878, name: 'Science Fiction' },
    ],
    runtime: 169,
    tagline: 'Mankind was born on Earth. It was never meant to die here.',
    status: 'Released',
    director: 'Christopher Nolan',
    castMembers: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
    credits: {
      cast: [
        { id: 10297, name: 'Matthew McConaughey', character: 'Joseph Cooper', order: 0 },
        { id: 1813, name: 'Anne Hathaway', character: 'Dr. Amelia Brand', order: 1 },
        { id: 83002, name: 'Jessica Chastain', character: 'Murphy Cooper', order: 2 },
      ],
      crew: [{ id: 525, name: 'Christopher Nolan', job: 'Director', department: 'Directing' }],
      director: { id: 525, name: 'Christopher Nolan', job: 'Director', department: 'Directing' },
    },
  },
  {
    id: 27205,
    title: 'Inception',
    originalTitle: 'Inception',
    overview:
      'Cobb, a skilled thief who commits corporate espionage by infiltrating the subconscious of his targets is offered a chance to regain his old life as payment for a task considered to be impossible: "inception", the implantation of another person\'s idea into a target\'s subconscious.',
    posterPath: '/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    backdropPath: '/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg',
    releaseDate: '2010-07-15',
    voteAverage: 8.36,
    voteCount: 35800,
    popularity: 132.4,
    genreIds: [28, 12, 878],
    genres: [
      { id: 28, name: 'Action' },
      { id: 12, name: 'Adventure' },
      { id: 878, name: 'Science Fiction' },
    ],
    runtime: 148,
    tagline: 'Your mind is the scene of the crime.',
    status: 'Released',
    director: 'Christopher Nolan',
    castMembers: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Elliot Page', 'Tom Hardy'],
  },
  {
    id: 693134,
    title: 'Dune: Part Two',
    originalTitle: 'Dune: Part Two',
    overview:
      'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family. Facing a choice between the love of his life and the fate of the universe, he endeavors to prevent a terrible future only he can foresee.',
    posterPath: '/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg',
    backdropPath: '/xOMo8BRK7PfcJv9JCnx7s5200fr.jpg',
    releaseDate: '2024-02-27',
    voteAverage: 8.18,
    voteCount: 5200,
    popularity: 210.5,
    genreIds: [878, 12],
    genres: [
      { id: 878, name: 'Science Fiction' },
      { id: 12, name: 'Adventure' },
    ],
    runtime: 166,
    tagline: 'Long live the fighters.',
    status: 'Released',
    director: 'Denis Villeneuve',
    castMembers: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem'],
  },
  {
    id: 335984,
    title: 'Blade Runner 2049',
    originalTitle: 'Blade Runner 2049',
    overview:
      'Thirty years after the events of the first film, a new blade runner, LAPD Officer K, unearths a long-buried secret that has the potential to plunge what\'s left of society into chaos. K\'s discovery leads him on a quest to find Rick Deckard, a former LAPD blade runner who has been missing for 30 years.',
    posterPath: '/gajva2L0rPYkEWjzgFlBXCAVBE5.jpg',
    backdropPath: '/sAtoMqDVhNDQBc3QJL3RF6hlxGq.jpg',
    releaseDate: '2017-10-04',
    voteAverage: 8.0,
    voteCount: 13200,
    popularity: 98.2,
    genreIds: [878, 18, 9648],
    genres: [
      { id: 878, name: 'Science Fiction' },
      { id: 18, name: 'Drama' },
      { id: 9648, name: 'Mystery' },
    ],
    runtime: 164,
    tagline: 'The key to the future is finally unearthed.',
    status: 'Released',
    director: 'Denis Villeneuve',
    castMembers: ['Ryan Gosling', 'Harrison Ford', 'Ana de Armas', 'Sylvia Hoeks'],
  },
  {
    id: 329865,
    title: 'Arrival',
    originalTitle: 'Arrival',
    overview:
      'Taking place after alien spacecraft touch down across the globe, an elite team is put together to investigate, including language professor Louise Banks, who is tasked with interpreting the language of the apparent peace-seeking alien visitors.',
    posterPath: '/x2O0hv9t4qMvE6Q1Qz3kK2V7d9P.jpg',
    backdropPath: '/yNsA0fO3hY0hZ3G2sJ6t7V9x1.jpg',
    releaseDate: '2016-11-10',
    voteAverage: 7.9,
    voteCount: 17100,
    popularity: 88.6,
    genreIds: [18, 878, 9648],
    genres: [
      { id: 18, name: 'Drama' },
      { id: 878, name: 'Science Fiction' },
      { id: 9648, name: 'Mystery' },
    ],
    runtime: 116,
    tagline: 'Why are they here?',
    status: 'Released',
    director: 'Denis Villeneuve',
    castMembers: ['Amy Adams', 'Jeremy Renner', 'Forest Whitaker', 'Michael Stuhlbarg'],
  },
  {
    id: 545611,
    title: 'Everything Everywhere All at Once',
    originalTitle: 'Everything Everywhere All at Once',
    overview:
      'An aging Chinese immigrant is swept up in an insane adventure, where she alone can save what\'s important to her by connecting with the lives she could have led in other universes.',
    posterPath: '/w3LxiVYPq6ABG8dwsm7H84R6L3B.jpg',
    backdropPath: '/fOy2Jurz9larw4UVl0607nL37mG.jpg',
    releaseDate: '2022-03-24',
    voteAverage: 7.82,
    voteCount: 6100,
    popularity: 94.7,
    genreIds: [28, 12, 878],
    genres: [
      { id: 28, name: 'Action' },
      { id: 12, name: 'Adventure' },
      { id: 878, name: 'Science Fiction' },
    ],
    runtime: 139,
    tagline: 'The universe is so much bigger than you realize.',
    status: 'Released',
    director: 'Daniel Kwan, Daniel Scheinert',
    castMembers: ['Michelle Yeoh', 'Ke Huy Quan', 'Stephanie Hsu', 'Jamie Lee Curtis'],
  },
  {
    id: 872585,
    title: 'Oppenheimer',
    originalTitle: 'Oppenheimer',
    overview:
      'The story of J. Robert Oppenheimer’s role in the development of the atomic bomb during World War II.',
    posterPath: '/8Gxv8gSFCU0XGDykEGv7zR1n2ua.jpg',
    backdropPath: '/rLb2cwF3Pazuxaj0sRXQ037tGI1.jpg',
    releaseDate: '2023-07-19',
    voteAverage: 8.09,
    voteCount: 8900,
    popularity: 180.2,
    genreIds: [18, 36],
    genres: [
      { id: 18, name: 'Drama' },
      { id: 36, name: 'History' },
    ],
    runtime: 181,
    tagline: 'The world forever changes.',
    status: 'Released',
    director: 'Christopher Nolan',
    castMembers: ['Cillian Murphy', 'Emily Blunt', 'Matt Damon', 'Robert Downey Jr.'],
  },
  {
    id: 496243,
    title: 'Parasite',
    originalTitle: '기생충',
    overview:
      'All unemployed, Ki-taek\'s family takes peculiar interest in the wealthy and glamorous Parks for their livelihood until they get entangled in an unexpected incident.',
    posterPath: '/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    backdropPath: '/hiKmpZMGZsrkA3cdce8a7Dpos1j.jpg',
    releaseDate: '2019-05-30',
    voteAverage: 8.5,
    voteCount: 17800,
    popularity: 110.3,
    genreIds: [35, 53, 18],
    genres: [
      { id: 35, name: 'Comedy' },
      { id: 53, name: 'Thriller' },
      { id: 18, name: 'Drama' },
    ],
    runtime: 133,
    tagline: 'Act like you own the place.',
    status: 'Released',
    director: 'Bong Joon-ho',
    castMembers: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong', 'Choi Woo-shik'],
  },
  {
    id: 155,
    title: 'The Dark Knight',
    originalTitle: 'The Dark Knight',
    overview:
      'Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets. The partnership proves to be effective, but they soon find themselves prey to a reign of chaos unleashed by a rising criminal mastermind known to the terrified citizens of Gotham as the Joker.',
    posterPath: '/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    backdropPath: '/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg',
    releaseDate: '2008-07-16',
    voteAverage: 8.51,
    voteCount: 32000,
    popularity: 130.0,
    genreIds: [18, 28, 80, 53],
    genres: [
      { id: 18, name: 'Drama' },
      { id: 28, name: 'Action' },
      { id: 80, name: 'Crime' },
      { id: 53, name: 'Thriller' },
    ],
    runtime: 152,
    tagline: 'Why So Serious?',
    status: 'Released',
    director: 'Christopher Nolan',
    castMembers: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart', 'Michael Caine'],
  },
  {
    id: 129,
    title: 'Spirited Away',
    originalTitle: '千と千尋の神隠し',
    overview:
      'A young girl, Chihiro, becomes trapped in a strange new world of spirits. When her parents undergo a mysterious transformation, she must call upon the courage she never knew she had to free her family.',
    posterPath: '/39wmItIWsg5sZMyRUHLkWBcuVCM.jpg',
    backdropPath: '/mSDsSDwaP3E7dEfUPWy4J0djt4O.jpg',
    releaseDate: '2001-07-20',
    voteAverage: 8.54,
    voteCount: 16000,
    popularity: 105.1,
    genreIds: [16, 10751, 14],
    genres: [
      { id: 16, name: 'Animation' },
      { id: 10751, name: 'Family' },
      { id: 14, name: 'Fantasy' },
    ],
    runtime: 125,
    tagline: 'Nothing that happens is ever forgotten.',
    status: 'Released',
    director: 'Hayao Miyazaki',
    castMembers: ['Rumi Hiiragi', 'Miyu Irino', 'Mari Natsuki', 'Takashi Naito'],
  },
];

@Injectable()
export class TmdbMovieProvider implements MovieProvider {
  private readonly logger = new Logger(TmdbMovieProvider.name);
  private readonly client: AxiosInstance;
  private readonly baseUrl: string;
  private readonly accessToken: string;
  private readonly apiKey: string;
  private readonly hasValidCredentials: boolean;

  constructor(private readonly configService: ConfigService) {
    this.baseUrl = this.configService.get<string>(
      'tmdb.baseUrl',
      'https://api.themoviedb.org/3',
    );
    this.accessToken = this.configService.get<string>('tmdb.accessToken', '');
    this.apiKey = this.configService.get<string>('tmdb.apiKey', '');

    this.hasValidCredentials = Boolean(
      (this.accessToken && this.accessToken.length > 20) ||
      (this.apiKey && this.apiKey.length > 10),
    );

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    if (this.accessToken && this.accessToken.length > 20) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers,
    });
  }

  private mapTmdbMovieToDto(tmdbMovie: any): MovieDto {
    return {
      id: tmdbMovie.id,
      title: tmdbMovie.title || tmdbMovie.name || 'Untitled',
      originalTitle: tmdbMovie.original_title || tmdbMovie.original_name,
      overview: tmdbMovie.overview || '',
      posterPath: tmdbMovie.poster_path,
      backdropPath: tmdbMovie.backdrop_path,
      releaseDate: tmdbMovie.release_date || tmdbMovie.first_air_date || '',
      voteAverage: Number((tmdbMovie.vote_average || 0).toFixed(1)),
      voteCount: tmdbMovie.vote_count || 0,
      popularity: Number((tmdbMovie.popularity || 0).toFixed(1)),
      genreIds: tmdbMovie.genre_ids || (tmdbMovie.genres?.map((g: any) => g.id) || []),
      genres: tmdbMovie.genres || [],
      adult: tmdbMovie.adult || false,
    };
  }

  async searchMovies(
    query: string,
    filter?: MovieSearchFilterDto,
  ): Promise<PaginatedMovieResultDto> {
    const page = filter?.page || 1;
    if (!this.hasValidCredentials) {
      const filtered = FALLBACK_MOVIES.filter(
        (m) =>
          m.title.toLowerCase().includes(query.toLowerCase()) ||
          m.overview.toLowerCase().includes(query.toLowerCase()),
      );
      return {
        page: 1,
        totalPages: 1,
        totalResults: filtered.length,
        results: filtered,
      };
    }

    try {
      const params: Record<string, any> = {
        query,
        page,
        include_adult: false,
      };
      if (filter?.year) {
        params.primary_release_year = filter.year;
      }
      if (this.apiKey && !this.accessToken) {
        params.api_key = this.apiKey;
      }

      const response = await this.client.get('/search/movie', { params });
      return {
        page: response.data.page || 1,
        totalPages: response.data.total_pages || 1,
        totalResults: response.data.total_results || 0,
        results: (response.data.results || []).map((m: any) =>
          this.mapTmdbMovieToDto(m),
        ),
      };
    } catch (err: any) {
      this.logger.warn(`TMDB search failed (${err.message}). Using fallback search.`);
      const filtered = FALLBACK_MOVIES.filter((m) =>
        m.title.toLowerCase().includes(query.toLowerCase()),
      );
      return {
        page: 1,
        totalPages: 1,
        totalResults: filtered.length,
        results: filtered,
      };
    }
  }

  async getMovieDetails(movieId: number): Promise<MovieDetailDto | null> {
    if (!this.hasValidCredentials) {
      const fallback = FALLBACK_MOVIES.find((m) => m.id === movieId);
      return fallback || FALLBACK_MOVIES[0];
    }

    try {
      const params: Record<string, any> = {
        append_to_response: 'credits,videos,similar',
      };
      if (this.apiKey && !this.accessToken) {
        params.api_key = this.apiKey;
      }

      const response = await this.client.get(`/movie/${movieId}`, { params });
      const data = response.data;
      const baseMovie = this.mapTmdbMovieToDto(data);

      const cast: any[] = (data.credits?.cast || []).slice(0, 15).map((c: any) => ({
        id: c.id,
        name: c.name,
        character: c.character || '',
        profilePath: c.profile_path,
        order: c.order,
      }));

      const crew: any[] = (data.credits?.crew || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        job: c.job || '',
        department: c.department || '',
        profilePath: c.profile_path,
      }));

      const directorObj = crew.find((c) => c.job === 'Director') || null;

      const videos: any[] = (data.videos?.results || []).map((v: any) => ({
        id: v.id,
        key: v.key,
        name: v.name,
        site: v.site,
        type: v.type,
        official: v.official,
      }));

      return {
        ...baseMovie,
        runtime: data.runtime,
        tagline: data.tagline,
        status: data.status,
        budget: data.budget,
        revenue: data.revenue,
        spokenLanguages: data.spoken_languages,
        genres: data.genres || [],
        director: directorObj?.name || undefined,
        castMembers: cast.slice(0, 5).map((c) => c.name),
        credits: {
          cast,
          crew,
          director: directorObj,
        },
        videos,
        imdbId: data.imdb_id,
      };
    } catch (err: any) {
      this.logger.warn(
        `TMDB getMovieDetails failed for ${movieId} (${err.message}). Returning fallback movie.`,
      );
      const fallback = FALLBACK_MOVIES.find((m) => m.id === movieId);
      return fallback || FALLBACK_MOVIES[0];
    }
  }

  async getMovieCredits(movieId: number): Promise<MovieCreditsDto> {
    if (!this.hasValidCredentials) {
      const fallback = FALLBACK_MOVIES.find((m) => m.id === movieId);
      return fallback?.credits || { cast: [], crew: [], director: null };
    }

    try {
      const params: Record<string, any> = {};
      if (this.apiKey && !this.accessToken) params.api_key = this.apiKey;

      const response = await this.client.get(`/movie/${movieId}/credits`, { params });
      const data = response.data;

      const cast = (data.cast || []).slice(0, 15).map((c: any) => ({
        id: c.id,
        name: c.name,
        character: c.character || '',
        profilePath: c.profile_path,
        order: c.order,
      }));

      const crew = (data.crew || []).map((c: any) => ({
        id: c.id,
        name: c.name,
        job: c.job || '',
        department: c.department || '',
        profilePath: c.profile_path,
      }));

      const director = crew.find((c: any) => c.job === 'Director') || null;

      return { cast, crew, director };
    } catch (err: any) {
      this.logger.warn(`TMDB credits failed for ${movieId} (${err.message})`);
      return { cast: [], crew: [], director: null };
    }
  }

  async getSimilarMovies(
    movieId: number,
    page: number = 1,
  ): Promise<PaginatedMovieResultDto> {
    if (!this.hasValidCredentials) {
      const filtered = FALLBACK_MOVIES.filter((m) => m.id !== movieId);
      return {
        page: 1,
        totalPages: 1,
        totalResults: filtered.length,
        results: filtered,
      };
    }

    try {
      const params: Record<string, any> = { page };
      if (this.apiKey && !this.accessToken) params.api_key = this.apiKey;

      const response = await this.client.get(`/movie/${movieId}/similar`, { params });
      return {
        page: response.data.page || 1,
        totalPages: response.data.total_pages || 1,
        totalResults: response.data.total_results || 0,
        results: (response.data.results || []).map((m: any) =>
          this.mapTmdbMovieToDto(m),
        ),
      };
    } catch (err: any) {
      this.logger.warn(`TMDB similar failed for ${movieId} (${err.message})`);
      return {
        page: 1,
        totalPages: 1,
        totalResults: FALLBACK_MOVIES.length,
        results: FALLBACK_MOVIES,
      };
    }
  }

  async getTrendingMovies(
    timeWindow: 'day' | 'week' = 'week',
    page: number = 1,
  ): Promise<PaginatedMovieResultDto> {
    if (!this.hasValidCredentials) {
      return {
        page: 1,
        totalPages: 1,
        totalResults: FALLBACK_MOVIES.length,
        results: FALLBACK_MOVIES,
      };
    }

    try {
      const params: Record<string, any> = { page };
      if (this.apiKey && !this.accessToken) params.api_key = this.apiKey;

      const response = await this.client.get(
        `/trending/movie/${timeWindow}`,
        { params },
      );
      return {
        page: response.data.page || 1,
        totalPages: response.data.total_pages || 1,
        totalResults: response.data.total_results || 0,
        results: (response.data.results || []).map((m: any) =>
          this.mapTmdbMovieToDto(m),
        ),
      };
    } catch (err: any) {
      this.logger.warn(`TMDB trending failed (${err.message})`);
      return {
        page: 1,
        totalPages: 1,
        totalResults: FALLBACK_MOVIES.length,
        results: FALLBACK_MOVIES,
      };
    }
  }

  async getPopularMovies(page: number = 1): Promise<PaginatedMovieResultDto> {
    if (!this.hasValidCredentials) {
      return {
        page: 1,
        totalPages: 1,
        totalResults: FALLBACK_MOVIES.length,
        results: FALLBACK_MOVIES,
      };
    }

    try {
      const params: Record<string, any> = { page };
      if (this.apiKey && !this.accessToken) params.api_key = this.apiKey;

      const response = await this.client.get('/movie/popular', { params });
      return {
        page: response.data.page || 1,
        totalPages: response.data.total_pages || 1,
        totalResults: response.data.total_results || 0,
        results: (response.data.results || []).map((m: any) =>
          this.mapTmdbMovieToDto(m),
        ),
      };
    } catch (err: any) {
      this.logger.warn(`TMDB popular failed (${err.message})`);
      return {
        page: 1,
        totalPages: 1,
        totalResults: FALLBACK_MOVIES.length,
        results: FALLBACK_MOVIES,
      };
    }
  }

  async getTopRatedMovies(page: number = 1): Promise<PaginatedMovieResultDto> {
    if (!this.hasValidCredentials) {
      return {
        page: 1,
        totalPages: 1,
        totalResults: FALLBACK_MOVIES.length,
        results: FALLBACK_MOVIES,
      };
    }

    try {
      const params: Record<string, any> = { page };
      if (this.apiKey && !this.accessToken) params.api_key = this.apiKey;

      const response = await this.client.get('/movie/top_rated', { params });
      return {
        page: response.data.page || 1,
        totalPages: response.data.total_pages || 1,
        totalResults: response.data.total_results || 0,
        results: (response.data.results || []).map((m: any) =>
          this.mapTmdbMovieToDto(m),
        ),
      };
    } catch (err: any) {
      this.logger.warn(`TMDB top_rated failed (${err.message})`);
      return {
        page: 1,
        totalPages: 1,
        totalResults: FALLBACK_MOVIES.length,
        results: FALLBACK_MOVIES,
      };
    }
  }

  async getUpcomingMovies(page: number = 1): Promise<PaginatedMovieResultDto> {
    if (!this.hasValidCredentials) {
      return {
        page: 1,
        totalPages: 1,
        totalResults: FALLBACK_MOVIES.length,
        results: FALLBACK_MOVIES,
      };
    }

    try {
      const params: Record<string, any> = { page };
      if (this.apiKey && !this.accessToken) params.api_key = this.apiKey;

      const response = await this.client.get('/movie/upcoming', { params });
      return {
        page: response.data.page || 1,
        totalPages: response.data.total_pages || 1,
        totalResults: response.data.total_results || 0,
        results: (response.data.results || []).map((m: any) =>
          this.mapTmdbMovieToDto(m),
        ),
      };
    } catch (err: any) {
      this.logger.warn(`TMDB upcoming failed (${err.message})`);
      return {
        page: 1,
        totalPages: 1,
        totalResults: FALLBACK_MOVIES.length,
        results: FALLBACK_MOVIES,
      };
    }
  }

  async discoverMovies(
    filter: MovieSearchFilterDto,
  ): Promise<PaginatedMovieResultDto> {
    const page = filter.page || 1;
    if (!this.hasValidCredentials) {
      let results = [...FALLBACK_MOVIES];
      if (filter.genreId) {
        results = results.filter((m) => m.genreIds.includes(filter.genreId!));
      }
      if (filter.minRating) {
        results = results.filter((m) => m.voteAverage >= filter.minRating!);
      }
      return {
        page,
        totalPages: 1,
        totalResults: results.length,
        results,
      };
    }

    try {
      const params: Record<string, any> = {
        page,
        sort_by: filter.sortBy || 'popularity.desc',
        include_adult: false,
      };

      if (filter.genreId) {
        params.with_genres = filter.genreId;
      } else if (filter.genreIds && filter.genreIds.length > 0) {
        params.with_genres = filter.genreIds.join(',');
      }

      if (filter.year) {
        params.primary_release_year = filter.year;
      }
      if (filter.minRating) {
        params['vote_average.gte'] = filter.minRating;
      }
      if (filter.maxRuntime) {
        params['with_runtime.lte'] = filter.maxRuntime;
      }
      if (this.apiKey && !this.accessToken) {
        params.api_key = this.apiKey;
      }

      const response = await this.client.get('/discover/movie', { params });
      return {
        page: response.data.page || 1,
        totalPages: response.data.total_pages || 1,
        totalResults: response.data.total_results || 0,
        results: (response.data.results || []).map((m: any) =>
          this.mapTmdbMovieToDto(m),
        ),
      };
    } catch (err: any) {
      this.logger.warn(`TMDB discover failed (${err.message})`);
      return {
        page: 1,
        totalPages: 1,
        totalResults: FALLBACK_MOVIES.length,
        results: FALLBACK_MOVIES,
      };
    }
  }

  async getGenres(): Promise<GenreDto[]> {
    if (!this.hasValidCredentials) {
      return FALLBACK_GENRES;
    }

    try {
      const params: Record<string, any> = {};
      if (this.apiKey && !this.accessToken) params.api_key = this.apiKey;

      const response = await this.client.get('/genre/movie/list', { params });
      return response.data.genres || FALLBACK_GENRES;
    } catch (err: any) {
      this.logger.warn(`TMDB getGenres failed (${err.message}). Returning static genres.`);
      return FALLBACK_GENRES;
    }
  }
}
