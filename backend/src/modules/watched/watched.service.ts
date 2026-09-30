import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  WatchedMovie,
  WatchedMovieDocument,
} from './schemas/watched-movie.schema';
import { MarkWatchedDto } from './dto/watched.dto';

@Injectable()
export class WatchedService {
  private readonly logger = new Logger(WatchedService.name);

  constructor(
    @InjectModel(WatchedMovie.name)
    private readonly watchedModel: Model<WatchedMovieDocument>,
  ) {}

  async markAsWatched(
    userId: string,
    dto: MarkWatchedDto,
  ): Promise<WatchedMovieDocument> {
    const existing = await this.watchedModel.findOne({
      userId,
      movieId: dto.movieId,
    });

    if (existing) {
      if (dto.userRating !== undefined) existing.userRating = dto.userRating;
      if (dto.review !== undefined) existing.review = dto.review;
      existing.watchedAt = new Date();
      return existing.save();
    }

    const item = new this.watchedModel({
      userId,
      movieId: dto.movieId,
      title: dto.title,
      posterPath: dto.posterPath,
      backdropPath: dto.backdropPath,
      userRating: dto.userRating,
      review: dto.review,
      genreIds: dto.genreIds || [],
      watchedAt: new Date(),
    });

    return item.save();
  }

  async unmarkWatched(userId: string, movieId: number): Promise<boolean> {
    const result = await this.watchedModel
      .deleteOne({ userId, movieId })
      .exec();
    return result.deletedCount > 0;
  }

  async getWatchedHistory(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.watchedModel
        .find({ userId })
        .sort({ watchedAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.watchedModel.countDocuments({ userId }),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async isMovieWatched(
    userId: string,
    movieId: number,
  ): Promise<WatchedMovieDocument | null> {
    return this.watchedModel.findOne({ userId, movieId }).exec();
  }
}
