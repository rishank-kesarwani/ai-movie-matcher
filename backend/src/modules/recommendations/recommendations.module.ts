import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Recommendation,
  RecommendationSchema,
} from './schemas/recommendation.schema';
import { RecommendationsEngineService } from './recommendations-engine.service';
import { RecommendationsService } from './recommendations.service';
import { RecommendationsController } from './recommendations.controller';
import { MovieProviderModule } from '../movie-provider/movie-provider.module';
import { PreferencesModule } from '../preferences/preferences.module';
import { WatchedModule } from '../watched/watched.module';
import { FavoritesModule } from '../favorites/favorites.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Recommendation.name, schema: RecommendationSchema },
    ]),
    MovieProviderModule,
    PreferencesModule,
    WatchedModule,
    FavoritesModule,
  ],
  controllers: [RecommendationsController],
  providers: [RecommendationsEngineService, RecommendationsService],
  exports: [RecommendationsEngineService, RecommendationsService, MongooseModule],
})
export class RecommendationsModule {}
