import { CanActivate, ExecutionContext, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AUTH_SECRETS } from './auth.tokens';
import type { AuthSecrets } from './auth.service';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(@Inject(JwtService) private readonly jwt: JwtService, @Inject(AUTH_SECRETS) private readonly secrets: AuthSecrets) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<{ headers: { authorization?: string }; user?: unknown }>();
    const [scheme, token] = request.headers.authorization?.split(' ') ?? [];
    if (scheme !== 'Bearer' || !token) throw new UnauthorizedException('请先登录');
    try { request.user = await this.jwt.verifyAsync(token, { secret: this.secrets.accessSecret }); return true; }
    catch { throw new UnauthorizedException('访问令牌无效'); }
  }
}
