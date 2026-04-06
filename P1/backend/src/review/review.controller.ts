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
import { ReviewService } from './review.service';
import { CourseService } from '../course/course.service';
import { CreateReviewDto } from './dto/create-review.dto';

@Controller()
export class ReviewController {
  constructor(
    private readonly reviewService: ReviewService,
    private readonly courseService: CourseService,
  ) {}

  @Get('courses/:courseId/reviews')
  findByCourse(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.reviewService.findByCourse(courseId);
  }

  @Post('courses/:courseId/reviews')
  async create(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() dto: CreateReviewDto,
  ) {
    const review = await this.reviewService.create(courseId, dto);
    await this.courseService.recalculateRating(courseId);
    return review;
  }

  @Put('reviews/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: Partial<CreateReviewDto>,
  ) {
    const review = await this.reviewService.update(id, dto);
    await this.courseService.recalculateRating((review.course as any)?.id);
    return review;
  }

  @Delete('reviews/:id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    const review = await this.reviewService.findOne(id);
    const courseId = (review.course as any)?.id;
    await this.reviewService.remove(id);
    if (courseId) await this.courseService.recalculateRating(courseId);
  }
}
