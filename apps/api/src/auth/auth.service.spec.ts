import { hash } from '@node-rs/argon2';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { describe, expect, it } from 'vitest';
import { AuthService } from './auth.service';
import { MemoryAuthStore } from './memory-auth.store';

async function fixture() {
  const store = new MemoryAuthStore([{ id: 'u1', username: 'demo', displayName: 'Demo', passwordHash: await hash('Correct123!'), status: 'ACTIVE', failedLoginCount: 0, lockedUntil: null, roles: ['USER'], permissions: ['profile:read'] }]);
  const jwt = new JwtService({ secret: 'test-access-secret-at-least-32-characters' });
  return { store, service: new AuthService(store, jwt, { accessSecret: 'test-access-secret-at-least-32-characters', refreshSecret: 'test-refresh-secret-at-least-32-characters' }) };
}

describe('AuthService', () => {
  it('authenticates and rotates a refresh token exactly once', async () => {
    const { service } = await fixture();
    const login = await service.login('demo', 'Correct123!');
    expect(login.user.username).toBe('demo');
    const rotated = await service.refresh(login.refreshToken);
    expect(rotated.refreshToken).not.toBe(login.refreshToken);
    await expect(service.refresh(login.refreshToken)).rejects.toBeInstanceOf(UnauthorizedException);
  });
  it('locks an account after five bad passwords', async () => {
    const { service, store } = await fixture();
    for (let attempt = 0; attempt < 5; attempt += 1) await expect(service.login('demo', 'wrongxx')).rejects.toBeInstanceOf(UnauthorizedException);
    expect((await store.findByUsername('demo'))?.status).toBe('LOCKED');
    await expect(service.login('demo', 'Correct123!')).rejects.toBeInstanceOf(UnauthorizedException);
  });
});
