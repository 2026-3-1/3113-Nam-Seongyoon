import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { CurrentUser } from './auth/current-user.decorator';
import { CreateCourseDto, UpdateCourseDto } from './dto/course.dto';
import { Course } from './entities/course.entity';
import { UserRole } from './entities/user.entity';
import { UserService } from './user.service';

@Injectable()
export class CourseService {
  constructor(
    @InjectRepository(Course)
    private readonly courses: Repository<Course>,
    private readonly users: UserService,
  ) {}

  async findAll(page = 1, limit = 20) {
    const safePage = Math.max(1, page);
    const safeLimit = Math.min(100, Math.max(1, limit));
    const [courses, total] = await this.courses.findAndCount({
      relations: { reviews: true },
      order: { createdAt: 'DESC' },
      skip: (safePage - 1) * safeLimit,
      take: safeLimit,
    });
    const data = courses.map((course) => {
      const reviews = course.reviews ?? [];
      const rating =
        reviews.length === 0
          ? 0
          : reviews.reduce((sum, review) => sum + review.rating, 0) /
            reviews.length;
      return this.serializeCourse(
        course,
        Number(rating.toFixed(1)),
        reviews.length,
      );
    });
    return {
      data,
      total,
      page: safePage,
      limit: safeLimit,
      totalPages: Math.ceil(total / safeLimit),
    };
  }

  async findOne(id: number) {
    const course = await this.courses.findOne({
      where: { id },
      relations: { reviews: true },
      order: { reviews: { createdAt: 'DESC' } },
    });
    if (!course) throw new NotFoundException('강의를 찾을 수 없습니다.');

    const reviews = course.reviews ?? [];
    const rating =
      reviews.length === 0
        ? 0
        : reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length;
    return this.serializeCourse(
      course,
      Number(rating.toFixed(1)),
      reviews.length,
    );
  }

  async create(dto: CreateCourseDto, currentUser: CurrentUser) {
    this.assertValidPrice(dto.price, dto.originalPrice);
    const teacher = await this.users.findOne(currentUser.id);
    const curriculum = dto.curriculum ?? [];
    const course = this.courses.create({
      ...dto,
      thumbnail: dto.thumbnail ?? '',
      originalPrice: dto.originalPrice ?? null,
      tag: dto.tag ?? null,
      curriculum,
      duration: this.resolveDuration(dto.duration, curriculum),
      teacher,
    });
    return this.courses
      .save(course)
      .then((saved) => this.serializeCourse(saved, 0, 0));
  }

  async update(id: number, dto: UpdateCourseDto, currentUser: CurrentUser) {
    const course = await this.courses.findOne({
      where: { id },
      relations: { teacher: true },
    });
    if (!course) throw new NotFoundException('강의를 찾을 수 없습니다.');
    this.assertOwnerOrAdmin(course, currentUser);
    this.assertValidPrice(
      dto.price ?? course.price,
      dto.originalPrice ?? course.originalPrice ?? undefined,
    );

    Object.assign(course, dto);
    if (dto.curriculum) {
      course.duration = this.resolveDuration(dto.duration, dto.curriculum);
    }
    return this.courses
      .save(course)
      .then((saved) => this.serializeCourse(saved, 0, 0));
  }

  async remove(id: number, currentUser: CurrentUser) {
    const course = await this.courses.findOne({
      where: { id },
      relations: { teacher: true },
    });
    if (!course) throw new NotFoundException('강의를 찾을 수 없습니다.');
    this.assertOwnerOrAdmin(course, currentUser);
    await this.courses.remove(course);
    return { ok: true };
  }

  private assertOwnerOrAdmin(course: Course, currentUser: CurrentUser) {
    const isAdmin = currentUser.role === UserRole.ADMIN;
    const isOwner = course.teacher?.id === currentUser.id;
    if (!isAdmin && !isOwner)
      throw new ForbiddenException('본인이 등록한 강의만 수정할 수 있습니다.');
  }

  private assertValidPrice(price: number, originalPrice?: number | null) {
    if (originalPrice != null && originalPrice > 0 && price > originalPrice) {
      throw new BadRequestException('판매가는 정가보다 클 수 없습니다.');
    }
  }

  private serializeCourse(course: Course, rating: number, reviewCount: number) {
    return {
      ...course,
      reviews: undefined,
      teacher: course.teacher
        ? {
            id: course.teacher.id,
            email: course.teacher.email,
            name: course.teacher.name,
            role: course.teacher.role,
          }
        : null,
      rating,
      reviewCount,
      duration: this.resolveDuration(course.duration, course.curriculum ?? []),
      curriculum: course.curriculum ?? [],
    };
  }

  private resolveDuration(
    duration: string | undefined,
    curriculum: Array<unknown>,
  ) {
    return curriculum.length > 0
      ? `총 ${curriculum.length}강`
      : duration?.trim() || '총 0강';
  }
}
