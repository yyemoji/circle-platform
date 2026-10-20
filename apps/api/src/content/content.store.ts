import type { ContentState } from '../moderation/content-state-machine';
export type ContentKind = 'DYNAMIC' | 'CIRCLE_DYNAMIC' | 'MATERIAL';
export interface CircleRecord { id: string; ownerId: string; slug: string; name: string; description: string; entryCoins: number }
export interface PostRecord { id: string; authorId: string; circleId: string | null; kind: ContentKind; title: string; body: string; tags: string[]; status: ContentState; rejectionReason: string | null; createdAt: Date }
export interface CommentRecord { id: string; postId: string; authorId: string; parentId: string | null; body: string; createdAt: Date; replies?: CommentRecord[] }
export abstract class ContentStore {
  abstract createCircle(data: Omit<CircleRecord, 'id' | 'slug'>): Promise<CircleRecord>;
  abstract listCircles(): Promise<CircleRecord[]>;
  abstract getCircle(id: string): Promise<CircleRecord | null>;
  abstract updateCircle(id: string, data: Partial<Pick<CircleRecord, 'name' | 'description' | 'entryCoins'>>): Promise<CircleRecord>;
  abstract deleteCircle(id: string): Promise<void>;
  abstract createInvite(circleId: string, code: string, maxUses: number | null): Promise<{ id: string; circleId: string; code: string; maxUses: number | null }>;
  abstract createPost(data: Omit<PostRecord, 'id' | 'status' | 'rejectionReason' | 'createdAt'>): Promise<PostRecord>;
  abstract getPost(id: string): Promise<PostRecord | null>;
  abstract updatePostState(id: string, status: ContentState, rejectionReason: string | null): Promise<PostRecord>;
  abstract listPosts(query: { status?: ContentState; tag?: string; skip: number; take: number }): Promise<{ items: PostRecord[]; total: number }>;
  abstract favorite(userId: string, postId: string): Promise<boolean>;
  abstract addComment(postId: string, authorId: string, body: string, parentId: string | null): Promise<CommentRecord>;
  abstract listComments(postId: string): Promise<CommentRecord[]>;
}
