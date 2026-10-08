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

// Curated high-fidelity worldwide & Bollywood fallback dataset for offline resilience, testing, and dev
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
    id: 20453,
    title: '3 Idiots',
    originalTitle: '3 Idiots',
    overview:
      'In the prestigious Imperial College of Engineering, two friends embark on a quest for a lost buddy while reliving their college days and recalling the inspiring memories of their unconventional friend Rancho who challenged the rigid Indian educational system.',
    posterPath: '/66A9MqXOyVFCssoloscw79z89ew.jpg',
    backdropPath: '/u7i3Q2hT2jK75jR968a3X5dK.jpg',
    releaseDate: '2009-12-23',
    voteAverage: 8.0,
    voteCount: 1650,
    popularity: 115.4,
    genreIds: [35, 18],
    genres: [
      { id: 35, name: 'Comedy' },
      { id: 18, name: 'Drama' },
    ],
    originalLanguage: 'hi',
    runtime: 170,
    tagline: 'Don\'t pursue success. Pursue excellence, and success will chase you pants down.',
    status: 'Released',
    director: 'Rajkumar Hirani',
    castMembers: ['Aamir Khan', 'R. Madhavan', 'Sharman Joshi', 'Kareena Kapoor Khan', 'Boman Irani'],
    credits: {
      cast: [
        { id: 52331, name: 'Aamir Khan', character: 'Ranchhoddas Shamaldas Chhanchad / Phunsukh Wangdu', order: 0 },
        { id: 84433, name: 'R. Madhavan', character: 'Farhan Qureshi', order: 1 },
        { id: 84434, name: 'Sharman Joshi', character: 'Raju Rastogi', order: 2 },
        { id: 35742, name: 'Kareena Kapoor Khan', character: 'Pia Sahastrabuddhe', order: 3 },
      ],
      crew: [{ id: 52332, name: 'Rajkumar Hirani', job: 'Director', department: 'Directing' }],
      director: { id: 52332, name: 'Rajkumar Hirani', job: 'Director', department: 'Directing' },
    },
  },
  {
    id: 360814,
    title: 'Dangal',
    originalTitle: 'दंगल',
    overview:
      'Former wrestler Mahavir Singh Phogat and his two wrestler daughters struggle towards glory at the Commonwealth Games in the face of societal oppression and triumph against all odds to win India\'s first gold in women\'s wrestling.',
    posterPath: '/50596k9L0w4e1FfC3y73A6vK.jpg',
    backdropPath: '/jE5o7yd1nF7y6p01.jpg',
    releaseDate: '2016-12-23',
    voteAverage: 8.03,
    voteCount: 1200,
    popularity: 98.7,
    genreIds: [18, 28, 10751],
    genres: [
      { id: 18, name: 'Drama' },
      { id: 28, name: 'Action' },
      { id: 10751, name: 'Family' },
    ],
    originalLanguage: 'hi',
    runtime: 161,
    tagline: 'Gold is gold, whether won by a boy or a girl.',
    status: 'Released',
    director: 'Nitesh Tiwari',
    castMembers: ['Aamir Khan', 'Fatima Sana Shaikh', 'Sanya Malhotra', 'Sakshi Tanwar'],
  },
  {
    id: 579974,
    title: 'RRR',
    originalTitle: 'రౌద్రం రణం రుధిరం',
    overview:
      'A fearless revolutionary and an officer in the British force, who once shared a deep bond, decide to join forces and embark on an epic journey of fierce rebellion against the tyrannical British Raj in 1920s India.',
    posterPath: '/kdPMumJzyYAc4roD52qavX0nUR3.jpg',
    backdropPath: '/707thQOzSnOP5Q7n5p6.jpg',
    releaseDate: '2022-03-24',
    voteAverage: 7.8,
    voteCount: 1540,
    popularity: 135.2,
    genreIds: [28, 18, 12],
    genres: [
      { id: 28, name: 'Action' },
      { id: 18, name: 'Drama' },
      { id: 12, name: 'Adventure' },
    ],
    originalLanguage: 'te',
    runtime: 187,
    tagline: 'Rise, Roar, Revolt.',
    status: 'Released',
    director: 'S.S. Rajamouli',
    castMembers: ['N.T. Rama Rao Jr.', 'Ram Charan', 'Alia Bhatt', 'Ajay Devgn'],
  },
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
    originalLanguage: 'en',
    runtime: 169,
    tagline: 'Mankind was born on Earth. It was never meant to die here.',
    status: 'Released',
    director: 'Christopher Nolan',
    castMembers: ['Matthew McConaughey', 'Anne Hathaway', 'Jessica Chastain', 'Michael Caine'],
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
    originalLanguage: 'ko',
    runtime: 133,
    tagline: 'Act like you own the place.',
    status: 'Released',
    director: 'Bong Joon-ho',
    castMembers: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong', 'Choi Woo-shik'],
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
    originalLanguage: 'ja',
    runtime: 125,
    tagline: 'Nothing that happens is ever forgotten.',
    status: 'Released',
    director: 'Hayao Miyazaki',
    castMembers: ['Rumi Hiiragi', 'Miyu Irino', 'Mari Natsuki', 'Takashi Naito'],
  },
  {
    id: 1966,
    title: 'Lagaan: Once Upon a Time in India',
    originalTitle: 'लगान',
    overview:
      'In Victorian India, the people of a small village bet their future on a game of cricket against their ruthless British rulers to win freedom from excessive taxation (lagaan).',
    posterPath: '/45P0YfK739tJ90p9x.jpg',
    backdropPath: '/lagaanBackdrop.jpg',
    releaseDate: '2001-06-15',
    voteAverage: 7.7,
    voteCount: 540,
    popularity: 65.4,
    genreIds: [18, 10749, 10402],
    genres: [
      { id: 18, name: 'Drama' },
      { id: 10749, name: 'Romance' },
    ],
    originalLanguage: 'hi',
    runtime: 224,
    tagline: 'A million dreams, one goal.',
    status: 'Released',
    director: 'Ashutosh Gowariker',
    castMembers: ['Aamir Khan', 'Gracy Singh', 'Rachel Shelley', 'Paul Blackthorne'],
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
    originalLanguage: 'en',
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
      'Follow the mythic journey of Paul Atreides as he unites with Chani and the Fremen while on a path of revenge against the conspirators who destroyed his family.',
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
    originalLanguage: 'en',
    runtime: 166,
    tagline: 'Long live the fighters.',
    status: 'Released',
    director: 'Denis Villeneuve',
    castMembers: ['Timothée Chalamet', 'Zendaya', 'Rebecca Ferguson', 'Javier Bardem'],
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

    if (this.accessToken) {
      headers.Authorization = `Bearer ${this.accessToken}`;
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
      originalLanguage: tmdbMovie.original_language || undefined,
      adult: tmdbMovie.adult || false,
    };
  }

  async searchMovies(
    query: string,
    filter?: MovieSearchFilterDto,
  ): Promise<PaginatedMovieResultDto> {
    const page = filter?.page || 1;
    if (!this.hasValidCredentials) {
      let filtered = FALLBACK_MOVIES.filter(
        (m) =>
          m.title.toLowerCase().includes(query.toLowerCase()) ||
          (m.originalTitle && m.originalTitle.toLowerCase().includes(query.toLowerCase())) ||
          m.overview.toLowerCase().includes(query.toLowerCase()) ||
          (m.director && m.director.toLowerCase().includes(query.toLowerCase())) ||
          (m.castMembers && m.castMembers.some((c) => c.toLowerCase().includes(query.toLowerCase()))),
      );
      if (filter?.withOriginalLanguage) {
        filtered = filtered.filter((m) => m.originalLanguage === filter.withOriginalLanguage);
      }
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
      if (filter?.region) {
        params.region = filter.region;
      }
      if (this.apiKey && !this.accessToken) {
        params.api_key = this.apiKey;
      }

      const response = await this.client.get('/search/movie', { params });
      let results = (response.data.results || []).map((m: any) =>
        this.mapTmdbMovieToDto(m),
      );
      if (filter?.withOriginalLanguage) {
        results = results.filter(
          (m: MovieDto) => m.originalLanguage === filter.withOriginalLanguage,
        );
      }

      return {
        page: response.data.page || 1,
        totalPages: response.data.total_pages || 1,
        totalResults: response.data.total_results || 0,
        results,
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
        append_to_response: 'credits,videos,similar,watch/providers',
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

      // Parse Watch / Streaming Providers (JustWatch powered TMDB endpoint)
      const providersData =
        data['watch/providers']?.results?.IN ||
        data['watch/providers']?.results?.US ||
        data['watch/providers']?.results?.[Object.keys(data['watch/providers']?.results || {})[0]] ||
        null;

      const mapProviderList = (list?: any[]) =>
        (list || []).map((p: any) => ({
          providerId: p.provider_id,
          providerName: p.provider_name,
          logoPath: p.logo_path,
          displayPriority: p.display_priority,
        }));

      const watchProviders = providersData
        ? {
            link: providersData.link,
            flatrate: mapProviderList(providersData.flatrate),
            free: mapProviderList(providersData.free || providersData.ads),
            rent: mapProviderList(providersData.rent),
            buy: mapProviderList(providersData.buy),
          }
        : undefined;

      return {
        ...baseMovie,
        runtime: data.runtime,
        tagline: data.tagline,
        status: data.status,
        budget: data.budget,
        revenue: data.revenue,
        spokenLanguages: data.spoken_languages || [],
        credits: { cast, crew, director: directorObj },
        videos,
        director: directorObj?.name,
        castMembers: cast.map((c) => c.name),
        imdbId: data.imdb_id,
        watchProviders,
      };
    } catch (err: any) {
      this.logger.warn(`TMDB getMovieDetails failed for ${movieId} (${err.message}). Using fallback.`);
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
    region?: string,
  ): Promise<PaginatedMovieResultDto> {
    if (!this.hasValidCredentials) {
      let results = [...FALLBACK_MOVIES];
      if (region === 'IN') {
        results = results.filter((m) => m.originalLanguage === 'hi' || m.originalLanguage === 'te');
      }
      return {
        page: 1,
        totalPages: 1,
        totalResults: results.length,
        results,
      };
    }

    try {
      const params: Record<string, any> = { page };
      if (region) params.region = region;
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

  async getPopularMovies(
    page: number = 1,
    region?: string,
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
      if (region) params.region = region;
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

  async getUpcomingMovies(
    page: number = 1,
    region?: string,
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
      if (region) params.region = region;
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
      if (filter.withOriginalLanguage) {
        results = results.filter((m) => m.originalLanguage === filter.withOriginalLanguage);
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

      if (filter.withOriginalLanguage) {
        params.with_original_language = filter.withOriginalLanguage;
      }
      if (filter.region) {
        params.region = filter.region;
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
      this.logger.warn(`TMDB genres failed (${err.message})`);
      return FALLBACK_GENRES;
    }
  }
}
