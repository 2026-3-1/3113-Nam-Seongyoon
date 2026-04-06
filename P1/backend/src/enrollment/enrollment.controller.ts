import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  ParseIntPipe,
} from '@nestjs/common';
import { EnrollmentService } from './enrollment.service';

@Controller()
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  // GET /users/:userId/courses
  @Get('users/:userId/courses')
  getByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.enrollmentService.getByUser(userId);
  }

  // PUT /users/:userId/courses/:courseId/progress
  @Put('users/:userId/courses/:courseId/progress')
  updateProgress(
    @Param('userId', ParseIntPipe) userId: number,
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body('progress') progress: number,
    @Body('lastWatchedChapterId') lastWatchedChapterId?: number,
  ) {
    return this.enrollmentService.updateProgress(
      userId,
      courseId,
      progress,
      lastWatchedChapterId,
    );
  }
}
