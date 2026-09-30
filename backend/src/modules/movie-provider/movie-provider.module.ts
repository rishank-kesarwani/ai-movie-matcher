import { Module } from '@nestjs/common';
import { TmdbMovieProvider } from './tmdb/tmdb.provider';
import { MovieProviderService } from './movie-provider.service';

@Module({
  providers: [TmdbMovieProvider, MovieProviderService],
  exports: [MovieProviderService, TmdbMovieProvider],
})
export class MovieProviderModule {}
