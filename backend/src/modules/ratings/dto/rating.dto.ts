import { IsNotEmpty, IsNumber, IsOptional, IsString, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RateMovieDto {
  @ApiProperty({ example: 157336 })
  @IsNumber()
  @IsNotEmpty()
  movieId: number;

  @ApiProperty({ example: 'Interstellar' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: 9.5 })
  @IsNumber()
  @Min(1)
  @Max(10)
  rating: number;

  @ApiPropertyOptional({ example: 'Mind blowing sci-fi!' })
  @IsOptional()
  @IsString()
  review?: string;
}
