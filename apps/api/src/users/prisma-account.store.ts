import { Inject, Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { AccountStore } from './account.store';
@Injectable()
export class PrismaAccountStore extends AccountStore {
  constructor(@Inject(PrismaService) private prisma: PrismaService) { super(); }
  async getProfile(id: string) { return this.prisma.user.findUnique({ where: { id }, select: { id: true, username: true, displayName: true, avatarUrl: true, bio: true } }); }
  async updateProfile(id: string, data: { displayName?: string; avatarUrl?: string | null; bio?: string | null }) { return this.prisma.user.update({ where: { id }, data, select: { id: true, username: true, displayName: true, avatarUrl: true, bio: true } }); }
  async createAudit(data: { actorId: string | null; action: string; entityType: string; entityId: string | null; before: unknown; after: unknown }) { return this.prisma.auditLog.create({ data: { ...data, before: data.before as object, after: data.after as object } }); }
  async listAudit(id: string) { return this.prisma.auditLog.findMany({ where: { actorId: id }, orderBy: { createdAt: 'desc' } }); }
  async findDevice(fingerprint: string) { return this.prisma.device.findUnique({ where: { fingerprint } }); }
  async createDevice(userId: string, fingerprint: string, name: string) { return this.prisma.device.create({ data: { userId, fingerprint, name } }); }
  async createReport(reporterId: string, targetType: string, targetId: string, reason: string) { return this.prisma.report.create({ data: { reporterId, targetType, targetId, reason } }); }
  async getReport(reporterId: string, id: string) { return this.prisma.report.findFirst({ where: { id, reporterId } }); }
  async createApplication(userId: string, type: 'ACCOUNT_MERGE' | 'JOIN_US', payload: unknown) { return this.prisma.application.create({ data: { userId, type, payload: payload as object } }); }
  async listApplications(userId: string) { return this.prisma.application.findMany({ where: { userId }, orderBy: { createdAt: 'desc' } }); }
  async listAllAudit() { return this.prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 500 }); }
}
