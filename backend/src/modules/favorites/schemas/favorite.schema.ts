import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

export type FavoriteDocument = Favorite & Document;

@Schema({ timestamps: true })
export class Favorite {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true, index: true })
  userId: string;

  @Prop({ required: true, enum: ['MOVIE', 'GENRE', 'ACTOR', 'DIRECTOR'] })
  type: 'MOVIE' | 'GENRE' | 'ACTOR' | 'DIRECTOR';

  @Prop({ required: true })
  itemId: string; // Movie ID, Genre ID, or Person Name/ID

  @Prop({ required: true })
  name: string; // Movie title, Genre name, or Person name

  @Prop({ default: null })
  imagePath?: string;

  @Prop({ default: null })
  metadata?: string;
}

export const FavoriteSchema = SchemaFactory.createForClass(Favorite);

FavoriteSchema.index({ userId: 1, type: 1, itemId: 1 }, { unique: true });
FavoriteSchema.index({ userId: 1, type: 1 });
