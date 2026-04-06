import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InstructorApplication } from './entities/instructor-application.entity';
import { InstructorService } from './instructor.service';
import { InstructorController } from './instructor.controller';

@Module({
  imports: [TypeOrmModule.forFeature([InstructorApplication])],
  providers: [InstructorService],
  controllers: [InstructorController],
})
export class InstructorModule {}
