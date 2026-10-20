export interface Profile { id: string; username: string; displayName: string; avatarUrl: string | null; bio: string | null }
export interface Device { id: string; userId: string; fingerprint: string; name: string; lastSeenAt: string }
export type ReportStatus = 'SUBMITTED' | 'PROCESSING' | 'RESOLVED' | 'REJECTED';
export interface Report { id: string; reporterId: string; targetType: string; targetId: string; reason: string; status: ReportStatus }
