import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddFavoriteDto {
  @ApiProperty({ enum: ['MOVIE', 'GENRE', 'ACTOR', 'DIRECTOR'] })
  @IsEnum(['MOVIE', 'GENRE', 'ACTOR', 'DIRECTOR'])
  @IsNotEmpty()
  type: 'MOVIE' | 'GENRE' | 'ACTOR' | 'DIRECTOR';

  @ApiProperty({ example: '157336' })
  @IsString()
  @IsNotEmpty()
  itemId: string;

  @ApiProperty({ example: 'Interstellar' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: '/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg' })
  @IsOptional()
  @IsString()
  imagePath?: string;

  @ApiPropertyOptional({ example: 'Sci-Fi masterpiece' })
  @IsOptional()
  @IsString()
  metadata?: string;
}
