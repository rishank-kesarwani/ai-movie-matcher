import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { WatchlistsService } from './watchlists.service';
import { AddWatchlistDto, UpdateWatchlistStatusDto } from './dto/watchlist.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/interfaces/auth-user.interface';
import { WatchlistStatus } from '../../common/enums/movie.enum';

@ApiTags('Watchlist')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/watchlist')
export class WatchlistsController {
  constructor(private readonly watchlistsService: WatchlistsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user watchlist with optional status filtering' })
  @ApiQuery({ name: 'status', enum: WatchlistStatus, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  @ApiQuery({ name: 'limit', type: Number, required: false })
  async getWatchlist(
    @CurrentUser() user: AuthUser,
    @Query('status') status?: WatchlistStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.watchlistsService.getWatchlist(
      user.userId,
      status,
      pageNum,
      limitNum,
    );
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a movie to watchlist' })
  async addToWatchlist(
    @CurrentUser() user: AuthUser,
    @Body() dto: AddWatchlistDto,
  ) {
    return this.watchlistsService.addToWatchlist(user.userId, dto);
  }

  @Delete(':movieId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a movie from watchlist' })
  async removeFromWatchlist(
    @CurrentUser() user: AuthUser,
    @Param('movieId', ParseIntPipe) movieId: number,
  ) {
    const deleted = await this.watchlistsService.removeFromWatchlist(
      user.userId,
      movieId,
    );
    return { success: deleted, message: 'Movie removed from watchlist' };
  }

  @Patch(':movieId/status')
  @ApiOperation({ summary: 'Update watchlist item status (Plan to watch, Watching, Completed)' })
  async updateStatus(
    @CurrentUser() user: AuthUser,
    @Param('movieId', ParseIntPipe) movieId: number,
    @Body() dto: UpdateWatchlistStatusDto,
  ) {
    return this.watchlistsService.updateStatus(
      user.userId,
      movieId,
      dto.status,
    );
  }

  @Get(':movieId/check')
  @ApiOperation({ summary: 'Check if a movie is in user watchlist' })
  async checkWatchlist(
    @CurrentUser() user: AuthUser,
    @Param('movieId', ParseIntPipe) movieId: number,
  ) {
    const item = await this.watchlistsService.isMovieInWatchlist(
      user.userId,
      movieId,
    );
    return { inWatchlist: Boolean(item), item };
  }
}
