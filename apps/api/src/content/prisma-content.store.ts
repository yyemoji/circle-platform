import { randomUUID } from 'node:crypto'; import { Inject, Injectable } from '@nestjs/common'; import { PrismaService } from '../database/prisma.service'; import type { ContentState } from '../moderation/content-state-machine'; import { CircleRecord, CommentRecord, ContentStore, PostRecord } from './content.store';
@Injectable()
export class PrismaContentStore extends ContentStore {
  constructor(@Inject(PrismaService) private prisma: PrismaService) { super(); }
  createCircle(data: Omit<CircleRecord, 'id' | 'slug'>) { return this.prisma.circle.create({ data: { ...data, slug: `circle-${randomUUID().slice(0, 8)}` } }); }
  listCircles() { return this.prisma.circle.findMany({ orderBy: { createdAt: 'desc' } }); } getCircle(id: string) { return this.prisma.circle.findUnique({ where: { id } }); }
  updateCircle(id: string, data: Partial<Pick<CircleRecord, 'name' | 'description' | 'entryCoins'>>) { return this.prisma.circle.update({ where: { id }, data }); }
  async deleteCircle(id: string) { await this.prisma.circle.delete({ where: { id } }); }
  createInvite(circleId: string, code: string, maxUses: number | null) { return this.prisma.circleInvite.create({ data: { circleId, code, maxUses }, select: { id: true, circleId: true, code: true, maxUses: true } }); }
  async createPost(data: Omit<PostRecord, 'id' | 'status' | 'rejectionReason' | 'createdAt'>) { return this.prisma.post.create({ data }); }
  async getPost(id: string) { return this.prisma.post.findUnique({ where: { id } }); }
  async updatePostState(id: string, status: ContentState, rejectionReason: string | null) { return this.prisma.post.update({ where: { id }, data: { status, rejectionReason } }); }
  async listPosts(q: { status?: ContentState; tag?: string; skip: number; take: number }) { const where = { ...(q.status ? { status: q.status } : {}), ...(q.tag ? { tags: { has: q.tag } } : {}) }; const [items, total] = await this.prisma.$transaction([this.prisma.post.findMany({ where, skip: q.skip, take: q.take, orderBy: { createdAt: 'desc' } }), this.prisma.post.count({ where })]); return { items, total }; }
  async favorite(userId: string, postId: string) { const key = { userId_postId: { userId, postId } }; const found = await this.prisma.favorite.findUnique({ where: key }); if (found) { await this.prisma.favorite.delete({ where: key }); return false; } await this.prisma.favorite.create({ data: { userId, postId } }); return true; }
  async addComment(postId: string, authorId: string, body: string, parentId: string | null) { return this.prisma.comment.create({ data: { postId, authorId, body, parentId } }); }
  async listComments(postId: string): Promise<CommentRecord[]> { return this.prisma.comment.findMany({ where: { postId, parentId: null }, include: { replies: { orderBy: { createdAt: 'asc' } } }, orderBy: { createdAt: 'asc' } }); }
}
