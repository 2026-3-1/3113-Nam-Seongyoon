import { NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CourseService } from './course.service';
import { Course } from './entities/course.entity';
import { User, UserRole } from './entities/user.entity';
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
  profile: null as any,
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
  curriculum: [{ title: '1강', youtubeUrl: 'https://youtube.com/watch?v=xxx' }],
  isPublished: true,
  teacher: mockTeacher,
  reviews: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('CourseService', () => {
  let courseService: CourseService;
  let courseRepo: { findAndCount: jest.Mock; findOne: jest.Mock; create: jest.Mock; save: jest.Mock; remove: jest.Mock };

  beforeEach(async () => {
    courseRepo = {
      findAndCount: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
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
      expect(courseRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 0, take: 20 }),
      );
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

      await expect(courseService.findOne(999)).rejects.toBeInstanceOf(NotFoundException);
    });
  });
});
