import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThan, Repository } from 'typeorm';
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

      await this.saveLog('daily-digest', JobStatus.SUCCESS, `신규 강의 ${newCourses.length}개`, Date.now() - start);
      this.logger.log(`[daily-digest] 완료 — 신규 강의 ${newCourses.length}개`);
    } catch (err) {
      await this.saveLog('daily-digest', JobStatus.FAILED, (err as Error).message, Date.now() - start);
      this.logger.error(`[daily-digest] 실패 — ${(err as Error).message}`);
    }
  }

  /** 매시간 — 미발행 강의 자동 발행 체크 (예시 배치) */
  @Cron(CronExpression.EVERY_HOUR, { name: 'publish-check' })
  async publishCheck() {
    const start = Date.now();
    try {
      const unpublished = await this.courses.count({ where: { isPublished: false } });
      await this.saveLog('publish-check', JobStatus.SUCCESS, `미발행 강의 ${unpublished}개 확인`, Date.now() - start);
    } catch (err) {
      await this.saveLog('publish-check', JobStatus.FAILED, (err as Error).message, Date.now() - start);
    }
  }

  async getLogs(limit = 50) {
    return this.jobLogs.find({ order: { createdAt: 'DESC' }, take: limit });
  }

  private saveLog(jobName: string, status: JobStatus, message: string, durationMs: number) {
    return this.jobLogs.save(this.jobLogs.create({ jobName, status, message, durationMs }));
  }
}
