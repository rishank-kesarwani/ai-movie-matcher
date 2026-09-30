import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { RecommendationSource } from '../../../common/enums/movie.enum';

export type RecommendationDocument = Recommendation & Document;

@Schema({ timestamps: true })
export class Recommendation {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: string;

  @Prop({ required: true, enum: RecommendationSource, default: RecommendationSource.AI_HYBRID })
  source: RecommendationSource;

  @Prop({
    type: [
      {
        movieId: { type: Number, required: true },
        title: { type: String, required: true },
        posterPath: { type: String, default: null },
        backdropPath: { type: String, default: null },
        releaseDate: { type: String, default: '' },
        voteAverage: { type: Number, default: 0 },
        genreIds: { type: [Number], default: [] },
        genres: { type: [String], default: [] },
        director: { type: String, default: null },
        matchScore: { type: Number, required: true }, // 0 - 100%
        semanticScore: { type: Number, default: 0 },
        preferenceScore: { type: Number, default: 0 },
        ratingScore: { type: Number, default: 0 },
        popularityScore: { type: Number, default: 0 },
        explanation: { type: String, required: true },
        reasons: { type: [String], default: [] },
      },
    ],
    default: [],
  })
  recommendations: Array<{
    movieId: number;
    title: string;
    posterPath?: string;
    backdropPath?: string;
    releaseDate?: string;
    voteAverage: number;
    genreIds: number[];
    genres?: string[];
    director?: string;
    matchScore: number;
    semanticScore?: number;
    preferenceScore?: number;
    ratingScore?: number;
    popularityScore?: number;
    explanation: string;
    reasons?: string[];
  }>;

  @Prop({ type: Object, default: {} })
  scoringWeights: {
    semanticWeight?: number;
    preferenceWeight?: number;
    ratingWeight?: number;
    popularityWeight?: number;
  };
}

export const RecommendationSchema = SchemaFactory.createForClass(Recommendation);

RecommendationSchema.index({ userId: 1, createdAt: -1 });
