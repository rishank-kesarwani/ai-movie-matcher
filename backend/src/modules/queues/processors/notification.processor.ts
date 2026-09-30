import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUES, JOB_NAMES } from '../queue.constants';
import { NotificationClientService } from '../../notifications/notification-client.service';

@Processor(QUEUES.NOTIFICATION)
export class NotificationProcessor extends WorkerHost {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    private readonly notificationClient: NotificationClientService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing notification dispatch job [${job.id}]`);

    if (job.name === JOB_NAMES.DISPATCH_NOTIFICATION) {
      return this.notificationClient.sendNotification(job.data);
    }
  }
}
