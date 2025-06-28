import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const ResourceNameParam = createParamDecorator((_: unknown, ctx: ExecutionContext) => {
  const controller = ctx.getClass();
  const instance = ctx.getHandler().bind(controller.prototype);
  return instance().resourceName;
});
