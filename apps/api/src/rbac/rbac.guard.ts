import { CanActivate, ExecutionContext, ForbiddenException, Inject, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { REQUIRED_PERMISSIONS } from './require-permissions.decorator';

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(@Inject(Reflector) private readonly reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(REQUIRED_PERMISSIONS, [context.getHandler(), context.getClass()]) ?? [];
    if (!required.length) return true;
    const user = context.switchToHttp().getRequest<{ user?: { permissions?: string[] } }>().user;
    const granted = user?.permissions ?? [];
    if (granted.includes('*') || required.every((permission) => granted.includes(permission))) return true;
    throw new ForbiddenException('权限不足');
  }
}
