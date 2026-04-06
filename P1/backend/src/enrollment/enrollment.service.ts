import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from './entities/enrollment.entity';

@Injectable()
export class EnrollmentService {
  constructor(
    @InjectRepository(Enrollment)
    private readonly enrollmentRepo: Repository<Enrollment>,
  ) {}

  async getByUser(userId: number): Promise<Enrollment[]> {
    return this.enrollmentRepo.find({
      where: { user: { id: userId } },
      order: { enrolledAt: 'DESC' },
    });
  }

  async enroll(userId: number, courseId: number): Promise<Enrollment> {
    const existing = await this.enrollmentRepo.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });
    if (existing) return existing; // 이미 수강 중이면 무시

    const enrollment = this.enrollmentRepo.create({
      user: { id: userId } as any,
      course: { id: courseId } as any,
      progress: 0,
    });
    return this.enrollmentRepo.save(enrollment);
  }

  async updateProgress(
    userId: number,
    courseId: number,
    progress: number,
    lastWatchedChapterId?: number,
  ): Promise<Enrollment> {
    const enrollment = await this.enrollmentRepo.findOne({
      where: { user: { id: userId }, course: { id: courseId } },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');

    enrollment.progress = progress;
    if (lastWatchedChapterId !== undefined) {
      enrollment.lastWatchedChapterId = lastWatchedChapterId;
    }
    return this.enrollmentRepo.save(enrollment);
  }
}
