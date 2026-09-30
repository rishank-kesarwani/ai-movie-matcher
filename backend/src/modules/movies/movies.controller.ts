import {
  Controller,
  Get,
  Param,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MoviesService } from './movies.service';
import { Public } from '../../common/decorators/public.decorator';

@ApiTags('Movies')
@Controller('api/v1/movies')
export class MoviesController {
  constructor(private readonly moviesService: MoviesService) {}

  @Public()
  @Get('trending')
  @ApiOperation({ summary: 'Get trending movies (day or week)' })
  @ApiQuery({ name: 'timeWindow', enum: ['day', 'week'], required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  async getTrending(
    @Query('timeWindow') timeWindow?: 'day' | 'week',
    @Query('page') page?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    return this.moviesService.getTrending(timeWindow || 'week', pageNum);
  }

  @Public()
  @Get('popular')
  @ApiOperation({ summary: 'Get popular movies' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  async getPopular(@Query('page') page?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    return this.moviesService.getPopular(pageNum);
  }

  @Public()
  @Get('top-rated')
  @ApiOperation({ summary: 'Get top rated movies' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  async getTopRated(@Query('page') page?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    return this.moviesService.getTopRated(pageNum);
  }

  @Public()
  @Get('upcoming')
  @ApiOperation({ summary: 'Get upcoming movies' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  async getUpcoming(@Query('page') page?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    return this.moviesService.getUpcoming(pageNum);
  }

  @Public()
  @Get('genres')
  @ApiOperation({ summary: 'Get list of official movie genres' })
  async getGenres() {
    return this.moviesService.getGenres();
  }

  @Public()
  @Get('search')
  @ApiOperation({ summary: 'Search movies by title/keyword' })
  @ApiQuery({ name: 'q', type: String, required: true })
  @ApiQuery({ name: 'year', type: Number, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  async searchMovies(
    @Query('q') query: string,
    @Query('year') year?: string,
    @Query('page') page?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const yearNum = year ? parseInt(year, 10) : undefined;
    return this.moviesService.searchMovies(query || '', {
      year: yearNum,
      page: pageNum,
    });
  }

  @Public()
  @Get('discover')
  @ApiOperation({ summary: 'Discover movies with multi-criteria filters' })
  @ApiQuery({ name: 'genreId', type: Number, required: false })
  @ApiQuery({ name: 'year', type: Number, required: false })
  @ApiQuery({ name: 'minRating', type: Number, required: false })
  @ApiQuery({ name: 'maxRuntime', type: Number, required: false })
  @ApiQuery({ name: 'sortBy', type: String, required: false })
  @ApiQuery({ name: 'page', type: Number, required: false })
  async discoverMovies(
    @Query('genreId') genreId?: string,
    @Query('year') year?: string,
    @Query('minRating') minRating?: string,
    @Query('maxRuntime') maxRuntime?: string,
    @Query('sortBy') sortBy?: any,
    @Query('page') page?: string,
  ) {
    return this.moviesService.discoverMovies({
      genreId: genreId ? parseInt(genreId, 10) : undefined,
      year: year ? parseInt(year, 10) : undefined,
      minRating: minRating ? parseFloat(minRating) : undefined,
      maxRuntime: maxRuntime ? parseInt(maxRuntime, 10) : undefined,
      sortBy: sortBy || 'popularity.desc',
      page: page ? parseInt(page, 10) : 1,
    });
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Get full movie details, credits, and videos' })
  async getMovieDetails(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.getMovieDetails(id);
  }

  @Public()
  @Get(':id/credits')
  @ApiOperation({ summary: 'Get movie cast and crew credits' })
  async getMovieCredits(@Param('id', ParseIntPipe) id: number) {
    return this.moviesService.getMovieCredits(id);
  }

  @Public()
  @Get(':id/similar')
  @ApiOperation({ summary: 'Get similar movies' })
  @ApiQuery({ name: 'page', type: Number, required: false })
  async getSimilarMovies(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    return this.moviesService.getSimilarMovies(id, pageNum);
  }
}
