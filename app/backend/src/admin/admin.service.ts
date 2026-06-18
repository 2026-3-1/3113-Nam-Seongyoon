import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Course } from '../entities/course.entity';
import { Review } from '../entities/review.entity';
import { User } from '../entities/user.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(Review)
    private readonly reviews: Repository<Review>,
    @InjectRepository(Course)
    private readonly courses: Repository<Course>,
    @InjectDataSource()
    private readonly dataSource: DataSource,
  ) {}

  findAllUsers() {
    return this.users
      .find({ order: { createdAt: 'DESC' } })
      .then((list) =>
        list.map((u) => ({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          isActive: u.isActive,
          createdAt: u.createdAt,
        })),
      );
  }

  async deleteUser(id: number) {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    // courses.teacher 는 onDelete 미설정이므로 NULL 처리 후 삭제
    await this.dataSource.query(
      'UPDATE courses SET teacherId = NULL WHERE teacherId = ?',
      [id],
    );
    await this.users.remove(user);
    return { ok: true };
  }

  findAllReviews() {
    return this.reviews
      .find({
        relations: { user: true, course: true },
        order: { createdAt: 'DESC' },
      })
      .then((list) =>
        list.map((r) => ({
          id: r.id,
          rating: r.rating,
          content: r.content,
          createdAt: r.createdAt,
          user: { id: r.user.id, name: r.user.name, email: r.user.email },
          course: { id: r.course.id, title: r.course.title },
        })),
      );
  }

  async deleteReview(id: number) {
    const review = await this.reviews.findOne({ where: { id } });
    if (!review) throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    await this.reviews.remove(review);
    return { ok: true };
  }

  findAllCourses() {
    return this.courses
      .find({ order: { createdAt: 'DESC' } })
      .then((list) =>
        list.map((c) => ({
          id: c.id,
          title: c.title,
          category: c.category,
          price: c.price,
          isPublished: c.isPublished,
          createdAt: c.createdAt,
          teacher: c.teacher
            ? { id: c.teacher.id, name: c.teacher.name }
            : null,
        })),
      );
  }

  async deleteCourse(id: number) {
    const course = await this.courses.findOne({ where: { id } });
    if (!course) throw new NotFoundException('강의를 찾을 수 없습니다.');
    await this.courses.remove(course);
    return { ok: true };
  }
}
