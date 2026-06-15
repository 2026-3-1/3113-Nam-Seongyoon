import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { CurrentUser } from './auth/current-user.decorator';
import { CreateReviewDto, UpdateReviewDto } from './dto/review.dto';
import { Course } from './entities/course.entity';
import { CourseProgress } from './entities/course-progress.entity';
import { Review } from './entities/review.entity';
import { UserRole } from './entities/user.entity';
import { UserService } from './user.service';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private readonly reviews: Repository<Review>,
    @InjectRepository(Course)
    private readonly courses: Repository<Course>,
    @InjectRepository(CourseProgress)
    private readonly progresses: Repository<CourseProgress>,
    private readonly users: UserService,
  ) {}

  findByCourse(courseId: number) {
    return this.reviews
      .find({
        where: { course: { id: courseId } },
        order: { createdAt: 'DESC' },
      })
      .then((reviews) => reviews.map((review) => this.serializeReview(review)));
  }

  async create(
    courseId: number,
    dto: CreateReviewDto,
    currentUser: CurrentUser,
  ) {
    const course = await this.courses.findOne({ where: { id: courseId } });
    if (!course) throw new NotFoundException('강의를 찾을 수 없습니다.');

    const progress = await this.progresses.findOne({
      where: { user: { id: currentUser.id }, course: { id: courseId } },
    });
    if ((progress?.progressPercent ?? 0) < 70) {
      throw new ForbiddenException(
        '강의를 70% 이상 수강한 후 리뷰를 작성할 수 있습니다.',
      );
    }

    const user = await this.users.findOne(currentUser.id);
    const review = this.reviews.create({ ...dto, course, user });
    return this.reviews
      .save(review)
      .then((saved) => this.serializeReview(saved));
  }

  async update(id: number, dto: UpdateReviewDto, currentUser: CurrentUser) {
    const review = await this.reviews.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!review) throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    this.assertOwnerOrAdmin(review, currentUser);

    Object.assign(review, dto);
    return this.reviews
      .save(review)
      .then((saved) => this.serializeReview(saved));
  }

  async remove(id: number, currentUser: CurrentUser) {
    const review = await this.reviews.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!review) throw new NotFoundException('리뷰를 찾을 수 없습니다.');
    this.assertOwnerOrAdmin(review, currentUser);

    await this.reviews.remove(review);
    return { ok: true };
  }

  private assertOwnerOrAdmin(review: Review, currentUser: CurrentUser) {
    const isAdmin = currentUser.role === UserRole.ADMIN;
    const isOwner = review.user?.id === currentUser.id;
    if (!isAdmin && !isOwner)
      throw new ForbiddenException('본인이 작성한 리뷰만 변경할 수 있습니다.');
  }

  private serializeReview(review: Review) {
    return {
      ...review,
      user: {
        id: review.user.id,
        email: review.user.email,
        name: review.user.name,
        role: review.user.role,
      },
    };
  }
}
