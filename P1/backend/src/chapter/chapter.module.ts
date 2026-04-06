import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Chapter } from './entities/chapter.entity';
import { ChapterService } from './chapter.service';
import { ChapterController } from './chapter.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Chapter])],
  providers: [ChapterService],
  controllers: [ChapterController],
  exports: [ChapterService],
})
export class ChapterModule {}
