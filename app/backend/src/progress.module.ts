import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Course } from './entities/course.entity';
import { CourseProgress } from './entities/course-progress.entity';
import { User } from './entities/user.entity';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';

@Module({
  imports: [TypeOrmModule.forFeature([CourseProgress, Course, User])],
  controllers: [ProgressController],
  providers: [ProgressService],
})
export class ProgressModule {}
