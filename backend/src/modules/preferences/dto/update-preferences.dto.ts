import {
  IsArray,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  Min,
  Max,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePreferencesDto {
  @ApiPropertyOptional({ example: [878, 12, 18], description: 'Genre IDs' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  favoriteGenres?: number[];

  @ApiPropertyOptional({ example: [27], description: 'Disliked genre IDs' })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  dislikedGenres?: number[];

  @ApiPropertyOptional({ example: ['Christopher Nolan', 'Denis Villeneuve'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  favoriteDirectors?: string[];

  @ApiPropertyOptional({ example: ['Leonardo DiCaprio', 'Matthew McConaughey'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  favoriteActors?: string[];

  @ApiPropertyOptional({ example: ['en', 'ja', 'ko'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  preferredLanguages?: string[];

  @ApiPropertyOptional({ example: { minYear: 2000, maxYear: 2026 } })
  @IsOptional()
  @IsObject()
  preferredReleasePeriod?: {
    minYear?: number;
    maxYear?: number;
  };

  @ApiPropertyOptional({ example: { min: 90, max: 180 } })
  @IsOptional()
  @IsObject()
  preferredRuntime?: {
    min?: number;
    max?: number;
  };

  @ApiPropertyOptional({ example: 7.5 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(10)
  minimumRating?: number;
}
