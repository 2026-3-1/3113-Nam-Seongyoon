import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly users: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'dev-secret-change-me'),
    });
  }

  async validate(payload: { sub: number; email: string; role: string }) {
    const user = await this.users.findByEmail(payload.email).catch(() => null);
    if (!user || user.id !== payload.sub) {
      throw new UnauthorizedException('세션이 만료되었습니다. 다시 로그인해 주세요.');
    }
    return { id: user.id, email: user.email, role: user.role };
  }
}
