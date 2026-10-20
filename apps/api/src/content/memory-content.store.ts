import { randomUUID } from 'node:crypto'; import { CircleRecord, CommentRecord, ContentStore, PostRecord } from './content.store'; import type { ContentState } from '../moderation/content-state-machine';
export class MemoryContentStore extends ContentStore {
  private circles = new Map<string, CircleRecord>(); private posts = new Map<string, PostRecord>(); private comments = new Map<string, CommentRecord>(); private favorites = new Set<string>();
  async createCircle(data: Omit<CircleRecord, 'id' | 'slug'>) { const item = { ...data, id: randomUUID(), slug: `circle-${randomUUID().slice(0, 8)}` }; this.circles.set(item.id, item); return item; }
  async listCircles() { return [...this.circles.values()]; } async getCircle(id: string) { return this.circles.get(id) ?? null; }
  async updateCircle(id: string, data: Partial<CircleRecord>) { const item = { ...this.circles.get(id)!, ...data }; this.circles.set(id, item); return item; }
  async deleteCircle(id: string) { this.circles.delete(id); }
  async createInvite(circleId: string, code: string, maxUses: number | null) { return { id: randomUUID(), circleId, code, maxUses }; }
  async createPost(data: Omit<PostRecord, 'id' | 'status' | 'rejectionReason' | 'createdAt'>) { const item: PostRecord = { ...data, id: randomUUID(), status: 'DRAFT', rejectionReason: null, createdAt: new Date() }; this.posts.set(item.id, item); return item; }
  async getPost(id: string) { return this.posts.get(id) ?? null; }
  async updatePostState(id: string, status: ContentState, rejectionReason: string | null) { const item = { ...this.posts.get(id)!, status, rejectionReason }; this.posts.set(id, item); return item; }
  async listPosts(q: { status?: ContentState; tag?: string; skip: number; take: number }) { const all = [...this.posts.values()].filter((p) => (!q.status || p.status === q.status) && (!q.tag || p.tags.includes(q.tag))); return { items: all.slice(q.skip, q.skip + q.take), total: all.length }; }
  async favorite(userId: string, postId: string) { const key = `${userId}:${postId}`; if (this.favorites.has(key)) { this.favorites.delete(key); return false; } this.favorites.add(key); return true; }
  async addComment(postId: string, authorId: string, body: string, parentId: string | null) { const item = { id: randomUUID(), postId, authorId, body, parentId, createdAt: new Date() }; this.comments.set(item.id, item); return item; }
  async listComments(postId: string) { const all = [...this.comments.values()].filter((c) => c.postId === postId); return all.filter((c) => !c.parentId).map((c) => ({ ...c, replies: all.filter((r) => r.parentId === c.id) })); }
}
