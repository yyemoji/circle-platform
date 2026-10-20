import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { AccountStore } from './account.store';
@Injectable()
export class AccountService {
  constructor(@Inject(AccountStore) private store: AccountStore) {}
  async profile(userId: string) { const profile = await this.store.getProfile(userId); if (!profile) throw new NotFoundException(); return profile; }
  async updateProfile(userId: string, data: { displayName?: string; avatarUrl?: string | null; bio?: string | null }) {
    if (data.displayName !== undefined && (data.displayName.trim().length < 2 || data.displayName.length > 40)) throw new BadRequestException('昵称长度不合法');
    if (data.bio && data.bio.length > 500) throw new BadRequestException('简介过长');
    const before = await this.profile(userId); const after = await this.store.updateProfile(userId, data);
    await this.store.createAudit({ actorId: userId, action: 'profile.update', entityType: 'User', entityId: userId, before, after }); return after;
  }
  async bindDevice(userId: string, input: { fingerprint?: string; name?: string }) {
    if (!input.fingerprint?.trim() || !input.name?.trim()) throw new BadRequestException('设备参数不合法');
    if (await this.store.findDevice(input.fingerprint)) throw new ConflictException('设备已绑定');
    const device = await this.store.createDevice(userId, input.fingerprint, input.name);
    await this.store.createAudit({ actorId: userId, action: 'device.bind', entityType: 'Device', entityId: device.id, before: null, after: device }); return device;
  }
  async report(userId: string, input: { targetType?: string; targetId?: string; reason?: string }) {
    if (!input.targetType || !input.targetId || !input.reason?.trim()) throw new BadRequestException('举报参数不完整');
    const report = await this.store.createReport(userId, input.targetType, input.targetId, input.reason);
    await this.store.createAudit({ actorId: userId, action: 'report.create', entityType: 'Report', entityId: report.id, before: null, after: report }); return report;
  }
  async reportStatus(userId: string, reportId: string) { const report = await this.store.getReport(userId, reportId); if (!report) throw new NotFoundException(); return report; }
  audit(userId: string) { return this.store.listAudit(userId); }
  async apply(userId: string, type: 'ACCOUNT_MERGE' | 'JOIN_US', payload: unknown) { const application = await this.store.createApplication(userId, type, payload); await this.store.createAudit({ actorId: userId, action: 'application.create', entityType: 'Application', entityId: application.id, before: null, after: application }); return application; }
  applications(userId: string) { return this.store.listApplications(userId); }
  allAudit() { return this.store.listAllAudit(); }
}
