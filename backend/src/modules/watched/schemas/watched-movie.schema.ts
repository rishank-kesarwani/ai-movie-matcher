import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type WatchedMovieDocument = WatchedMovie & Document;

@Schema({ timestamps: true })
export class WatchedMovie {
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

  @Prop({ default: null, min: 1, max: 10 })
  userRating?: number;

  @Prop({ default: null })
  review?: string;

  @Prop({ type: [Number], default: [] })
  genreIds: number[];

  @Prop({ type: Date, default: Date.now })
  watchedAt: Date;
}

export const WatchedMovieSchema = SchemaFactory.createForClass(WatchedMovie);

WatchedMovieSchema.index({ userId: 1, movieId: 1 }, { unique: true });
WatchedMovieSchema.index({ userId: 1, watchedAt: -1 });
