import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type MovieRatingDocument = MovieRating & Document;

@Schema({ timestamps: true })
export class MovieRating {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: string;

  @Prop({ required: true, index: true })
  movieId: number;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true, min: 1, max: 10 })
  rating: number;

  @Prop({ default: null })
  review?: string;
}

export const MovieRatingSchema = SchemaFactory.createForClass(MovieRating);

MovieRatingSchema.index({ userId: 1, movieId: 1 }, { unique: true });
MovieRatingSchema.index({ movieId: 1 });
