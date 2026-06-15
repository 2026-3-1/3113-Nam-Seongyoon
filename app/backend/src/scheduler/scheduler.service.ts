import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
import { CourseProgress } from '../entities/course-progress.entity';
import { Course } from '../entities/course.entity';
import { JobLog, JobStatus } from '../entities/job-log.entity';
import { NotificationService } from '../notification/notification.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    @InjectRepository(JobLog)
    private readonly jobLogs: Repository<JobLog>,
    @InjectRepository(Course)
    private readonly courses: Repository<Course>,
    @InjectRepository(CourseProgress)
    private readonly progresses: Repository<CourseProgress>,
    private readonly notification: NotificationService,
  ) {}

  /** 매일 오전 8시 — 어제 등록된 강의 현황 다이제스트 */
  @Cron(CronExpression.EVERY_DAY_AT_8AM, { name: 'daily-digest' })
  async dailyDigest() {
    const start = Date.now();
    try {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
      const newCourses = await this.courses.find({
        where: { createdAt: MoreThan(since) },
        order: { createdAt: 'DESC' },
        take: 5,
      });

      const adminEmail = process.env.ADMIN_MAIL;
      if (adminEmail) {
        await this.notification.sendDailyDigest(
          adminEmail,
          newCourses.length,
          newCourses.map((c) => ({ title: c.title, price: c.price })),
        );
      }

      await this.saveLog(
        'daily-digest',
        JobStatus.SUCCESS,
        `신규 강의 ${newCourses.length}개`,
        Date.now() - start,
      );
      this.logger.log(`[daily-digest] 완료 — 신규 강의 ${newCourses.length}개`);
    } catch (err) {
      await this.saveLog(
        'daily-digest',
        JobStatus.FAILED,
        (err as Error).message,
        Date.now() - start,
      );
      this.logger.error(`[daily-digest] 실패 — ${(err as Error).message}`);
    }
  }

  /** 매일 자정 — BEST / HOT / NEW 태그 자동 부여 */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { name: 'auto-tag' })
  async autoTag() {
    const start = Date.now();
    try {
      const allCourses = await this.courses.find({
        select: ['id', 'category', 'tag', 'createdAt'],
      });

      const twoWeeksAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // 강의별 전체 수강생 수
      const totalRows = await this.progresses
        .createQueryBuilder('cp')
        .innerJoin('cp.course', 'c')
        .select('c.id', 'courseId')
        .addSelect('COUNT(cp.id)', 'cnt')
        .groupBy('c.id')
        .getRawMany<{ courseId: number; cnt: string }>();
      const totalMap = new Map(totalRows.map((r) => [Number(r.courseId), Number(r.cnt)]));

      // 최근 7일 신규 수강생 수
      const recentRows = await this.progresses
        .createQueryBuilder('cp')
        .innerJoin('cp.course', 'c')
        .select('c.id', 'courseId')
        .addSelect('COUNT(cp.id)', 'cnt')
        .where('cp.createdAt >= :sevenDaysAgo', { sevenDaysAgo })
        .groupBy('c.id')
        .getRawMany<{ courseId: number; cnt: string }>();
      const recentMap = new Map(recentRows.map((r) => [Number(r.courseId), Number(r.cnt)]));

      // BEST: 분야별 수강생 100명 이상인 강의 중 상위 4개
      const bestIds = new Set<number>();
      const byCategory = new Map<string, { id: number; count: number }[]>();
      for (const course of allCourses) {
        const count = totalMap.get(course.id) ?? 0;
        if (!byCategory.has(course.category)) byCategory.set(course.category, []);
        byCategory.get(course.category)!.push({ id: course.id, count });
      }
      for (const list of byCategory.values()) {
        list
          .filter((c) => c.count >= 100)
          .sort((a, b) => b.count - a.count)
          .slice(0, 4)
          .forEach((c) => bestIds.add(c.id));
      }

      // 태그 업데이트
      const updates: Promise<void>[] = [];
      for (const course of allCourses) {
        let newTag: string | null = null;
        if (bestIds.has(course.id)) {
          newTag = 'BEST';
        } else if ((recentMap.get(course.id) ?? 0) >= 5) {
          newTag = 'HOT';
        } else if (new Date(course.createdAt) >= twoWeeksAgo) {
          newTag = 'NEW';
        }
        if (course.tag !== newTag) {
          updates.push(this.courses.update(course.id, { tag: newTag }).then(() => undefined));
        }
      }
      await Promise.all(updates);

      await this.saveLog('auto-tag', JobStatus.SUCCESS, `${updates.length}개 태그 업데이트`, Date.now() - start);
      this.logger.log(`[auto-tag] ${updates.length}개 강의 태그 업데이트`);
    } catch (err) {
      await this.saveLog('auto-tag', JobStatus.FAILED, (err as Error).message, Date.now() - start);
      this.logger.error(`[auto-tag] 실패 — ${(err as Error).message}`);
    }
  }

  /** 매시간 — 미발행 강의 자동 발행 체크 (예시 배치) */
  @Cron(CronExpression.EVERY_HOUR, { name: 'publish-check' })
  async publishCheck() {
    const start = Date.now();
    try {
      const unpublished = await this.courses.count({
        where: { isPublished: false },
      });
      await this.saveLog(
        'publish-check',
        JobStatus.SUCCESS,
        `미발행 강의 ${unpublished}개 확인`,
        Date.now() - start,
      );
    } catch (err) {
      await this.saveLog(
        'publish-check',
        JobStatus.FAILED,
        (err as Error).message,
        Date.now() - start,
      );
    }
  }

  async getLogs(limit = 50) {
    return this.jobLogs.find({ order: { createdAt: 'DESC' }, take: limit });
  }

  private saveLog(
    jobName: string,
    status: JobStatus,
    message: string,
    durationMs: number,
  ) {
    return this.jobLogs.save(
      this.jobLogs.create({ jobName, status, message, durationMs }),
    );
  }
}
