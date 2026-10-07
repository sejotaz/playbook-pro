import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';

/** Usuario autenticado que `JwtAuthGuard` deja en la petición. */
export interface AuthUser {
  id: string;
}

export type RequestWithUser = Request & { user?: AuthUser };

/** Inyecta el usuario autenticado en un método del controller: `@CurrentUser() user: AuthUser`. */
export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext) => {
  const { user } = context.switchToHttp().getRequest<RequestWithUser>();
  if (!user) {
    throw new Error('@CurrentUser se usó en una ruta sin JwtAuthGuard');
  }
  return user;
});
