import { IsNumber, IsString, IsNotEmpty, Min, Max } from 'class-validator';

export class CreateReviewDto {
  @IsNumber()
  userId: number;

  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @IsNotEmpty()
  content: string;
}
