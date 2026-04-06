import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

export class CreateCourseDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  instructorName: string;

  @IsNumber()
  categoryId: number;

  @IsNumber()
  price: number;

  @IsNumber()
  @IsOptional()
  originalPrice?: number;

  @IsString()
  @IsOptional()
  tag?: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsString()
  @IsOptional()
  badge?: string;

  @IsString()
  @IsOptional()
  duration?: string;

  @IsString()
  @IsOptional()
  description?: string;
}
