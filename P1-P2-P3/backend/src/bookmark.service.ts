import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { CurrentUser } from './auth/current-user.decorator';
import { Bookmark } from './entities/bookmark.entity';
import { Course } from './entities/course.entity';
import { User } from './entities/user.entity';

@Injectable()
export class BookmarkService {
  constructor(
    @InjectRepository(Bookmark)
    private readonly bookmarks: Repository<Bookmark>,
    @InjectRepository(Course)
    private readonly courses: Repository<Course>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
  ) {}

  async findAll(currentUser: CurrentUser) {
    const bookmarks = await this.bookmarks.find({
      where: { user: { id: currentUser.id } },
      relations: { course: { teacher: true } },
      order: { createdAt: 'DESC' },
    });
    return bookmarks.map((bookmark) => this.serialize(bookmark));
  }

  async isBookmarked(courseId: number, currentUser: CurrentUser) {
    const bookmark = await this.bookmarks.findOne({
      where: { user: { id: currentUser.id }, course: { id: courseId } },
    });
    return { bookmarked: Boolean(bookmark) };
  }

  async add(courseId: number, currentUser: CurrentUser) {
    const course = await this.courses.findOne({ where: { id: courseId }, relations: { teacher: true } });
    if (!course) throw new NotFoundException('강의를 찾을 수 없습니다.');

    const exists = await this.bookmarks.findOne({
      where: { user: { id: currentUser.id }, course: { id: courseId } },
      relations: { course: { teacher: true } },
    });
    if (exists) return this.serialize(exists);

    const user = await this.users.findOne({ where: { id: currentUser.id } });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다.');

    const bookmark = await this.bookmarks.save(this.bookmarks.create({ user, course }));
    return this.serialize(bookmark);
  }

  async remove(courseId: number, currentUser: CurrentUser) {
    await this.bookmarks.delete({ user: { id: currentUser.id }, course: { id: courseId } });
    return { ok: true };
  }

  private serialize(bookmark: Bookmark) {
    return {
      id: bookmark.id,
      createdAt: bookmark.createdAt,
      course: {
        ...bookmark.course,
        teacher: bookmark.course.teacher
          ? {
              id: bookmark.course.teacher.id,
              email: bookmark.course.teacher.email,
              name: bookmark.course.teacher.name,
              role: bookmark.course.teacher.role,
            }
          : null,
        rating: 0,
        reviewCount: 0,
        curriculum: bookmark.course.curriculum ?? [],
      },
    };
  }
}
