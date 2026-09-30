import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  UserPreference,
  UserPreferenceDocument,
} from './schemas/user-preference.schema';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';

@Injectable()
export class PreferencesService {
  private readonly logger = new Logger(PreferencesService.name);

  constructor(
    @InjectModel(UserPreference.name)
    private readonly preferenceModel: Model<UserPreferenceDocument>,
  ) {}

  async getPreferences(userId: string): Promise<UserPreferenceDocument> {
    let prefs = await this.preferenceModel.findOne({ userId }).exec();
    if (!prefs) {
      prefs = await this.preferenceModel.create({
        userId,
        favoriteGenres: [878, 12, 18],
        dislikedGenres: [],
        favoriteDirectors: ['Christopher Nolan', 'Denis Villeneuve'],
        favoriteActors: ['Leonardo DiCaprio', 'Matthew McConaughey'],
        preferredLanguages: ['en'],
        minimumRating: 7.0,
      });
    }
    return prefs;
  }

  async updatePreferences(
    userId: string,
    dto: UpdatePreferencesDto,
  ): Promise<UserPreferenceDocument> {
    const updateData: Partial<UserPreference> = {};

    if (dto.favoriteGenres !== undefined) updateData.favoriteGenres = dto.favoriteGenres;
    if (dto.dislikedGenres !== undefined) updateData.dislikedGenres = dto.dislikedGenres;
    if (dto.favoriteDirectors !== undefined) updateData.favoriteDirectors = dto.favoriteDirectors;
    if (dto.favoriteActors !== undefined) updateData.favoriteActors = dto.favoriteActors;
    if (dto.preferredLanguages !== undefined) updateData.preferredLanguages = dto.preferredLanguages;
    if (dto.preferredReleasePeriod !== undefined) updateData.preferredReleasePeriod = dto.preferredReleasePeriod;
    if (dto.preferredRuntime !== undefined) updateData.preferredRuntime = dto.preferredRuntime;
    if (dto.minimumRating !== undefined) updateData.minimumRating = dto.minimumRating;

    const updated = await this.preferenceModel
      .findOneAndUpdate(
        { userId },
        { $set: updateData },
        { new: true, upsert: true },
      )
      .exec();

    return updated!;
  }

  async updateDerivedTasteProfile(
    userId: string,
    profile: {
      inferredGenres?: Array<{ genreId: number; name?: string; weight: number }>;
      inferredDirectors?: Array<{ director: string; weight: number }>;
      inferredActors?: Array<{ actor: string; weight: number }>;
      tasteSummary?: string;
    },
  ): Promise<UserPreferenceDocument> {
    const updated = await this.preferenceModel
      .findOneAndUpdate(
        { userId },
        {
          $set: {
            ...(profile.inferredGenres ? { inferredGenres: profile.inferredGenres } : {}),
            ...(profile.inferredDirectors ? { inferredDirectors: profile.inferredDirectors } : {}),
            ...(profile.inferredActors ? { inferredActors: profile.inferredActors } : {}),
            ...(profile.tasteSummary ? { tasteSummary: profile.tasteSummary } : {}),
            lastCalculatedAt: new Date(),
          },
        },
        { new: true, upsert: true },
      )
      .exec();

    return updated!;
  }
}
