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
import { RatingsService } from './ratings.service';
import { RateMovieDto } from './dto/rating.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/interfaces/auth-user.interface';

@ApiTags('Ratings')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/movies')
export class RatingsController {
  constructor(private readonly ratingsService: RatingsService) {}

  @Post(':movieId/rating')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rate a movie with optional review' })
  async rateMovie(
    @CurrentUser() user: AuthUser,
    @Param('movieId', ParseIntPipe) movieId: number,
    @Body() dto: RateMovieDto,
  ) {
    dto.movieId = movieId;
    return this.ratingsService.rateMovie(user.userId, dto);
  }

  @Get(':movieId/rating')
  @ApiOperation({ summary: 'Get current user rating for a movie' })
  async getUserRating(
    @CurrentUser() user: AuthUser,
    @Param('movieId', ParseIntPipe) movieId: number,
  ) {
    const rating = await this.ratingsService.getUserRating(
      user.userId,
      movieId,
    );
    return { hasRated: Boolean(rating), rating };
  }

  @Delete(':movieId/rating')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete user rating for a movie' })
  async deleteRating(
    @CurrentUser() user: AuthUser,
    @Param('movieId', ParseIntPipe) movieId: number,
  ) {
    const deleted = await this.ratingsService.deleteRating(
      user.userId,
      movieId,
    );
    return { success: deleted, message: 'Rating deleted successfully' };
  }
}
