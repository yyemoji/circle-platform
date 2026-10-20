export type AuthRole = 'USER' | 'ANCHOR' | 'REVIEWER' | 'ADMIN';
export interface StoredUser { id: string; username: string; displayName: string; passwordHash: string; status: 'ACTIVE' | 'LOCKED' | 'DISABLED'; failedLoginCount: number; lockedUntil: Date | null; roles: AuthRole[]; permissions: string[] }
export interface StoredRefreshToken { tokenHash: string; userId: string; expiresAt: Date; revokedAt: Date | null }

export abstract class AuthStore {
  abstract findByUsername(username: string): Promise<StoredUser | null>;
  abstract findById(id: string): Promise<StoredUser | null>;
  abstract recordFailure(userId: string, lockUntil: Date | null): Promise<void>;
  abstract clearFailures(userId: string): Promise<void>;
  abstract saveRefreshToken(token: StoredRefreshToken): Promise<void>;
  abstract consumeRefreshToken(tokenHash: string): Promise<StoredRefreshToken | null>;
  abstract revokeUserTokens(userId: string): Promise<void>;
}
