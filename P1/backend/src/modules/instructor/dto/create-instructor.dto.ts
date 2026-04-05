import { IsString, IsOptional } from 'class-validator';

export class CreateInstructorDto {
  @IsString()
  name: string;

  @IsString()
  @IsOptional()
  bio?: string;

  @IsString()
  @IsOptional()
  avatar?: string;
}