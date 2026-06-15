import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { LoginDto, RegisterDto } from './dto/auth.dto';
import { User } from './entities/user.entity';
import { UserService } from './user.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UserService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const user = await this.users.create(dto);
    return this.serializeUser(user);
  }

  async login(dto: LoginDto) {
    const user = await this.users.findByEmail(dto.email);
    if (!user)
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok)
      throw new UnauthorizedException(
        '이메일 또는 비밀번호가 올바르지 않습니다.',
      );

    return this.issueTokens(user);
  }

  async refresh(token: string) {
    let payload: { sub: number; email: string; role: string };
    try {
      payload = this.jwt.verify(token, {
        secret: this.config.get<string>(
          'JWT_REFRESH_SECRET',
          'dev-refresh-secret-change-me',
        ),
      });
    } catch {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }

    const user = await this.users.findOne(payload.sub);
    if (!user?.refreshTokenHash)
      throw new UnauthorizedException('로그인이 필요합니다.');

    const valid = await bcrypt.compare(token, user.refreshTokenHash);
    if (!valid)
      throw new UnauthorizedException('리프레시 토큰이 만료되었습니다.');

    return this.issueTokens(user);
  }

  async logout(userId: number) {
    await this.users.clearRefreshToken(userId);
    return { ok: true };
  }

  private async issueTokens(user: User) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwt.sign(payload);
    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.get<string>(
        'JWT_REFRESH_SECRET',
        'dev-refresh-secret-change-me',
      ),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '30d'),
    });

    const hash = await bcrypt.hash(refreshToken, 10);
    await this.users.saveRefreshToken(user.id, hash);

    return {
      accessToken,
      refreshToken,
      user: this.serializeUser(user),
    };
  }

  private serializeUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
}
