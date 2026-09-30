import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';
import { WatchlistStatus } from '../../../common/enums/movie.enum';

export type WatchlistItemDocument = WatchlistItem & Document;

@Schema({ timestamps: true })
export class WatchlistItem {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: string;

  @Prop({ required: true, index: true })
  movieId: number;

  @Prop({ required: true })
  title: string;

  @Prop({ default: null })
  posterPath?: string;

  @Prop({ default: null })
  backdropPath?: string;

  @Prop({ default: 0 })
  voteAverage: number;

  @Prop({ default: '' })
  releaseDate?: string;

  @Prop({ type: [Number], default: [] })
  genreIds: number[];

  @Prop({ type: String, enum: WatchlistStatus, default: WatchlistStatus.PLAN_TO_WATCH, index: true })
  status: WatchlistStatus;

  @Prop({ default: null })
  notes?: string;
}

export const WatchlistItemSchema = SchemaFactory.createForClass(WatchlistItem);

// Compound index to guarantee uniqueness per user and movie, plus fast sorting by createdAt
WatchlistItemSchema.index({ userId: 1, movieId: 1 }, { unique: true });
WatchlistItemSchema.index({ userId: 1, createdAt: -1 });
