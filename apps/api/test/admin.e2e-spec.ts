import { hash } from '@node-rs/argon2';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthStore } from '../src/auth/auth.store';
import { MemoryAuthStore } from '../src/auth/memory-auth.store';

describe('administration API', () => {
  let app: INestApplication;
  let token: string;
  beforeAll(async () => {
    const passwordHash = await hash('Admin123!');
    const authStore = new MemoryAuthStore([{ id: 'admin', username: 'admin', displayName: '管理员', passwordHash, status: 'ACTIVE', failedLoginCount: 0, lockedUntil: null, roles: ['ADMIN'], permissions: ['*'] }]);
    const module = await Test.createTestingModule({ imports: [AppModule] }).overrideProvider(AuthStore).useValue(authStore).compile();
    app = module.createNestApplication(); app.setGlobalPrefix('api'); await app.init();
    token = (await request(app.getHttpServer()).post('/api/auth/login').send({ username: 'admin', password: 'Admin123!' })).body.accessToken;
  });
  afterAll(async () => app.close());
  const auth = () => ({ authorization: `Bearer ${token}` });

  it('returns dashboard and users without secret fields', async () => {
    await request(app.getHttpServer()).get('/api/admin/dashboard').set(auth()).expect(200).expect((response) => expect(response.body.cards).toHaveLength(4));
    await request(app.getHttpServer()).get('/api/admin/users').set(auth()).expect(200).expect((response) => expect(JSON.stringify(response.body)).not.toMatch(/password|refreshToken/i));
  });
  it('masks configuration secrets', () => request(app.getHttpServer()).get('/api/admin/config').set(auth()).expect(200).expect((response) => expect(response.body.payment.apiKey).toBe('••••••••')));
  it('audits coin adjustments and exports CSV', async () => {
    await request(app.getHttpServer()).post('/api/admin/wallet/adjust').set(auth()).send({ userId: 'user-1', amount: 100, reason: '测试补发' }).expect(201);
    await request(app.getHttpServer()).get('/api/admin/audit').set(auth()).expect(200).expect((response) => expect(response.body[0].action).toBe('WALLET_ADJUST'));
    await request(app.getHttpServer()).get('/api/admin/reports/users.csv').set(auth()).expect(200).expect('Content-Type', /text\/csv/).expect((response) => expect(response.text).toContain('username'));
  });
});
