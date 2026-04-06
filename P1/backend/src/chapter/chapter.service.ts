import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Chapter } from './entities/chapter.entity';
import { CreateChapterDto } from './dto/create-chapter.dto';

@Injectable()
export class ChapterService {
  constructor(
    @InjectRepository(Chapter)
    private readonly chapterRepo: Repository<Chapter>,
  ) {}

  findByCourse(courseId: number): Promise<Chapter[]> {
    return this.chapterRepo.find({
      where: { course: { id: courseId } },
      order: { sortOrder: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Chapter> {
    const chapter = await this.chapterRepo.findOne({ where: { id } });
    if (!chapter) throw new NotFoundException(`Chapter #${id} not found`);
    return chapter;
  }

  create(dto: CreateChapterDto): Promise<Chapter> {
    const chapter = this.chapterRepo.create({
      title: dto.title,
      duration: dto.duration ?? '00:00',
      sortOrder: dto.sortOrder ?? 0,
      isFree: dto.isFree ?? false,
      course: { id: dto.courseId } as any,
    });
    return this.chapterRepo.save(chapter);
  }

  async update(id: number, dto: Partial<CreateChapterDto>): Promise<Chapter> {
    await this.findOne(id);
    const updateData: any = { ...dto };
    if (dto.courseId) {
      updateData.course = { id: dto.courseId };
      delete updateData.courseId;
    }
    await this.chapterRepo.save({ id, ...updateData });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.chapterRepo.delete(id);
  }
}
