import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type UserPreferenceDocument = UserPreference & Document;

@Schema({ timestamps: true })
export class UserPreference {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, unique: true, index: true })
  userId: string;

  // Explicit user preferences
  @Prop({ type: [Number], default: [878, 12, 18] }) // Default: Sci-Fi, Adventure, Drama
  favoriteGenres: number[];

  @Prop({ type: [Number], default: [] })
  dislikedGenres: number[];

  @Prop({ type: [String], default: ['Christopher Nolan', 'Denis Villeneuve'] })
  favoriteDirectors: string[];

  @Prop({ type: [String], default: ['Leonardo DiCaprio', 'Matthew McConaughey', 'Amy Adams'] })
  favoriteActors: string[];

  @Prop({ type: [String], default: ['en'] })
  preferredLanguages: string[];

  @Prop({
    type: Object,
    default: { minYear: 1990, maxYear: 2026 },
  })
  preferredReleasePeriod: {
    minYear?: number;
    maxYear?: number;
  };

  @Prop({
    type: Object,
    default: { min: 80, max: 180 },
  })
  preferredRuntime: {
    min?: number;
    max?: number;
  };

  @Prop({ type: Number, default: 7.0 })
  minimumRating: number;

  // Derived / Implicit taste profile generated from user viewing history & ratings
  @Prop({
    type: [
      {
        genreId: { type: Number, required: true },
        name: { type: String, default: '' },
        weight: { type: Number, default: 1.0 },
      },
    ],
    default: [],
  })
  inferredGenres: Array<{ genreId: number; name?: string; weight: number }>;

  @Prop({
    type: [
      {
        director: { type: String, required: true },
        weight: { type: Number, default: 1.0 },
      },
    ],
    default: [],
  })
  inferredDirectors: Array<{ director: string; weight: number }>;

  @Prop({
    type: [
      {
        actor: { type: String, required: true },
        weight: { type: Number, default: 1.0 },
      },
    ],
    default: [],
  })
  inferredActors: Array<{ actor: string; weight: number }>;

  @Prop({
    type: String,
    default:
      'Loves thought-provoking science fiction, philosophical narratives, and visually rich films with strong atmosphere.',
  })
  tasteSummary: string;

  @Prop({ type: Date, default: Date.now })
  lastCalculatedAt: Date;
}

export const UserPreferenceSchema = SchemaFactory.createForClass(UserPreference);

