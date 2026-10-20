import { BadRequestException, ForbiddenException, Inject, Injectable, NotFoundException } from '@nestjs/common'; import { randomBytes } from 'node:crypto'; import { transitionContent, ContentState } from '../moderation/content-state-machine'; import { ContentKind, ContentStore } from './content.store';
@Injectable()
export class ContentService {
  constructor(@Inject(ContentStore) private store: ContentStore) {}
  circles() { return this.store.listCircles(); }
  async createCircle(ownerId: string, input: { name?: string; description?: string; entryCoins?: number }) { if (!input.name?.trim() || !input.description?.trim() || !Number.isInteger(input.entryCoins ?? 0) || (input.entryCoins ?? 0) < 0) throw new BadRequestException('圈子参数不合法'); return this.store.createCircle({ ownerId, name: input.name, description: input.description, entryCoins: input.entryCoins ?? 0 }); }
  async updateCircle(ownerId: string, id: string, input: { name?: string; description?: string; entryCoins?: number }) { await this.ownedCircle(ownerId, id); return this.store.updateCircle(id, input); }
  async deleteCircle(ownerId: string, id: string) { await this.ownedCircle(ownerId, id); await this.store.deleteCircle(id); return { success: true }; }
  async invite(ownerId: string, circleId: string, maxUses?: number) { await this.ownedCircle(ownerId, circleId); return this.store.createInvite(circleId, randomBytes(4).toString('hex').toUpperCase(), maxUses ?? null); }
  async create(authorId: string, input: { circleId?: string; kind?: ContentKind; title?: string; body?: string; tags?: string[] }) { if (!input.title?.trim() || !input.body?.trim()) throw new BadRequestException('内容不能为空'); const kind = input.kind ?? 'DYNAMIC'; if (kind === 'CIRCLE_DYNAMIC' && !input.circleId) throw new BadRequestException('圈子动态必须选择圈子'); return this.store.createPost({ authorId, circleId: input.circleId ?? null, kind, title: input.title, body: input.body, tags: [...new Set(input.tags ?? [])].slice(0, 10) }); }
  async submit(authorId: string, id: string) { const post = await this.ownedPost(authorId, id); return this.store.updatePostState(id, transitionContent(post.status, 'PENDING'), null); }
  async moderate(id: string, status: 'APPROVED' | 'REJECTED' | 'OFFLINE', reason?: string) { const post = await this.requiredPost(id); return this.store.updatePostState(id, transitionContent(post.status, status, reason), status === 'REJECTED' ? reason!.trim() : null); }
  async batchModerate(ids: string[], status: 'APPROVED' | 'REJECTED', reason?: string) { return Promise.all(ids.map((id) => this.moderate(id, status, reason))); }
  list(query: { status?: ContentState; tag?: string; page?: number; pageSize?: number }) { const page = Math.max(1, Number(query.page) || 1); const take = Math.min(50, Math.max(1, Number(query.pageSize) || 20)); return this.store.listPosts({ status: query.status ?? 'APPROVED', tag: query.tag, skip: (page - 1) * take, take }); }
  async favorite(userId: string, id: string) { await this.requiredPost(id); return { favorite: await this.store.favorite(userId, id) }; }
  async comment(userId: string, postId: string, input: { body?: string; parentId?: string }) { const post = await this.requiredPost(postId); if (post.status !== 'APPROVED') throw new ForbiddenException('内容尚未发布'); if (!input.body?.trim() || input.body.length > 500) throw new BadRequestException('评论内容不合法'); return this.store.addComment(postId, userId, input.body, input.parentId ?? null); }
  comments(postId: string) { return this.store.listComments(postId); }
  private async ownedCircle(userId: string, id: string) { const item = await this.store.getCircle(id); if (!item) throw new NotFoundException(); if (item.ownerId !== userId) throw new ForbiddenException(); return item; }
  private async requiredPost(id: string) { const post = await this.store.getPost(id); if (!post) throw new NotFoundException(); return post; }
  private async ownedPost(userId: string, id: string) { const post = await this.requiredPost(id); if (post.authorId !== userId) throw new ForbiddenException(); return post; }
}
