export type RoleCode = 'USER' | 'ANCHOR' | 'REVIEWER' | 'ADMIN';
export interface LoginRequest { username: string; password: string }
export interface AuthUser { id: string; username: string; displayName: string; roles: RoleCode[]; permissions: string[] }
export interface TokenPair { accessToken: string; refreshToken: string; expiresIn: number }
export interface LoginResponse extends TokenPair { user: AuthUser }
