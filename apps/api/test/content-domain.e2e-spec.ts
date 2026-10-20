import { hash } from '@node-rs/argon2'; import { INestApplication } from '@nestjs/common'; import { Test } from '@nestjs/testing'; import request from 'supertest';
import { AppModule } from '../src/app.module'; import { AuthStore } from '../src/auth/auth.store'; import { MemoryAuthStore } from '../src/auth/memory-auth.store'; import { ContentStore } from '../src/content/content.store'; import { MemoryContentStore } from '../src/content/memory-content.store';

describe('circle content and moderation APIs', () => {
  let app: INestApplication; let anchorToken: string; let reviewerToken: string; let postId: string;
  beforeAll(async () => {
    const passwordHash = await hash('Password123!');
    const authStore = new MemoryAuthStore([
      { id: 'anchor', username: 'anchor', displayName: '主播', passwordHash, status: 'ACTIVE', failedLoginCount: 0, lockedUntil: null, roles: ['USER', 'ANCHOR'], permissions: ['content:read', 'content:write'] },
      { id: 'reviewer', username: 'reviewer2', displayName: '审核员', passwordHash, status: 'ACTIVE', failedLoginCount: 0, lockedUntil: null, roles: ['REVIEWER'], permissions: ['content:review'] },
    ]);
    const module = await Test.createTestingModule({ imports: [AppModule] }).overrideProvider(AuthStore).useValue(authStore).overrideProvider(ContentStore).useValue(new MemoryContentStore()).compile();
    app = module.createNestApplication(); app.setGlobalPrefix('api'); await app.init();
    anchorToken = (await request(app.getHttpServer()).post('/api/auth/login').send({ username: 'anchor', password: 'Password123!' })).body.accessToken;
    reviewerToken = (await request(app.getHttpServer()).post('/api/auth/login').send({ username: 'reviewer2', password: 'Password123!' })).body.accessToken;
  });
  afterAll(async () => app.close());
  const auth = (token: string) => ({ authorization: `Bearer ${token}` });

  it('creates a circle, invitation and tagged circle dynamic', async () => {
    const circle = await request(app.getHttpServer()).post('/api/circles').set(auth(anchorToken)).send({ name: '主播生活', description: '测试圈子', entryCoins: 99 }).expect(201);
    await request(app.getHttpServer()).post(`/api/circles/${circle.body.id}/invites`).set(auth(anchorToken)).send({ maxUses: 10 }).expect(201).expect((res) => expect(res.body.code).toHaveLength(8));
    const post = await request(app.getHttpServer()).post('/api/content').set(auth(anchorToken)).send({ circleId: circle.body.id, kind: 'CIRCLE_DYNAMIC', title: '直播预告', body: '今晚八点见', tags: ['直播', '预告'] }).expect(201);
    postId = post.body.id; expect(post.body.status).toBe('DRAFT');
  });
  it('submits, reviews, favorites, and comments with replies', async () => {
    await request(app.getHttpServer()).post(`/api/content/${postId}/submit`).set(auth(anchorToken)).expect(201);
    await request(app.getHttpServer()).post(`/api/moderation/content/${postId}`).set(auth(reviewerToken)).send({ status: 'APPROVED' }).expect(201);
    await request(app.getHttpServer()).post(`/api/content/${postId}/favorite`).set(auth(anchorToken)).expect(201);
    const comment = await request(app.getHttpServer()).post(`/api/content/${postId}/comments`).set(auth(anchorToken)).send({ body: '期待开播' }).expect(201);
    await request(app.getHttpServer()).post(`/api/content/${postId}/comments`).set(auth(anchorToken)).send({ body: '谢谢支持', parentId: comment.body.id }).expect(201);
    await request(app.getHttpServer()).get(`/api/content/${postId}/comments`).expect(200).expect((res) => expect(res.body[0].replies).toHaveLength(1));
  });
  it('blocks author moderation and supports paged approved queries', async () => {
    await request(app.getHttpServer()).post(`/api/moderation/content/${postId}`).set(auth(anchorToken)).send({ status: 'OFFLINE' }).expect(403);
    await request(app.getHttpServer()).get('/api/content?status=APPROVED&page=1&pageSize=10&tag=直播').expect(200).expect((res) => expect(res.body.items).toHaveLength(1));
  });
});
