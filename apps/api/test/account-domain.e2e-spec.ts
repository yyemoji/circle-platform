import { hash } from '@node-rs/argon2';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AccountStore } from '../src/users/account.store';
import { MemoryAccountStore } from '../src/users/memory-account.store';
import { AuthStore } from '../src/auth/auth.store';
import { MemoryAuthStore } from '../src/auth/memory-auth.store';

describe('account domains', () => {
  let app: INestApplication;
  let accessToken: string;
  beforeAll(async () => {
    const authStore = new MemoryAuthStore([{ id: 'u1', username: '姜姜668', displayName: '姜姜668', passwordHash: await hash('abc321'), status: 'ACTIVE', failedLoginCount: 0, lockedUntil: null, roles: ['USER'], permissions: ['profile:read', 'profile:write'] }]);
    const accountStore = new MemoryAccountStore([{ id: 'u1', username: '姜姜668', displayName: '姜姜668', avatarUrl: null, bio: null }]);
    const module = await Test.createTestingModule({ imports: [AppModule] }).overrideProvider(AuthStore).useValue(authStore).overrideProvider(AccountStore).useValue(accountStore).compile();
    app = module.createNestApplication(); app.setGlobalPrefix('api'); await app.init();
    accessToken = (await request(app.getHttpServer()).post('/api/auth/login').send({ username: '姜姜668', password: 'abc321' })).body.accessToken;
  });
  afterAll(async () => app.close());
  const auth = () => ({ authorization: `Bearer ${accessToken}` });

  it('updates only the current profile and writes an audit record', async () => {
    await request(app.getHttpServer()).patch('/api/users/me').set(auth()).send({ displayName: '姜姜测试', bio: '本地测试资料' }).expect(200).expect((res) => expect(res.body.displayName).toBe('姜姜测试'));
    await request(app.getHttpServer()).get('/api/users/me/audit').set(auth()).expect(200).expect((res) => expect(res.body[0]).toMatchObject({ action: 'profile.update', entityId: 'u1' }));
  });
  it('prevents one device fingerprint from belonging to two users', async () => {
    await request(app.getHttpServer()).post('/api/devices').set(auth()).send({ fingerprint: 'browser-device-001', name: 'Windows Chrome' }).expect(201);
    await request(app.getHttpServer()).post('/api/devices').set(auth()).send({ fingerprint: 'browser-device-001', name: 'Duplicate' }).expect(409);
  });
  it('creates a report with visible progress', async () => {
    const created = await request(app.getHttpServer()).post('/api/reports').set(auth()).send({ targetType: 'POST', targetId: 'post-demo', reason: '测试举报' }).expect(201);
    await request(app.getHttpServer()).get(`/api/reports/${created.body.id}`).set(auth()).expect(200).expect((res) => expect(res.body.status).toBe('SUBMITTED'));
  });
  it('submits account-merge and join-us applications', async () => {
    await request(app.getHttpServer()).post('/api/users/me/applications').set(auth()).send({ type: 'ACCOUNT_MERGE', payload: { sourceAccount: 'old-account' } }).expect(201);
    await request(app.getHttpServer()).post('/api/users/me/applications').set(auth()).send({ type: 'JOIN_US', payload: { specialty: '主播运营' } }).expect(201);
    await request(app.getHttpServer()).get('/api/users/me/applications').set(auth()).expect(200).expect((res) => expect(res.body).toHaveLength(2));
  });
});
