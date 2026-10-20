import { AuthStore, StoredRefreshToken, StoredUser } from './auth.store';

export class MemoryAuthStore extends AuthStore {
  private readonly users = new Map<string, StoredUser>();
  private readonly tokens = new Map<string, StoredRefreshToken>();
  constructor(users: StoredUser[]) { super(); users.forEach((user) => this.users.set(user.id, { ...user })); }
  async findByUsername(username: string) { return [...this.users.values()].find((user) => user.username === username) ?? null; }
  async findById(id: string) { return this.users.get(id) ?? null; }
  async recordFailure(userId: string, lockUntil: Date | null) { const user = this.users.get(userId); if (user) { user.failedLoginCount += 1; if (lockUntil) { user.status = 'LOCKED'; user.lockedUntil = lockUntil; } } }
  async clearFailures(userId: string) { const user = this.users.get(userId); if (user) { user.failedLoginCount = 0; user.lockedUntil = null; user.status = 'ACTIVE'; } }
  async saveRefreshToken(token: StoredRefreshToken) { this.tokens.set(token.tokenHash, token); }
  async consumeRefreshToken(tokenHash: string) { const token = this.tokens.get(tokenHash); if (!token || token.revokedAt || token.expiresAt <= new Date()) return null; token.revokedAt = new Date(); return token; }
  async revokeUserTokens(userId: string) { this.tokens.forEach((token) => { if (token.userId === userId) token.revokedAt = new Date(); }); }
}
