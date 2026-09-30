import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Favorite, FavoriteDocument } from './schemas/favorite.schema';
import { AddFavoriteDto } from './dto/favorite.dto';

@Injectable()
export class FavoritesService {
  private readonly logger = new Logger(FavoritesService.name);

  constructor(
    @InjectModel(Favorite.name)
    private readonly favoriteModel: Model<FavoriteDocument>,
  ) {}

  async addFavorite(
    userId: string,
    dto: AddFavoriteDto,
  ): Promise<FavoriteDocument> {
    const existing = await this.favoriteModel.findOne({
      userId,
      type: dto.type,
      itemId: dto.itemId,
    });

    if (existing) {
      existing.name = dto.name;
      if (dto.imagePath !== undefined) existing.imagePath = dto.imagePath;
      if (dto.metadata !== undefined) existing.metadata = dto.metadata;
      return existing.save();
    }

    const favorite = new this.favoriteModel({
      userId,
      type: dto.type,
      itemId: dto.itemId,
      name: dto.name,
      imagePath: dto.imagePath,
      metadata: dto.metadata,
    });

    return favorite.save();
  }

  async removeFavorite(
    userId: string,
    type: string,
    itemId: string,
  ): Promise<boolean> {
    const result = await this.favoriteModel
      .deleteOne({ userId, type, itemId })
      .exec();
    return result.deletedCount > 0;
  }

  async getFavorites(userId: string, type?: string) {
    const query: any = { userId };
    if (type) query.type = type;

    return this.favoriteModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async isFavorite(
    userId: string,
    type: string,
    itemId: string,
  ): Promise<boolean> {
    const fav = await this.favoriteModel
      .findOne({ userId, type, itemId })
      .exec();
    return Boolean(fav);
  }
}
