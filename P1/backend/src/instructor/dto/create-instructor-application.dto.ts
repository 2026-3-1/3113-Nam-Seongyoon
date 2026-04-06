import { IsString, IsNotEmpty, IsEmail } from 'class-validator';

export class CreateInstructorApplicationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsNotEmpty()
  category: string;

  @IsString()
  @IsNotEmpty()
  careerYears: string;

  @IsString()
  @IsNotEmpty()
  passCount: string;

  @IsString()
  @IsNotEmpty()
  intro: string;
}
