import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { CurrentUser } from './auth/current-user.decorator';
import { UpdateProgressDto } from './dto/progress.dto';
import { Course } from './entities/course.entity';
import { CourseProgress } from './entities/course-progress.entity';
import { User } from './entities/user.entity';

@Injectable()
export class ProgressService {
  constructor(
    @InjectRepository(CourseProgress)
    private readonly progresses: Repository<CourseProgress>,
    @InjectRepository(Course)
    private readonly courses: Repository<Course>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async findOne(courseId: number, currentUser: CurrentUser) {
    const course = await this.findCourse(courseId);
    const progress = await this.progresses.findOne({
      where: { user: { id: currentUser.id }, course: { id: courseId } },
    });
    return this.serialize(progress, course);
  }

  async update(
    courseId: number,
    dto: UpdateProgressDto,
    currentUser: CurrentUser,
  ) {
    const course = await this.findCourse(courseId);
    const user = await this.users.findOne({ where: { id: currentUser.id } });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    const totalCount = course.curriculum?.length ?? 0;
    const completedCount = Math.min(dto.completedCount, totalCount);
    const progressPercent =
      totalCount === 0 ? 0 : Math.floor((completedCount / totalCount) * 100);

    let progress = await this.progresses.findOne({
      where: { user: { id: currentUser.id }, course: { id: courseId } },
    });
    if (!progress) {
      progress = this.progresses.create({ user, course });
    }

    const currentCompletedCount = progress.completedCount ?? 0;
    const currentProgressPercent = progress.progressPercent ?? 0;

    progress.completedCount = Math.max(currentCompletedCount, completedCount);
    progress.totalCount = totalCount;
    progress.progressPercent = Math.max(
      currentProgressPercent,
      progressPercent,
    );
    progress.lastChapterIndex = Math.max(0, completedCount - 1);

    return this.serialize(await this.progresses.save(progress), course);
  }

  private async findCourse(courseId: number) {
    const course = await this.courses.findOne({ where: { id: courseId } });
    if (!course) throw new NotFoundException('강의를 찾을 수 없습니다.');
    return course;
  }

  private serialize(progress: CourseProgress | null, course: Course) {
    const totalCount = course.curriculum?.length ?? progress?.totalCount ?? 0;
    return {
      completedCount: progress?.completedCount ?? 0,
      totalCount,
      progressPercent: progress?.progressPercent ?? 0,
      lastChapterIndex: progress?.lastChapterIndex ?? 0,
    };
  }
}
