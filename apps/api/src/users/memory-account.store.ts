import { randomUUID } from 'node:crypto';
import { AccountApplication, AccountAudit, AccountDevice, AccountProfile, AccountReport, AccountStore } from './account.store';
export class MemoryAccountStore extends AccountStore {
  private profiles = new Map<string, AccountProfile>(); private devices = new Map<string, AccountDevice>(); private reports = new Map<string, AccountReport>(); private applications: AccountApplication[] = []; private audits: AccountAudit[] = [];
  constructor(profiles: AccountProfile[]) { super(); profiles.forEach((p) => this.profiles.set(p.id, { ...p })); }
  async getProfile(id: string) { return this.profiles.get(id) ?? null; }
  async updateProfile(id: string, data: Partial<AccountProfile>) { const current = this.profiles.get(id)!; const next = { ...current, ...data }; this.profiles.set(id, next); return next; }
  async createAudit(data: Omit<AccountAudit, 'id' | 'createdAt'>) { const item = { ...data, id: randomUUID(), createdAt: new Date() }; this.audits.unshift(item); return item; }
  async listAudit(id: string) { return this.audits.filter((item) => item.actorId === id); }
  async findDevice(fingerprint: string) { return this.devices.get(fingerprint) ?? null; }
  async createDevice(userId: string, fingerprint: string, name: string) { const item = { id: randomUUID(), userId, fingerprint, name, lastSeenAt: new Date() }; this.devices.set(fingerprint, item); return item; }
  async createReport(reporterId: string, targetType: string, targetId: string, reason: string) { const item: AccountReport = { id: randomUUID(), reporterId, targetType, targetId, reason, status: 'SUBMITTED' }; this.reports.set(item.id, item); return item; }
  async getReport(userId: string, reportId: string) { const item = this.reports.get(reportId); return item?.reporterId === userId ? item : null; }
  async createApplication(userId: string, type: AccountApplication['type'], payload: unknown) { const item: AccountApplication = { id: randomUUID(), userId, type, payload, status: 'SUBMITTED', createdAt: new Date() }; this.applications.unshift(item); return item; }
  async listApplications(userId: string) { return this.applications.filter((item) => item.userId === userId); }
  async listAllAudit() { return this.audits; }
}
