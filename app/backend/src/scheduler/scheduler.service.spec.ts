import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CourseProgress } from '../entities/course-progress.entity';
import { Course } from '../entities/course.entity';
import { JobLog, JobStatus } from '../entities/job-log.entity';
import { NotificationService } from '../notification/notification.service';
import { SchedulerService } from './scheduler.service';

const makeCourse = (overrides: Partial<Course> = {}): Course =>
  ({
    id: 1,
    title: '정보처리기사 완성',
    category: '자격증',
    description: '설명',
    thumbnail: '',
    price: 49000,
    originalPrice: null,
    badge: '인증 강사',
    duration: '총 10강',
    tag: null,
    curriculum: [],
    isPublished: true,
    teacher: null,
    reviews: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  }) as Course;

describe('SchedulerService — 배치 통합 테스트', () => {
  let service: SchedulerService;
  let jobLogRepo: {
    find: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
  };
  let courseRepo: {
    find: jest.Mock;
    count: jest.Mock;
    update: jest.Mock;
  };
  let progressRepo: {
    createQueryBuilder: jest.Mock;
  };
  let notificationService: { sendDailyDigest: jest.Mock };

  beforeEach(async () => {
    jobLogRepo = {
      find: jest.fn().mockResolvedValue([]),
      create: jest.fn().mockImplementation((dto: Partial<JobLog>) => dto),
      save: jest.fn().mockResolvedValue({ id: 1 }),
    };
    courseRepo = {
      find: jest.fn().mockResolvedValue([]),
      count: jest.fn().mockResolvedValue(0),
      update: jest.fn().mockResolvedValue({ affected: 1 }),
    };
    const qb = {
      innerJoin: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([]),
    };
    progressRepo = { createQueryBuilder: jest.fn().mockReturnValue(qb) };
    notificationService = {
      sendDailyDigest: jest.fn().mockResolvedValue(true),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SchedulerService,
        { provide: getRepositoryToken(JobLog), useValue: jobLogRepo },
        { provide: getRepositoryToken(Course), useValue: courseRepo },
        { provide: getRepositoryToken(CourseProgress), useValue: progressRepo },
        { provide: NotificationService, useValue: notificationService },
      ],
    }).compile();

    service = module.get<SchedulerService>(SchedulerService);
  });

  // ── dailyDigest ──────────────────────────────────────────────
  describe('dailyDigest()', () => {
    it('신규 강의가 없으면 성공 로그를 저장한다', async () => {
      courseRepo.find.mockResolvedValue([]);

      await service.dailyDigest();

      expect(jobLogRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          jobName: 'daily-digest',
          status: JobStatus.SUCCESS,
        }),
      );
    });

    it('신규 강의가 있으면 ADMIN_MAIL 환경변수가 설정된 경우 알림을 전송한다', async () => {
      const courses = [
        makeCourse({ title: '신규 강의 A' }),
        makeCourse({ id: 2, title: '신규 강의 B' }),
      ];
      courseRepo.find.mockResolvedValue(courses);
      const originalEnv = process.env.ADMIN_MAIL;
      process.env.ADMIN_MAIL = 'admin@certificatedu.dev';

      await service.dailyDigest();

      expect(notificationService.sendDailyDigest).toHaveBeenCalledWith(
        'admin@certificatedu.dev',
        2,
        [
          { title: '신규 강의 A', price: 49000 },
          { title: '신규 강의 B', price: 49000 },
        ],
      );
      expect(jobLogRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: JobStatus.SUCCESS }),
      );

      process.env.ADMIN_MAIL = originalEnv;
    });

    it('ADMIN_MAIL이 없으면 알림을 건너뛴다', async () => {
      courseRepo.find.mockResolvedValue([makeCourse()]);
      delete process.env.ADMIN_MAIL;

      await service.dailyDigest();

      expect(notificationService.sendDailyDigest).not.toHaveBeenCalled();
      expect(jobLogRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: JobStatus.SUCCESS }),
      );
    });

    it('DB 조회 오류 시 FAILED 로그를 저장하고 예외를 삼킨다', async () => {
      courseRepo.find.mockRejectedValue(new Error('DB connection lost'));

      await expect(service.dailyDigest()).resolves.toBeUndefined();

      expect(jobLogRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: JobStatus.FAILED,
          message: 'DB connection lost',
        }),
      );
    });
  });

  // ── publishCheck ─────────────────────────────────────────────
  describe('publishCheck()', () => {
    it('미발행 강의 수를 확인하고 SUCCESS 로그를 저장한다', async () => {
      courseRepo.count.mockResolvedValue(3);

      await service.publishCheck();

      expect(courseRepo.count).toHaveBeenCalledWith({
        where: { isPublished: false },
      });
      expect(jobLogRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          jobName: 'publish-check',
          status: JobStatus.SUCCESS,
        }),
      );
    });

    it('오류 시 FAILED 로그를 저장하고 예외를 삼킨다', async () => {
      courseRepo.count.mockRejectedValue(new Error('timeout'));

      await expect(service.publishCheck()).resolves.toBeUndefined();

      expect(jobLogRepo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: JobStatus.FAILED,
          message: 'timeout',
        }),
      );
    });
  });

  // ── getLogs ───────────────────────────────────────────────────
  describe('getLogs()', () => {
    it('최신순으로 최대 50개 로그를 반환한다', async () => {
      const fakeLogs = [
        { id: 1, jobName: 'daily-digest', status: JobStatus.SUCCESS },
      ];
      jobLogRepo.find.mockResolvedValue(fakeLogs);

      const result = await service.getLogs();

      expect(jobLogRepo.find).toHaveBeenCalledWith({
        order: { createdAt: 'DESC' },
        take: 50,
      });
      expect(result).toEqual(fakeLogs);
    });

    it('limit 파라미터를 전달하면 해당 개수만큼 조회한다', async () => {
      jobLogRepo.find.mockResolvedValue([]);

      await service.getLogs(10);

      expect(jobLogRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({ take: 10 }),
      );
    });
  });
});
