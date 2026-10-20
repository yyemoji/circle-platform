export type ContentStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'OFFLINE';
export type ContentKind = 'DYNAMIC' | 'CIRCLE_DYNAMIC' | 'MATERIAL';
export interface ContentItem { id: string; authorId: string; circleId: string | null; kind: ContentKind; title: string; body: string; tags: string[]; status: ContentStatus; rejectionReason: string | null }
