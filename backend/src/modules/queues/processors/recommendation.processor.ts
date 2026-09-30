import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { QUEUES, JOB_NAMES } from '../queue.constants';
import { RecommendationsService } from '../../recommendations/recommendations.service';

@Processor(QUEUES.RECOMMENDATION)
export class RecommendationProcessor extends WorkerHost {
  private readonly logger = new Logger(RecommendationProcessor.name);

  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {
    super();
  }

  async process(job: Job<any, any, string>): Promise<any> {
    this.logger.log(`Processing recommendation job [${job.id}] for user ${job.data.userId}`);

    if (job.name === JOB_NAMES.GENERATE_RECOMMENDATIONS) {
      const { userId, userEmail, userName, limit } = job.data;
      return this.recommendationsService.generateAndNotify(
        { id: userId, email: userEmail, name: userName },
        limit || 10,
      );
    }
  }
}
