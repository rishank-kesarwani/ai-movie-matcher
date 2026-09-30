import { Module } from '@nestjs/common';
import { AiPlatformClient } from './ai-platform.client';
import { AiCostTrackerService } from './ai-cost-tracker.service';
import { AiAssistantService } from './ai-assistant.service';
import { AiSemanticSearchService } from './ai-semantic-search.service';
import { AiController } from './ai.controller';
import { MovieProviderModule } from '../movie-provider/movie-provider.module';

@Module({
  imports: [MovieProviderModule],
  controllers: [AiController],
  providers: [
    AiPlatformClient,
    AiCostTrackerService,
    AiAssistantService,
    AiSemanticSearchService,
  ],
  exports: [
    AiPlatformClient,
    AiCostTrackerService,
    AiAssistantService,
    AiSemanticSearchService,
  ],
})
export class AiPlatformModule {}
