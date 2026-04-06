import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InstructorApplication } from './entities/instructor-application.entity';
import { CreateInstructorApplicationDto } from './dto/create-instructor-application.dto';

@Injectable()
export class InstructorService {
  constructor(
    @InjectRepository(InstructorApplication)
    private readonly appRepo: Repository<InstructorApplication>,
  ) {}

  findAll(): Promise<InstructorApplication[]> {
    return this.appRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<InstructorApplication> {
    const app = await this.appRepo.findOne({ where: { id } });
    if (!app) throw new NotFoundException(`Application #${id} not found`);
    return app;
  }

  create(dto: CreateInstructorApplicationDto): Promise<InstructorApplication> {
    const app = this.appRepo.create(dto);
    return this.appRepo.save(app);
  }

  async updateStatus(id: number, status: string): Promise<InstructorApplication> {
    await this.findOne(id);
    await this.appRepo.update(id, { status });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.appRepo.delete(id);
  }
}
