import { createHash, randomUUID } from 'node:crypto';
import { verify } from '@node-rs/argon2';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthStore, StoredUser } from './auth.store';

export interface AuthSecrets { accessSecret: string; refreshSecret: string }

@Injectable()
export class AuthService {
  constructor(private readonly store: AuthStore, private readonly jwt: JwtService, private readonly secrets: AuthSecrets) {}

  async login(username: string, password: string) {
    if (!username?.trim() || typeof password !== 'string' || password.length < 6) throw new BadRequestException('登录参数不合法');
    const user = await this.store.findByUsername(username);
    if (!user || user.status !== 'ACTIVE') throw new UnauthorizedException('账号或密码错误');
    if (!(await verify(user.passwordHash, password))) {
      const shouldLock = user.failedLoginCount + 1 >= 5;
      await this.store.recordFailure(user.id, shouldLock ? new Date(Date.now() + 15 * 60_000) : null);
      throw new UnauthorizedException('账号或密码错误');
    }
    await this.store.clearFailures(user.id);
    return { user: this.publicUser(user), ...(await this.issueTokens(user)) };
  }

  async refresh(refreshToken: string) {
    let payload: { sub: string; jti: string };
    try { payload = await this.jwt.verifyAsync(refreshToken, { secret: this.secrets.refreshSecret }); }
    catch { throw new UnauthorizedException('刷新令牌无效'); }
    const consumed = await this.store.consumeRefreshToken(this.digest(refreshToken));
    if (!consumed || consumed.userId !== payload.sub) throw new UnauthorizedException('刷新令牌已使用或失效');
    const user = await this.store.findById(payload.sub);
    if (!user || user.status !== 'ACTIVE') throw new UnauthorizedException('账号不可用');
    return this.issueTokens(user);
  }

  async logout(refreshToken: string): Promise<void> { await this.store.consumeRefreshToken(this.digest(refreshToken)); }

  private async issueTokens(user: StoredUser) {
    const base = { sub: user.id, roles: user.roles, permissions: user.permissions };
    const accessToken = await this.jwt.signAsync(base, { secret: this.secrets.accessSecret, expiresIn: 900 });
    const refreshToken = await this.jwt.signAsync({ sub: user.id, jti: randomUUID(), type: 'refresh' }, { secret: this.secrets.refreshSecret, expiresIn: 604800 });
    await this.store.saveRefreshToken({ tokenHash: this.digest(refreshToken), userId: user.id, expiresAt: new Date(Date.now() + 604800_000), revokedAt: null });
    return { accessToken, refreshToken, expiresIn: 900 };
  }
  private digest(value: string) { return createHash('sha256').update(value).digest('hex'); }
  private publicUser(user: StoredUser) { return { id: user.id, username: user.username, displayName: user.displayName, roles: user.roles, permissions: user.permissions }; }
}
