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
import { InstructorService } from './instructor.service';
import { CreateInstructorApplicationDto } from './dto/create-instructor-application.dto';

@Controller('instructor')
export class InstructorController {
  constructor(private readonly instructorService: InstructorService) {}

  @Get('applications')
  findAll() {
    return this.instructorService.findAll();
  }

  @Get('applications/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.instructorService.findOne(id);
  }

  @Post('apply')
  apply(@Body() dto: CreateInstructorApplicationDto) {
    return this.instructorService.create(dto);
  }

  @Put('applications/:id/status')
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body('status') status: string,
  ) {
    return this.instructorService.updateStatus(id, status);
  }

  @Delete('applications/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.instructorService.remove(id);
  }
}
