import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserRole } from '../entities/user.entity';

export type CurrentUser = {
  id: number;
  email: string;
  role: UserRole;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUser => {
    const request = ctx.switchToHttp().getRequest<{ user: CurrentUser }>();
    return request.user;
  },
);
