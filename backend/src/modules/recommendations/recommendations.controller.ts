import {
  Controller,
  Get,
  Post,
  Query,
  Body,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { RecommendationsService } from './recommendations.service';
import { ScoringWeights } from './recommendations-engine.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { IsNumber, IsOptional, Max, Min } from 'class-validator';

export class GenerateRecommendationsDto {
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(30)
  limit?: number;

  @IsOptional()
  weights?: Partial<ScoringWeights>;
}

@ApiTags('Recommendations')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get personalized AI hybrid recommendations' })
  @ApiQuery({ name: 'refresh', type: Boolean, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  async getRecommendations(
    @CurrentUser() user: AuthUser,
    @Query('refresh') refresh?: string,
    @Query('limit') limit?: string,
  ) {
    const isRefresh = refresh === 'true';
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.recommendationsService.getRecommendations(
      user.userId,
      isRefresh,
      limitNum,
    );
  }

  @Post('generate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Force generate new AI recommendations and notify user' })
  async generateRecommendations(
    @CurrentUser() user: AuthUser,
    @Body() dto: GenerateRecommendationsDto,
  ) {
    return this.recommendationsService.generateAndNotify(
      { id: user.userId, email: user.email, name: user.name },
      dto.limit || 10,
    );
  }

  @Get('history')
  @ApiOperation({ summary: 'Get previous recommendation run snapshots' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  async getHistory(
    @CurrentUser() user: AuthUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    return this.recommendationsService.getRecommendationHistory(
      user.userId,
      pageNum,
      limitNum,
    );
  }
}
