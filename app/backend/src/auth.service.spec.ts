import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User, UserRole } from './entities/user.entity';
import { UserProfile } from './entities/user-profile.entity';
import { UserService } from './user.service';

const mockUser: User = {
  id: 1,
  email: 'test@example.com',
  name: '테스트',
  role: UserRole.STUDENT,
  passwordHash: '',
  isActive: true,
  refreshTokenHash: null,
  emailNotifications: true,
  courses: [],
  reviews: [],
  profile: null as unknown as UserProfile,
  createdAt: new Date(),
  updatedAt: new Date(),
};

describe('AuthService', () => {
  let authService: AuthService;
  let userService: jest.Mocked<
    Pick<
      UserService,
      | 'create'
      | 'findByEmail'
      | 'findOne'
      | 'saveRefreshToken'
      | 'clearRefreshToken'
    >
  >;
  let jwtService: jest.Mocked<Pick<JwtService, 'sign' | 'verify'>>;

  beforeEach(async () => {
    const hash = await bcrypt.hash('password123', 10);
    mockUser.passwordHash = hash;

    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            create: jest.fn(),
            findByEmail: jest.fn(),
            findOne: jest.fn(),
            saveRefreshToken: jest.fn().mockResolvedValue(undefined),
            clearRefreshToken: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-token'),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, def: string) => def),
          },
        },
      ],
    }).compile();

    authService = module.get(AuthService);
    userService = module.get(UserService);
    jwtService = module.get(JwtService);
  });

  describe('register', () => {
    it('새 유저를 생성하고 직렬화된 유저를 반환한다', async () => {
      (userService.create as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.register({
        email: mockUser.email,
        name: mockUser.name,
        password: 'password123',
      });

      expect(result).toEqual({
        id: mockUser.id,
        email: mockUser.email,
        name: mockUser.name,
        role: mockUser.role,
      });
    });

    it('중복 이메일이면 ConflictException을 전파한다', async () => {
      (userService.create as jest.Mock).mockRejectedValue(
        new ConflictException('이미 사용 중인 이메일입니다.'),
      );

      await expect(
        authService.register({
          email: mockUser.email,
          name: '중복',
          password: 'password123',
        }),
      ).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('login', () => {
    it('올바른 자격증명으로 accessToken과 refreshToken을 반환한다', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      const result = await authService.login({
        email: mockUser.email,
        password: 'password123',
      });

      expect(result.accessToken).toBe('mock-token');
      expect(result.refreshToken).toBe('mock-token');
      expect(result.user.email).toBe(mockUser.email);
      expect(userService.saveRefreshToken).toHaveBeenCalled();
    });

    it('존재하지 않는 이메일이면 UnauthorizedException을 던진다', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue(null);

      await expect(
        authService.login({
          email: 'none@example.com',
          password: 'password123',
        }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });

    it('비밀번호가 틀리면 UnauthorizedException을 던진다', async () => {
      (userService.findByEmail as jest.Mock).mockResolvedValue(mockUser);

      await expect(
        authService.login({ email: mockUser.email, password: 'wrongpassword' }),
      ).rejects.toBeInstanceOf(UnauthorizedException);
    });
  });

  describe('logout', () => {
    it('clearRefreshToken을 호출하고 { ok: true }를 반환한다', async () => {
      const result = await authService.logout(mockUser.id);

      expect(userService.clearRefreshToken).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual({ ok: true });
    });
  });

  describe('refresh', () => {
    it('유효하지 않은 토큰이면 UnauthorizedException을 던진다', async () => {
      (jwtService.verify as jest.Mock).mockImplementation(() => {
        throw new Error('invalid');
      });

      await expect(authService.refresh('bad-token')).rejects.toBeInstanceOf(
        UnauthorizedException,
      );
    });
  });
});
