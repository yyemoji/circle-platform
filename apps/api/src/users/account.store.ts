export interface AccountProfile { id: string; username: string; displayName: string; avatarUrl: string | null; bio: string | null }
export interface AccountDevice { id: string; userId: string; fingerprint: string; name: string; lastSeenAt: Date }
export interface AccountReport { id: string; reporterId: string; targetType: string; targetId: string; reason: string; status: 'SUBMITTED' | 'PROCESSING' | 'RESOLVED' | 'REJECTED' }
export interface AccountAudit { id: string; actorId: string | null; action: string; entityType: string; entityId: string | null; before: unknown; after: unknown; createdAt: Date }
export interface AccountApplication { id: string; userId: string; type: 'ACCOUNT_MERGE' | 'JOIN_US'; status: 'SUBMITTED' | 'PROCESSING' | 'APPROVED' | 'REJECTED'; payload: unknown; createdAt: Date }
export abstract class AccountStore {
  abstract getProfile(userId: string): Promise<AccountProfile | null>;
  abstract updateProfile(userId: string, data: Partial<Pick<AccountProfile, 'displayName' | 'avatarUrl' | 'bio'>>): Promise<AccountProfile>;
  abstract createAudit(data: Omit<AccountAudit, 'id' | 'createdAt'>): Promise<AccountAudit>;
  abstract listAudit(userId: string): Promise<AccountAudit[]>;
  abstract findDevice(fingerprint: string): Promise<AccountDevice | null>;
  abstract createDevice(userId: string, fingerprint: string, name: string): Promise<AccountDevice>;
  abstract createReport(userId: string, targetType: string, targetId: string, reason: string): Promise<AccountReport>;
  abstract getReport(userId: string, reportId: string): Promise<AccountReport | null>;
  abstract createApplication(userId: string, type: AccountApplication['type'], payload: unknown): Promise<AccountApplication>;
  abstract listApplications(userId: string): Promise<AccountApplication[]>;
  abstract listAllAudit(): Promise<AccountAudit[]>;
}
