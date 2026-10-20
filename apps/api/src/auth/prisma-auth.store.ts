import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AuthStore, StoredRefreshToken, StoredUser } from './auth.store';

@Injectable()
export class PrismaAuthStore extends AuthStore {
  constructor(@Inject(PrismaService) private readonly prisma: PrismaService) { super(); }
  async findByUsername(username: string) { return this.map(await this.prisma.user.findUnique({ where: { username }, include: { roles: { include: { role: true } } } })); }
  async findById(id: string) { return this.map(await this.prisma.user.findUnique({ where: { id }, include: { roles: { include: { role: true } } } })); }
  async recordFailure(userId: string, lockUntil: Date | null) { await this.prisma.user.update({ where: { id: userId }, data: { failedLoginCount: { increment: 1 }, ...(lockUntil ? { status: 'LOCKED', lockedUntil: lockUntil } : {}) } }); }
  async clearFailures(userId: string) { await this.prisma.user.update({ where: { id: userId }, data: { failedLoginCount: 0, lockedUntil: null, status: 'ACTIVE' } }); }
  async saveRefreshToken(token: StoredRefreshToken) { await this.prisma.refreshToken.create({ data: token }); }
  async consumeRefreshToken(tokenHash: string) {
    return this.prisma.$transaction(async (tx) => {
      const token = await tx.refreshToken.findUnique({ where: { tokenHash } });
      if (!token || token.revokedAt || token.expiresAt <= new Date()) return null;
      const result = await tx.refreshToken.updateMany({ where: { id: token.id, revokedAt: null }, data: { revokedAt: new Date() } });
      return result.count === 1 ? token : null;
    });
  }
  async revokeUserTokens(userId: string) { await this.prisma.refreshToken.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } }); }
  private map(user: Awaited<ReturnType<PrismaService['user']['findUnique']>> & { roles?: Array<{ role: { code: string; permissions: string[] } }> } | null): StoredUser | null {
    if (!user) return null;
    const roles = user.roles ?? [];
    return { id: user.id, username: user.username, displayName: user.displayName, passwordHash: user.passwordHash, status: user.status, failedLoginCount: user.failedLoginCount, lockedUntil: user.lockedUntil, roles: roles.map(({ role }) => role.code) as StoredUser['roles'], permissions: [...new Set(roles.flatMap(({ role }) => role.permissions))] };
  }
}
