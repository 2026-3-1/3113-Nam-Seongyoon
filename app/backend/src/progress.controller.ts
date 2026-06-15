import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser as CurrentUserDecorator } from './auth/current-user.decorator';
import type { CurrentUser } from './auth/current-user.decorator';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { UpdateProgressDto } from './dto/progress.dto';
import { ProgressService } from './progress.service';

@ApiTags('Progress')
@Controller('courses/:courseId/progress')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ProgressController {
  constructor(private readonly progress: ProgressService) {}

  @Get()
  findOne(
    @Param('courseId', ParseIntPipe) courseId: number,
    @CurrentUserDecorator() user: CurrentUser,
  ) {
    return this.progress.findOne(courseId, user);
  }

  @Patch()
  update(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Body() dto: UpdateProgressDto,
    @CurrentUserDecorator() user: CurrentUser,
  ) {
    return this.progress.update(courseId, dto, user);
  }
}
