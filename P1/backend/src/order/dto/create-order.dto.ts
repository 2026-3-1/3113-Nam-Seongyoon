import { IsNumber, IsArray } from 'class-validator';

export class CreateOrderDto {
  @IsNumber()
  userId: number;

  @IsArray()
  courseIds: number[];
}
