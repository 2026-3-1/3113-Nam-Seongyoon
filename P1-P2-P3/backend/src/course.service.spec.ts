import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CourseService } from './course.service';
import { Course } from './entities/course.entity';
import { User, UserRole } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { UserService } from './user.service';

const mockTeacher: User = {
  id: 1,
  email: 'teacher@example.com',
  name: '강사',
  role: UserRole.TEACHER,
  passwordHash: 'hash',
  isActive: true,
  refreshTokenHash: null,
  courses: [],
  reviews: [],
  profile: null as unknown as UserProfile,
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockCourse: Course = {
  id: 1,
  title: '자격증 합격 비법',
  category: 'it',
  description: '자격증 강의입니다.',
  thumbnail: '',
  price: 50000,
  originalPrice: null,
  badge: '인증 강사',
  duration: '총 5강',
  tag: null,
  curriculum: [{ title: '1강', videoUrl: 'https://youtube.com/watch?v=xxx' }],
  isPublished: true,
  teacher: mockTeacher,
  reviews: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('CourseService', () => {
  let courseService: CourseService;
  let courseRepo: {
    findAndCount: jest.Mock;
    findOne: jest.Mock;
    create: jest.Mock;
    save: jest.Mock;
    remove: jest.Mock;
    createQueryBuilder: jest.Mock;
  };

  beforeEach(async () => {
    const qb = {
      select: jest.fn().mockReturnThis(),
      addSelect: jest.fn().mockReturnThis(),
      leftJoin: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      groupBy: jest.fn().mockReturnThis(),
      getRawMany: jest.fn().mockResolvedValue([
        { courseId: 1, avgRating: '4.5', reviewCount: '2' },
      ]),
    };
    courseRepo = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn().mockReturnValue(qb),
    };

    const module = await Test.createTestingModule({
      providers: [
        CourseService,
        { provide: getRepositoryToken(Course), useValue: courseRepo },
        {
          provide: UserService,
          useValue: { findOne: jest.fn().mockResolvedValue(mockTeacher) },
        },
      ],
    }).compile();

    courseService = module.get(CourseService);
  });

  describe('findAll', () => {
    it('페이지네이션 메타와 강의 목록을 반환한다', async () => {
      courseRepo.findAndCount.mockResolvedValue([[mockCourse], 1]);

      const result = await courseService.findAll(1, 20);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.totalPages).toBe(1);
      expect(result.data[0].rating).toBe(4.5);
      expect(result.data[0].reviewCount).toBe(2);
      expect(courseRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
    });

    it('강의가 없으면 createQueryBuilder를 호출하지 않는다', async () => {
      courseRepo.findAndCount.mockResolvedValue([[], 0]);

      const result = await courseService.findAll(1, 20);

      expect(result.data).toHaveLength(0);
      expect(courseRepo.createQueryBuilder).not.toHaveBeenCalled();
    });

    it('limit이 100을 초과하면 100으로 제한한다', async () => {
      courseRepo.findAndCount.mockResolvedValue([[], 0]);

      await courseService.findAll(1, 999);

      expect(courseRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ take: 100 }),
      );
    });
  });

  describe('findOne', () => {
    it('존재하는 강의를 반환한다', async () => {
      courseRepo.findOne.mockResolvedValue(mockCourse);

      const result = await courseService.findOne(1);

      expect(result.id).toBe(1);
      expect(result.title).toBe(mockCourse.title);
    });

    it('없는 강의이면 NotFoundException을 던진다', async () => {
      courseRepo.findOne.mockResolvedValue(null);

      await expect(courseService.findOne(999)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
