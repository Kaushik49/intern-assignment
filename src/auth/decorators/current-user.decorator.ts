import { createParamDecorator, ExecutionContext } from '@nestjs/common';
// Create a custom decorator named @current user decorator 
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
