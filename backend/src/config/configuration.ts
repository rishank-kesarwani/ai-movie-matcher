export interface EnvironmentVariables {
  NODE_ENV: string;
  PORT: number;
  APP_NAME: string;
  APPLICATION_ID: string;
  FRONTEND_URL: string;
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;
  JWT_ACCESS_EXPIRATION: string;
  JWT_REFRESH_EXPIRATION: string;
  MONGODB_URI: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD?: string;
  REDIS_DB: number;
  REDIS_URL?: string;
  TMDB_ACCESS_TOKEN: string;
  TMDB_API_KEY?: string;
  TMDB_BASE_URL: string;
  TMDB_IMAGE_BASE_URL: string;
  AI_PLATFORM_URL: string;
  AI_PLATFORM_API_KEY: string;
  AI_PLATFORM_TIMEOUT_MS: number;
  NOTIFICATION_SERVICE_URL: string;
  NOTIFICATION_SERVICE_API_KEY: string;
  THROTTLE_TTL: number;
  THROTTLE_LIMIT: number;
  THROTTLE_AI_LIMIT: number;
  THROTTLE_AUTH_LIMIT: number;
}

export default () => ({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  appName: process.env.APP_NAME || 'ai-movie-matcher',
  applicationId: process.env.APPLICATION_ID || 'ai-movie-matcher',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  jwt: {
    accessSecret:
      process.env.JWT_ACCESS_SECRET ||
      'dev_jwt_access_secret_ai_movie_matcher_2026',
    refreshSecret:
      process.env.JWT_REFRESH_SECRET ||
      'dev_jwt_refresh_secret_ai_movie_matcher_2026',
    accessExpiration: process.env.JWT_ACCESS_EXPIRATION || '15m',
    refreshExpiration: process.env.JWT_REFRESH_EXPIRATION || '7d',
  },
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/ai-movie-matcher',
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0', 10),
    url: process.env.REDIS_URL || 'redis://localhost:6379',
  },
  tmdb: {
    accessToken: process.env.TMDB_ACCESS_TOKEN || '',
    apiKey: process.env.TMDB_API_KEY || '',
    baseUrl: process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3',
    imageBaseUrl: process.env.TMDB_IMAGE_BASE_URL || 'https://image.tmdb.org/t/p',
  },
  aiPlatform: {
    url: process.env.AI_PLATFORM_URL || 'http://localhost:5000',
    apiKey: process.env.AI_PLATFORM_API_KEY || 'platform_master_key_dev_12345',
    timeoutMs: parseInt(process.env.AI_PLATFORM_TIMEOUT_MS || '60000', 10),
  },
  notificationService: {
    url: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:3001',
    apiKey: process.env.NOTIFICATION_SERVICE_API_KEY || 'notification_service_api_key_12345',
  },
  throttle: {
    ttl: parseInt(process.env.THROTTLE_TTL || '60', 10),
    limit: parseInt(process.env.THROTTLE_LIMIT || '100', 10),
    aiLimit: parseInt(process.env.THROTTLE_AI_LIMIT || '20', 10),
    authLimit: parseInt(process.env.THROTTLE_AUTH_LIMIT || '10', 10),
  },
});
