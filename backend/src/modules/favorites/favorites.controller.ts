import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { AddFavoriteDto } from './dto/favorite.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AuthUser } from '../../common/interfaces/auth-user.interface';

@ApiTags('Favorites')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/favorites')
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user favorites (movies, genres, actors)' })
  @ApiQuery({ name: 'type', enum: ['MOVIE', 'GENRE', 'ACTOR', 'DIRECTOR'], required: false })
  async getFavorites(
    @CurrentUser() user: AuthUser,
    @Query('type') type?: string,
  ) {
    return this.favoritesService.getFavorites(user.userId, type);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Add a favorite item (movie, genre, or actor)' })
  async addFavorite(
    @CurrentUser() user: AuthUser,
    @Body() dto: AddFavoriteDto,
  ) {
    return this.favoritesService.addFavorite(user.userId, dto);
  }

  @Delete(':type/:itemId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Remove a favorite item' })
  async removeFavorite(
    @CurrentUser() user: AuthUser,
    @Param('type') type: string,
    @Param('itemId') itemId: string,
  ) {
    const deleted = await this.favoritesService.removeFavorite(
      user.userId,
      type,
      itemId,
    );
    return { success: deleted, message: 'Removed from favorites' };
  }

  @Get(':type/:itemId/check')
  @ApiOperation({ summary: 'Check if an item is favorited' })
  async checkFavorite(
    @CurrentUser() user: AuthUser,
    @Param('type') type: string,
    @Param('itemId') itemId: string,
  ) {
    const isFav = await this.favoritesService.isFavorite(
      user.userId,
      type,
      itemId,
    );
    return { isFavorite: isFav };
  }
}
