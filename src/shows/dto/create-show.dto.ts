import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsInt,
  IsOptional,
  IsNumber,
  Min,
  Max,
} from 'class-validator';

export class CreateShowDto {
  @ApiProperty({ example: 'Breaking Bad' })
  @IsString()
  title!: string;

  @ApiPropertyOptional({ example: 'Chemistry teacher turns criminal' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 2008 })
  @IsInt()
  @Min(1900)
  @Max(2100)
  releaseYear!: number;

  @ApiProperty({ example: 2008 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rating?: number;
}
