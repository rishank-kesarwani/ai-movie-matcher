import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  WatchedMovie,
  WatchedMovieSchema,
} from './schemas/watched-movie.schema';
import { WatchedService } from './watched.service';
import { WatchedController } from './watched.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WatchedMovie.name, schema: WatchedMovieSchema },
    ]),
  ],
  controllers: [WatchedController],
  providers: [WatchedService],
  exports: [WatchedService, MongooseModule],
})
export class WatchedModule {}
