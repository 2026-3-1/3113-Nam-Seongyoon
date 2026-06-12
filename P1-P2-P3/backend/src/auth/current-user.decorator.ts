import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type CurrentUser = {
  id: number;
  email: string;
  role: string;
};

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUser => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
