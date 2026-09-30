import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  MovieRating,
  MovieRatingSchema,
} from './schemas/movie-rating.schema';
import { RatingsService } from './ratings.service';
import { RatingsController } from './ratings.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: MovieRating.name, schema: MovieRatingSchema },
    ]),
  ],
  controllers: [RatingsController],
  providers: [RatingsService],
  exports: [RatingsService, MongooseModule],
})
export class RatingsModule {}
