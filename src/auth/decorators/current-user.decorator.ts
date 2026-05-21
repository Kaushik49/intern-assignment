import { createParamDecorator, ExecutionContext } from '@nestjs/common';
// Create a custom decorator named @current user decorator 
// this decorator doesn't know which data will be provided
// and probably it returns user request in the incoming route also
export const CurrentUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
