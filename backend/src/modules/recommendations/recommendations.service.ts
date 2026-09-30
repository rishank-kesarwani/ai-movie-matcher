import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  Recommendation,
  RecommendationDocument,
} from './schemas/recommendation.schema';
import {
  RecommendationsEngineService,
  ScoringWeights,
} from './recommendations-engine.service';
import { RedisService } from '../redis/redis.service';
import { NotificationService } from '../notifications/notification.service';
import { RecommendationSource } from '../../common/enums/movie.enum';

@Injectable()
export class RecommendationsService {
  private readonly logger = new Logger(RecommendationsService.name);

  constructor(
    @InjectModel(Recommendation.name)
    private readonly recommendationModel: Model<RecommendationDocument>,
    private readonly engine: RecommendationsEngineService,
    private readonly redisService: RedisService,
    private readonly notificationService: NotificationService,
  ) {}

  async getRecommendations(
    userId: string,
    refresh: boolean = false,
    limit: number = 10,
    customWeights?: Partial<ScoringWeights>,
  ) {
    const cacheKey = `recommendations:${userId}:${limit}`;

    if (!refresh) {
      const cached = await this.redisService.get(cacheKey);
      if (cached) return cached;
    }

    // Generate fresh recommendations
    const { recommendations, weights } =
      await this.engine.generateRecommendations(userId, limit, customWeights);

    // Save to database
    const savedDoc = await this.recommendationModel.create({
      userId,
      source: RecommendationSource.AI_HYBRID,
      recommendations,
      scoringWeights: weights,
    });

    const result = {
      id: (savedDoc as any)._id.toString(),
      recommendations,
      weights,
      generatedAt: new Date().toISOString(),
    };

    // Cache in Redis for 30 minutes
    await this.redisService.set(cacheKey, result, 1800);

    return result;
  }

  async generateAndNotify(
    user: { id: string; email: string; name?: string },
    limit: number = 5,
  ) {
    const result = await this.getRecommendations(user.id, true, limit);
    if (result.recommendations.length > 0) {
      this.notificationService
        .sendPersonalizedRecommendationNotification(
          user,
          result.recommendations.map((r: any) => ({
            id: r.movieId,
            title: r.title,
            matchScore: r.matchScore,
            reason: r.explanation,
          })),
        )
        .catch((err) => {
          this.logger.warn(
            `Failed to send recommendation notification: ${err.message}`,
          );
        });
    }
    return result;
  }

  async getRecommendationHistory(userId: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [items, total] = await Promise.all([
      this.recommendationModel
        .find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.recommendationModel.countDocuments({ userId }),
    ]);

    return {
      items,
      total,
      page,
      totalPages: Math.ceil(total / limit) || 1,
    };
  }
}
