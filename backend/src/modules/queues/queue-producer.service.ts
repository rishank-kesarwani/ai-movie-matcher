import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { QUEUES, JOB_NAMES } from './queue.constants';

@Injectable()
export class QueueProducerService {
  private readonly logger = new Logger(QueueProducerService.name);

  constructor(
    @InjectQueue(QUEUES.RECOMMENDATION)
    private readonly recommendationQueue: Queue,
    @InjectQueue(QUEUES.NOTIFICATION)
    private readonly notificationQueue: Queue,
  ) {}

  async enqueueRecommendationGeneration(
    userId: string,
    userEmail: string,
    userName?: string,
    limit: number = 10,
  ): Promise<string> {
    const jobId = `rec_${userId}_${Date.now()}`;
    this.logger.log(`Enqueuing recommendation generation for user ${userId}`);

    try {
      const job = await this.recommendationQueue.add(
        JOB_NAMES.GENERATE_RECOMMENDATIONS,
        { userId, userEmail, userName, limit },
        {
          jobId,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
      return job.id || jobId;
    } catch (err: any) {
      this.logger.warn(`Queue enqueue failed (${err.message}). Queue fallback.`);
      return jobId;
    }
  }

  async enqueueNotificationDispatch(
    payload: any,
  ): Promise<string> {
    const jobId = `notif_${payload.recipient?.userId || 'unknown'}_${Date.now()}`;
    try {
      const job = await this.notificationQueue.add(
        JOB_NAMES.DISPATCH_NOTIFICATION,
        payload,
        {
          jobId,
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
          removeOnComplete: true,
        },
      );
      return job.id || jobId;
    } catch (err: any) {
      this.logger.warn(`Notification enqueue failed (${err.message})`);
      return jobId;
    }
  }
}
