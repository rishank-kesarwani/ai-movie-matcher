import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WatchedService } from './watched.service';
import { MarkWatchedDto } from './dto/watched.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/interfaces/auth-user.interface';

@ApiTags('Watched')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/watched')
export class WatchedController {
  constructor(private readonly watchedService: WatchedService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user watched history with reviews' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  async getWatchedHistory(
    @CurrentUser() user: AuthUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.watchedService.getWatchedHistory(
      user.userId,
      pageNum,
      limitNum,
    );
  }

  @Post()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark a movie as watched with optional rating and review' })
  async markAsWatched(
    @CurrentUser() user: AuthUser,
    @Body() dto: MarkWatchedDto,
  ) {
    return this.watchedService.markAsWatched(user.userId, dto);
  }

  @Delete(':movieId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a movie from watched history' })
  async unmarkWatched(
    @CurrentUser() user: AuthUser,
    @Param('movieId', ParseIntPipe) movieId: number,
  ) {
    const deleted = await this.watchedService.unmarkWatched(
      user.userId,
      movieId,
    );
    return { success: deleted, message: 'Movie removed from watched list' };
  }

  @Get(':movieId/check')
  @ApiOperation({ summary: 'Check if a movie has been marked watched' })
  async checkWatched(
    @CurrentUser() user: AuthUser,
    @Param('movieId', ParseIntPipe) movieId: number,
  ) {
    const item = await this.watchedService.isMovieWatched(
      user.userId,
      movieId,
    );
    return { isWatched: Boolean(item), item };
  }
}
