import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AiAssistantService, AssistantChatDto } from './ai-assistant.service';
import { AiSemanticSearchService } from './ai-semantic-search.service';
import { AiCostTrackerService } from './ai-cost-tracker.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { OptionalAuth } from '../../common/decorators/optional-auth.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { IsArray, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class SemanticSearchDto {
  @IsString()
  @IsNotEmpty()
  query: string;
}

export class ChatRequestDto {
  @IsArray()
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;

  @IsOptional()
  useRag?: boolean;
}

@ApiTags('AI Platform')
@Controller('api/v1/ai')
export class AiController {
  constructor(
    private readonly assistantService: AiAssistantService,
    private readonly semanticSearchService: AiSemanticSearchService,
    private readonly costTracker: AiCostTrackerService,
  ) {}

  @OptionalAuth()
  @Post('chat')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 15, ttl: 60000 } })
  @ApiOperation({
    summary: 'Chat with CineMatch AI movie assistant via shared AI Platform',
  })
  async chat(
    @CurrentUser() user: AuthUser | null,
    @Body() dto: ChatRequestDto,
  ) {
    return this.assistantService.chat(user?.userId, dto);
  }

  @OptionalAuth()
  @Post('semantic-search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search movies semantically by mood, plot themes, or concept',
  })
  async semanticSearch(
    @CurrentUser() user: AuthUser | null,
    @Body() dto: SemanticSearchDto,
  ) {
    return this.semanticSearchService.semanticSearch(
      dto.query,
      user?.userId,
    );
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @Get('usage')
  @ApiOperation({
    summary: 'Get AI cost, token usage, and latency observability summary',
  })
  async getUsage() {
    return this.costTracker.getMetricsSummary();
  }
}
