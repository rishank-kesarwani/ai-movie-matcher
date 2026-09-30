import { Module, Global } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ConfigService } from '@nestjs/config';
import { QUEUES } from './queue.constants';
import { QueueProducerService } from './queue-producer.service';
import { RecommendationProcessor } from './processors/recommendation.processor';
import { NotificationProcessor } from './processors/notification.processor';
import { RecommendationsModule } from '../recommendations/recommendations.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Global()
@Module({
  imports: [
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        connection: {
          host: configService.get<string>('redis.host', 'localhost'),
          port: configService.get<number>('redis.port', 6379),
          password: configService.get<string>('redis.password') || undefined,
          db: configService.get<number>('redis.db', 0),
          maxRetriesPerRequest: null,
          enableReadyCheck: false,
        },
      }),
    }),
    BullModule.registerQueue(
      { name: QUEUES.RECOMMENDATION },
      { name: QUEUES.NOTIFICATION },
    ),
    RecommendationsModule,
    NotificationsModule,
  ],
  providers: [
    QueueProducerService,
    RecommendationProcessor,
    NotificationProcessor,
  ],
  exports: [QueueProducerService, BullModule],
})
export class QueuesModule {}
