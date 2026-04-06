import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
} from '@nestjs/common';
import { ChapterService } from './chapter.service';
import { CreateChapterDto } from './dto/create-chapter.dto';

@Controller()
export class ChapterController {
  constructor(private readonly chapterService: ChapterService) {}

  // GET /courses/:courseId/chapters
  @Get('courses/:courseId/chapters')
  findByCourse(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.chapterService.findByCourse(courseId);
  }

  // POST /courses/:courseId/chapters
  @Post('courses/:courseId/chapters')
  create(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() dto: Omit<CreateChapterDto, 'courseId'>,
  ) {
    return this.chapterService.create({ ...dto, courseId });
  }

  // PUT /chapters/:id
  @Put('chapters/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateChapterDto>,
  ) {
    return this.chapterService.update(id, dto);
  }

  // DELETE /chapters/:id
  @Delete('chapters/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.chapterService.remove(id);
  }
}
