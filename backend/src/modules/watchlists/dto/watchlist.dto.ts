import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WatchlistStatus } from '../../../common/enums/movie.enum';

export class AddWatchlistDto {
  @ApiProperty({ example: 157336 })
  @IsNumber()
  @IsNotEmpty()
  movieId: number;

  @ApiProperty({ example: 'Interstellar' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg' })
  @IsOptional()
  @IsString()
  posterPath?: string;

  @ApiPropertyOptional({ example: '/xJHokMbljvjADYdit5fK5VQsXEG.jpg' })
  @IsOptional()
  @IsString()
  backdropPath?: string;

  @ApiPropertyOptional({ example: 8.4 })
  @IsOptional()
  @IsNumber()
  voteAverage?: number;

  @ApiPropertyOptional({ example: '2014-11-05' })
  @IsOptional()
  @IsString()
  releaseDate?: string;

  @ApiPropertyOptional({ example: [12, 18, 878] })
  @IsOptional()
  @IsArray()
  genreIds?: number[];

  @ApiPropertyOptional({ enum: WatchlistStatus, default: WatchlistStatus.PLAN_TO_WATCH })
  @IsOptional()
  @IsEnum(WatchlistStatus)
  status?: WatchlistStatus;

  @ApiPropertyOptional({ example: 'Recommended by friend for Friday sci-fi night' })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class UpdateWatchlistStatusDto {
  @ApiProperty({ enum: WatchlistStatus })
  @IsEnum(WatchlistStatus)
  status: WatchlistStatus;
}
