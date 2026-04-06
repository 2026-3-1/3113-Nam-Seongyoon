import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { Category } from '../category/entities/category.entity';
import { Course } from '../course/entities/course.entity';
import { Chapter } from '../chapter/entities/chapter.entity';
import { User } from '../user/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Course, Chapter, User])],
  providers: [SeedService],
})
export class SeedModule {}
