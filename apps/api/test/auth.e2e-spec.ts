import { hash } from '@node-rs/argon2';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthStore } from '../src/auth/auth.store';
import { MemoryAuthStore } from '../src/auth/memory-auth.store';

describe('authentication API', () => {
  let app: INestApplication;
  beforeAll(async () => {
    const store = new MemoryAuthStore([{ id: 'u1', username: '姜姜668', displayName: '姜姜668', passwordHash: await hash('abc321'), status: 'ACTIVE', failedLoginCount: 0, lockedUntil: null, roles: ['USER'], permissions: ['profile:read'] }]);
    const module = await Test.createTestingModule({ imports: [AppModule] }).overrideProvider(AuthStore).useValue(store).compile();
    app = module.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
    await app.init();
  });
  afterAll(async () => app.close());

  it('logs in, reads identity, rotates once, and logs out', async () => {
    const login = await request(app.getHttpServer()).post('/api/auth/login').send({ username: '姜姜668', password: 'abc321' }).expect(201);
    expect(login.body.user).toMatchObject({ username: '姜姜668', roles: ['USER'] });
    await request(app.getHttpServer()).get('/api/auth/me').set('authorization', `Bearer ${login.body.accessToken}`).expect(200).expect((response) => expect(response.body.sub).toBe('u1'));
    const rotated = await request(app.getHttpServer()).post('/api/auth/refresh').send({ refreshToken: login.body.refreshToken }).expect(201);
    expect(rotated.body.refreshToken).not.toBe(login.body.refreshToken);
    await request(app.getHttpServer()).post('/api/auth/refresh').send({ refreshToken: login.body.refreshToken }).expect(401);
    await request(app.getHttpServer()).post('/api/auth/logout').send({ refreshToken: rotated.body.refreshToken }).expect(201, { success: true });
    await request(app.getHttpServer()).post('/api/auth/refresh').send({ refreshToken: rotated.body.refreshToken }).expect(401);
  });

  it('rejects bad credentials and malformed payloads', async () => {
    await request(app.getHttpServer()).post('/api/auth/login').send({ username: '姜姜668', password: 'wrong!' }).expect(401);
    await request(app.getHttpServer()).post('/api/auth/login').send({ username: '', password: 'x' }).expect(400);
  });
});
