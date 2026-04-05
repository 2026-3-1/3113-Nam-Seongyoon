import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Instructor } from './entities/instructor.entity';
import { CreateInstructorDto } from './dto/create-instructor.dto';
import { UpdateInstructorDto } from './dto/update-instructor.dto';

@Injectable()
export class InstructorService {
  constructor(
    @InjectRepository(Instructor)
    private readonly instructorRepo: Repository<Instructor>,
  ) {}

  async create(dto: CreateInstructorDto): Promise<Instructor> {
    const instructor = this.instructorRepo.create(dto);
    return this.instructorRepo.save(instructor);
  }

  async findAll(): Promise<Instructor[]> {
    return this.instructorRepo.find();
  }

  async findOne(id: number): Promise<Instructor> {
    const instructor = await this.instructorRepo.findOne({ where: { id } });
    if (!instructor) throw new NotFoundException('강사를 찾을 수 없습니다.');
    return instructor;
  }

  async update(id: number, dto: UpdateInstructorDto): Promise<Instructor> {
    const instructor = await this.findOne(id);
    Object.assign(instructor, dto);
    return this.instructorRepo.save(instructor);
  }

  async remove(id: number): Promise<void> {
    const instructor = await this.findOne(id);
    await this.instructorRepo.remove(instructor);
  }
}