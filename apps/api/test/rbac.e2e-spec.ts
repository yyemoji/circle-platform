import { Controller, Get, INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { RequirePermissions } from '../src/rbac/require-permissions.decorator';
import { RbacGuard } from '../src/rbac/rbac.guard';

@Controller('secure')
class SecureController {
  @Get('review') @RequirePermissions('content:review') review() { return { allowed: true }; }
}

describe('RBAC guard', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const module = await Test.createTestingModule({ controllers: [SecureController], providers: [RbacGuard] }).compile();
    app = module.createNestApplication();
    app.use((request: { headers: Record<string, string | undefined>; user?: { permissions: string[] } }, _response: unknown, next: () => void) => {
      request.user = { permissions: (request.headers['x-test-permissions'] ?? '').split(',').filter(Boolean) };
      next();
    });
    app.useGlobalGuards(module.get(RbacGuard));
    await app.init();
  });
  afterAll(async () => app.close());
  it('returns 403 without the permission', () => request(app.getHttpServer()).get('/secure/review').set('x-test-permissions', 'profile:read').expect(403));
  it('allows the required permission', () => request(app.getHttpServer()).get('/secure/review').set('x-test-permissions', 'content:review').expect(200, { allowed: true }));
});
