import { Controller, Delete, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser as CurrentUserDecorator } from './auth/current-user.decorator';
import type { CurrentUser } from './auth/current-user.decorator';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { BookmarkService } from './bookmark.service';

@ApiTags('Bookmarks')
@Controller('bookmarks')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BookmarkController {
  constructor(private readonly bookmarks: BookmarkService) {}

  @Get()
  findAll(@CurrentUserDecorator() user: CurrentUser) {
    return this.bookmarks.findAll(user);
  }

  @Get(':courseId')
  isBookmarked(
    @Param('courseId', ParseIntPipe) courseId: number,
    @CurrentUserDecorator() user: CurrentUser,
  ) {
    return this.bookmarks.isBookmarked(courseId, user);
  }

  @Post(':courseId')
  add(
    @Param('courseId', ParseIntPipe) courseId: number,
    @CurrentUserDecorator() user: CurrentUser,
  ) {
    return this.bookmarks.add(courseId, user);
  }

  @Delete(':courseId')
  remove(
    @Param('courseId', ParseIntPipe) courseId: number,
    @CurrentUserDecorator() user: CurrentUser,
  ) {
    return this.bookmarks.remove(courseId, user);
  }
}
