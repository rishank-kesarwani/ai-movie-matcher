import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

import configuration from './config/configuration';
import { RequestIdMiddleware } from './common/middleware/request-id.middleware';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

import { RedisModule } from './modules/redis/redis.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { MovieProviderModule } from './modules/movie-provider/movie-provider.module';
import { MoviesModule } from './modules/movies/movies.module';
import { PreferencesModule } from './modules/preferences/preferences.module';
import { WatchlistsModule } from './modules/watchlists/watchlists.module';
import { WatchedModule } from './modules/watched/watched.module';
import { RatingsModule } from './modules/ratings/ratings.module';
import { FavoritesModule } from './modules/favorites/favorites.module';
import { AiPlatformModule } from './modules/ai-platform/ai-platform.module';
import { RecommendationsModule } from './modules/recommendations/recommendations.module';
import { QueuesModule } from './modules/queues/queues.module';
import { HealthModule } from './modules/health/health.module';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>(
          'mongodb.uri',
          'mongodb://localhost:27017/ai-movie-matcher',
        ),
      }),
    }),
    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => [
        {
          ttl: config.get<number>('throttle.ttl', 60) * 1000,
          limit: config.get<number>('throttle.limit', 100),
        },
      ],
    }),
    RedisModule,
    UsersModule,
    AuthModule,
    NotificationsModule,
    MovieProviderModule,
    MoviesModule,
    PreferencesModule,
    WatchlistsModule,
    WatchedModule,
    RatingsModule,
    FavoritesModule,
    AiPlatformModule,
    RecommendationsModule,
    QueuesModule,
    HealthModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes('*');
  }
}
