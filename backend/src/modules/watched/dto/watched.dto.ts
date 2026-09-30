import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MarkWatchedDto {
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

  @ApiPropertyOptional({ example: 9.5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(10)
  userRating?: number;

  @ApiPropertyOptional({ example: 'Spectacular cinematic masterpiece with sublime Hans Zimmer score.' })
  @IsOptional()
  @IsString()
  review?: string;

  @ApiPropertyOptional({ example: [12, 18, 878] })
  @IsOptional()
  @IsArray()
  genreIds?: number[];
}
