import { IsBoolean, IsInt, IsOptional, Min } from 'class-validator';

export class AddCartItemDto {
  @IsInt()
  @Min(1)
  courseId: number;
}

export class UpdateCartItemDto {
  @IsOptional()
  @IsBoolean()
  selected?: boolean;
}
