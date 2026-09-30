import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  MovieRating,
  MovieRatingDocument,
} from './schemas/movie-rating.schema';
import { RateMovieDto } from './dto/rating.dto';

@Injectable()
export class RatingsService {
  private readonly logger = new Logger(RatingsService.name);

  constructor(
    @InjectModel(MovieRating.name)
    private readonly ratingModel: Model<MovieRatingDocument>,
  ) {}

  async rateMovie(
    userId: string,
    dto: RateMovieDto,
  ): Promise<MovieRatingDocument> {
    const updated = await this.ratingModel
      .findOneAndUpdate(
        { userId, movieId: dto.movieId },
        {
          $set: {
            title: dto.title,
            rating: dto.rating,
            review: dto.review,
          },
        },
        { new: true, upsert: true },
      )
      .exec();

    return updated!;
  }

  async getUserRating(
    userId: string,
    movieId: number,
  ): Promise<MovieRatingDocument | null> {
    return this.ratingModel.findOne({ userId, movieId }).exec();
  }

  async getUserRatings(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.ratingModel
        .find({ userId })
        .sort({ updatedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.ratingModel.countDocuments({ userId }),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async deleteRating(userId: string, movieId: number): Promise<boolean> {
    const result = await this.ratingModel.deleteOne({ userId, movieId }).exec();
    return result.deletedCount > 0;
  }
}
