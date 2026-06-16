import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotificationService } from '../notification/notification.service';
import { Course } from '../entities/course.entity';
import { InstructorSubscription } from '../entities/instructor-subscription.entity';
import { User, UserRole } from '../entities/user.entity';

@Injectable()
export class SubscriptionService {
  constructor(
    @InjectRepository(InstructorSubscription)
    private readonly subs: Repository<InstructorSubscription>,
    @InjectRepository(User)
    private readonly users: Repository<User>,
    private readonly notificationService: NotificationService,
  ) {}

  async getStatus(subscriberId: number, instructorId: number) {
    const sub = await this.subs.findOne({ where: { subscriberId, instructorId } });
    return { subscribed: !!sub };
  }

  async subscribe(subscriberId: number, instructorId: number) {
    const instructor = await this.users.findOne({ where: { id: instructorId } });
    if (!instructor || instructor.role !== UserRole.TEACHER) {
      throw new NotFoundException('강사를 찾을 수 없습니다.');
    }
    const existing = await this.subs.findOne({ where: { subscriberId, instructorId } });
    if (!existing) {
      await this.subs.save(this.subs.create({ subscriberId, instructorId }));
    }
    return { subscribed: true };
  }

  async unsubscribe(subscriberId: number, instructorId: number) {
    await this.subs.delete({ subscriberId, instructorId });
    return { subscribed: false };
  }

  async getMySubscriptions(subscriberId: number) {
    const items = await this.subs.find({
      where: { subscriberId },
      relations: { instructor: true },
      order: { createdAt: 'DESC' },
    });
    return items.map((item) => ({
      id: item.id,
      createdAt: item.createdAt,
      instructor: {
        id: item.instructor.id,
        name: item.instructor.name,
        email: item.instructor.email,
      },
    }));
  }

  async notifyNewCourse(course: Course) {
    if (!course.teacher) return;
    const subs = await this.subs.find({
      where: { instructorId: course.teacher.id },
      relations: { subscriber: true },
    });
    for (const sub of subs) {
      if (sub.subscriber.emailNotifications) {
        await this.notificationService.sendNewCourseNotification(
          sub.subscriber.email,
          sub.subscriber.name,
          course.teacher.name,
          course.title,
          course.id,
        );
      }
    }
  }
}
