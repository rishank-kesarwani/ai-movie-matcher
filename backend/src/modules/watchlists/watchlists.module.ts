import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import {
  WatchlistItem,
  WatchlistItemSchema,
} from './schemas/watchlist-item.schema';
import { WatchlistsService } from './watchlists.service';
import { WatchlistsController } from './watchlists.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: WatchlistItem.name, schema: WatchlistItemSchema },
    ]),
  ],
  controllers: [WatchlistsController],
  providers: [WatchlistsService],
  exports: [WatchlistsService, MongooseModule],
})
export class WatchlistsModule {}
