import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { In, Repository } from 'typeorm';
import type { CurrentUser } from './auth/current-user.decorator';
import { RegisterDto } from './dto/auth.dto';
import { Bookmark } from './entities/bookmark.entity';
import { Course } from './entities/course.entity';
import { CourseProgress } from './entities/course-progress.entity';
import { Order } from './entities/order.entity';
import { Review } from './entities/review.entity';
import { User, UserRole } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly users: Repository<User>,
    @InjectRepository(UserProfile)
    private readonly profiles: Repository<UserProfile>,
    @InjectRepository(Bookmark)
    private readonly bookmarks: Repository<Bookmark>,
    @InjectRepository(Course)
    private readonly courses: Repository<Course>,
    @InjectRepository(CourseProgress)
    private readonly progresses: Repository<CourseProgress>,
    @InjectRepository(Order)
    private readonly orders: Repository<Order>,
    @InjectRepository(Review)
    private readonly reviews: Repository<Review>,
  ) {}

  async create(dto: RegisterDto): Promise<User> {
    const exists = await this.users.findOne({ where: { email: dto.email } });
    if (exists) throw new ConflictException('이미 사용 중인 이메일입니다.');

    const role =
      dto.role === UserRole.ADMIN
        ? UserRole.STUDENT
        : (dto.role ?? UserRole.STUDENT);
    const user = this.users.create({
      email: dto.email,
      name: dto.name,
      role,
      passwordHash: await bcrypt.hash(dto.password, 10),
      isActive: true,
    });
    const saved = await this.users.save(user);
    await this.ensureProfile(saved);
    return saved;
  }

  findAll() {
    return this.users.find({ order: { createdAt: 'DESC' } }).then((users) =>
      users.map((user) => ({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      })),
    );
  }

  async findOne(id: number): Promise<User> {
    const user = await this.users.findOne({ where: { id } });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');
    return user;
  }

  findByEmail(email: string): Promise<User | null> {
    return this.users.findOne({ where: { email } });
  }

  saveRefreshToken(userId: number, hash: string) {
    return this.users.update(userId, { refreshTokenHash: hash });
  }

  clearRefreshToken(userId: number) {
    return this.users.update(userId, { refreshTokenHash: null });
  }

  async getMyPage(currentUser: CurrentUser) {
    const user = await this.findOne(currentUser.id);
    const profile = await this.ensureProfile(user);
    const userReviews = await this.reviews.find({
      where: { user: { id: currentUser.id } },
      relations: { course: true },
      order: { createdAt: 'DESC' },
    });
    const bookmarks = await this.bookmarks.find({
      where: { user: { id: currentUser.id } },
      relations: { course: { teacher: true } },
      order: { createdAt: 'DESC' },
    });
    const orders = await this.orders.find({
      where: { user: { id: currentUser.id } },
      relations: { items: { course: { teacher: true } } },
      order: { createdAt: 'DESC' },
    });

    const isInstructor =
      currentUser.role === UserRole.TEACHER ||
      currentUser.role === UserRole.ADMIN;
    const progressItems = await this.progresses.find({
      where: { user: { id: currentUser.id } },
      relations: { course: { teacher: true } },
      order: { updatedAt: 'DESC' },
    });
    const studentCourses = isInstructor
      ? await this.getInstructorCourses(currentUser.id)
      : this.getStudentCourses(progressItems, orders);
    const instructorStudents = isInstructor
      ? await this.getInstructorStudents(currentUser.id)
      : [];
    const avgProgress = progressItems.length
      ? Math.round(
          progressItems.reduce((sum, item) => sum + item.progressPercent, 0) /
            progressItems.length,
        )
      : profile.progressPercent;
    const completedCount = isInstructor
      ? instructorStudents.filter(
          (item) => item.progress.progressPercent >= 100,
        ).length
      : progressItems.filter((item) => item.progressPercent >= 100).length ||
        profile.completedCount;

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      stats: {
        enrolledCount: isInstructor
          ? instructorStudents.length
          : studentCourses.length,
        completedCount,
        progressPercent: isInstructor
          ? this.average(
              instructorStudents.map((item) => item.progress.progressPercent),
            )
          : avgProgress,
        reviewCount: userReviews.length,
        bookmarkCount: bookmarks.length,
        orderCount: orders.length,
        courseCount: isInstructor ? studentCourses.length : undefined,
      },
      courses: studentCourses,
      instructorStudents,
      bookmarks: bookmarks.map((bookmark) => ({
        id: bookmark.id,
        createdAt: bookmark.createdAt,
        course: this.serializeCourse(bookmark.course),
      })),
      orders: orders.map((order) => ({
        id: order.id,
        totalPrice: order.totalPrice,
        status: order.status,
        createdAt: order.createdAt,
        items: order.items.map((item) => ({
          id: item.id,
          price: item.price,
          course: this.serializeCourse(item.course),
        })),
      })),
    };
  }

  private async ensureProfile(user: User) {
    const exists = await this.profiles.findOne({
      where: { user: { id: user.id } },
    });
    if (exists) return exists;
    return this.profiles.save(this.profiles.create({ user }));
  }

  private getStudentCourses(progressItems: CourseProgress[], orders: Order[]) {
    const byCourse = new Map<
      number,
      ReturnType<UserService['serializeCourse']> & {
        progress: ReturnType<UserService['serializeProgress']>;
      }
    >();

    for (const order of orders) {
      for (const item of order.items) {
        if (!byCourse.has(item.course.id)) {
          byCourse.set(item.course.id, {
            ...this.serializeCourse(item.course),
            progress: this.emptyProgress(item.course),
          });
        }
      }
    }

    for (const progress of progressItems) {
      byCourse.set(progress.course.id, {
        ...this.serializeCourse(progress.course),
        progress: this.serializeProgress(progress, progress.course),
      });
    }

    return [...byCourse.values()];
  }

  private async getInstructorCourses(userId: number) {
    const courses = await this.courses.find({
      where: { teacher: { id: userId } },
      relations: { teacher: true },
      order: { createdAt: 'DESC' },
    });
    return courses.map((course) => this.serializeCourse(course));
  }

  private async getInstructorStudents(userId: number) {
    const courses = await this.courses.find({
      where: { teacher: { id: userId } },
      relations: { teacher: true },
    });
    const courseIds = courses.map((course) => course.id);
    if (courseIds.length === 0) return [];
    const byCourseId = new Map(courses.map((course) => [course.id, course]));
    const studentProgress = new Map<
      string,
      {
        id: number;
        student: { id: number; email: string; name: string; role: UserRole };
        course: ReturnType<UserService['serializeCourse']>;
        progress: ReturnType<UserService['emptyProgress']>;
        updatedAt: Date;
      }
    >();

    const teacherOrders = await this.orders.find({
      relations: { user: true, items: { course: { teacher: true } } },
      order: { createdAt: 'DESC' },
    });

    for (const order of teacherOrders) {
      for (const item of order.items) {
        if (!courseIds.includes(item.course.id)) continue;
        const course = byCourseId.get(item.course.id) ?? item.course;
        const key = `${order.user.id}:${item.course.id}`;
        if (!studentProgress.has(key)) {
          studentProgress.set(key, {
            id: Number(`${order.user.id}${item.course.id}`),
            student: {
              id: order.user.id,
              email: order.user.email,
              name: order.user.name,
              role: order.user.role,
            },
            course: this.serializeCourse(course),
            progress: this.emptyProgress(course),
            updatedAt: order.createdAt,
          });
        }
      }
    }

    const progresses = await this.progresses.find({
      where: { course: { id: In(courseIds) } },
      relations: { user: true, course: { teacher: true } },
      order: { updatedAt: 'DESC' },
    });

    for (const progress of progresses) {
      const key = `${progress.user.id}:${progress.course.id}`;
      studentProgress.set(key, {
        id: progress.id,
        student: {
          id: progress.user.id,
          email: progress.user.email,
          name: progress.user.name,
          role: progress.user.role,
        },
        course: this.serializeCourse(progress.course),
        progress: this.serializeProgress(progress, progress.course),
        updatedAt: progress.updatedAt,
      });
    }

    return [...studentProgress.values()].sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    );
  }

  private serializeProgress(progress: CourseProgress, course: Course) {
    return {
      completedCount: progress.completedCount ?? 0,
      totalCount: progress.totalCount || course.curriculum?.length || 0,
      progressPercent: progress.progressPercent ?? 0,
      lastChapterIndex: progress.lastChapterIndex ?? 0,
    };
  }

  private emptyProgress(course: Course) {
    return {
      completedCount: 0,
      totalCount: course.curriculum?.length ?? 0,
      progressPercent: 0,
      lastChapterIndex: 0,
    };
  }

  private average(values: number[]) {
    return values.length
      ? Math.round(
          values.reduce((sum, value) => sum + value, 0) / values.length,
        )
      : 0;
  }

  private serializeCourse(course: Course) {
    return {
      id: course.id,
      title: course.title,
      category: course.category,
      description: course.description,
      thumbnail: course.thumbnail,
      price: course.price,
      originalPrice: course.originalPrice,
      badge: course.badge,
      duration: course.duration,
      tag: course.tag,
      isPublished: course.isPublished,
      curriculum: course.curriculum ?? [],
      rating: 0,
      reviewCount: 0,
      teacher: course.teacher
        ? {
            id: course.teacher.id,
            email: course.teacher.email,
            name: course.teacher.name,
            role: course.teacher.role,
          }
        : null,
    };
  }
}
