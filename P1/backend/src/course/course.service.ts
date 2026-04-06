import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courseRepo: Repository<Course>,
  ) {}

  findAll(categoryId?: number, search?: string, sort?: string): Promise<Course[]> {
    const qb = this.courseRepo
      .createQueryBuilder('course')
      .leftJoinAndSelect('course.category', 'category');

    if (categoryId) {
      qb.andWhere('category.id = :categoryId', { categoryId });
    }

    if (search) {
      qb.andWhere(
        '(course.title LIKE :search OR course.instructorName LIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (sort === 'rating') {
      qb.orderBy('course.rating', 'DESC');
    } else if (sort === 'price_asc') {
      qb.orderBy('course.price', 'ASC');
    } else if (sort === 'price_desc') {
      qb.orderBy('course.price', 'DESC');
    } else if (sort === 'newest') {
      qb.orderBy('course.createdAt', 'DESC');
    } else {
      qb.orderBy('course.reviewCount', 'DESC');
    }

    return qb.getMany();
  }

  async findOne(id: number): Promise<Course> {
    const course = await this.courseRepo.findOne({
      where: { id },
      relations: ['category', 'chapters', 'reviews', 'reviews.user'],
    });
    if (!course) throw new NotFoundException(`Course #${id} not found`);
    return course;
  }

  async create(dto: CreateCourseDto): Promise<Course> {
    const course = this.courseRepo.create({
      title: dto.title,
      instructorName: dto.instructorName,
      price: dto.price,
      originalPrice: dto.originalPrice,
      tag: dto.tag,
      thumbnail: dto.thumbnail ?? '',
      badge: dto.badge ?? '',
      duration: dto.duration ?? '',
      description: dto.description,
      category: { id: dto.categoryId } as any,
    });
    return this.courseRepo.save(course);
  }

  async update(id: number, dto: Partial<CreateCourseDto>): Promise<Course> {
    await this.findOne(id);
    const updateData: any = { ...dto };
    if (dto.categoryId) {
      updateData.category = { id: dto.categoryId };
      delete updateData.categoryId;
    }
    await this.courseRepo.save({ id, ...updateData });
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    await this.findOne(id);
    await this.courseRepo.delete(id);
  }

  async recalculateRating(courseId: number): Promise<void> {
    const course = await this.courseRepo.findOne({
      where: { id: courseId },
      relations: ['reviews'],
    });
    if (!course) return;
    const count = course.reviews.length;
    if (count === 0) {
      await this.courseRepo.update(courseId, { rating: 0, reviewCount: 0 });
      return;
    }
    const avg = course.reviews.reduce((sum, r) => sum + r.rating, 0) / count;
    await this.courseRepo.update(courseId, {
      rating: Math.round(avg * 10) / 10,
      reviewCount: count,
    });
  }
}
