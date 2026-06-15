import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser as CurrentUserDecorator } from './auth/current-user.decorator';
import type { CurrentUser } from './auth/current-user.decorator';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';
import { ReviewService } from './review.service';

@ApiTags('Reviews')
@Controller()
export class ReviewController {
  constructor(private readonly reviews: ReviewService) {}

  @Get('courses/:courseId/reviews')
  findByCourse(@Param('courseId', ParseIntPipe) courseId: number) {
    return this.reviews.findByCourse(courseId);
  }

  @Post('courses/:courseId/reviews')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  create(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() dto: CreateReviewDto,
    @CurrentUserDecorator() user: CurrentUser,
  ) {
    return this.reviews.create(courseId, dto, user);
  }

  @Patch('reviews/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateReviewDto,
    @CurrentUserDecorator() user: CurrentUser,
  ) {
    return this.reviews.update(id, dto, user);
  }

  @Delete('reviews/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUserDecorator() user: CurrentUser,
  ) {
    return this.reviews.remove(id, user);
  }
}
