import {
  Injectable,
  ConflictException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  WatchlistItem,
  WatchlistItemDocument,
} from './schemas/watchlist-item.schema';
import { AddWatchlistDto } from './dto/watchlist.dto';
import { WatchlistStatus } from '../../common/enums/movie.enum';

@Injectable()
export class WatchlistsService {
  private readonly logger = new Logger(WatchlistsService.name);

  constructor(
    @InjectModel(WatchlistItem.name)
    private readonly watchlistModel: Model<WatchlistItemDocument>,
  ) {}

  async addToWatchlist(
    userId: string,
    dto: AddWatchlistDto,
  ): Promise<WatchlistItemDocument> {
    const existing = await this.watchlistModel.findOne({
      userId,
      movieId: dto.movieId,
    });

    if (existing) {
      existing.status = dto.status || existing.status;
      if (dto.notes !== undefined) existing.notes = dto.notes;
      return existing.save();
    }

    const item = new this.watchlistModel({
      userId,
      movieId: dto.movieId,
      title: dto.title,
      posterPath: dto.posterPath,
      backdropPath: dto.backdropPath,
      voteAverage: dto.voteAverage || 0,
      releaseDate: dto.releaseDate || '',
      genreIds: dto.genreIds || [],
      status: dto.status || WatchlistStatus.PLAN_TO_WATCH,
      notes: dto.notes,
    });

    return item.save();
  }

  async removeFromWatchlist(userId: string, movieId: number): Promise<boolean> {
    const result = await this.watchlistModel
      .deleteOne({ userId, movieId })
      .exec();
    return result.deletedCount > 0;
  }

  async getWatchlist(
    userId: string,
    status?: WatchlistStatus,
    page: number = 1,
    limit: number = 20,
  ) {
    const query: any = { userId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.watchlistModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.watchlistModel.countDocuments(query),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }

  async updateStatus(
    userId: string,
    movieId: number,
    status: WatchlistStatus,
  ): Promise<WatchlistItemDocument> {
    const item = await this.watchlistModel.findOneAndUpdate(
      { userId, movieId },
      { $set: { status } },
      { new: true },
    );

    if (!item) {
      throw new NotFoundException('Movie is not in your watchlist');
    }

    return item;
  }

  async isMovieInWatchlist(
    userId: string,
    movieId: number,
  ): Promise<WatchlistItemDocument | null> {
    return this.watchlistModel.findOne({ userId, movieId }).exec();
  }
}
