import { IsString, IsInt, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class CreateShowDto {
  @IsString()
  title!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(1900)
  @Max(2100)
  releaseYear!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  rating?: number;
}