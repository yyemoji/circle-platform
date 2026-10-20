import { BadRequestException, Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';

export type AdminAudit = { id: string; action: string; operatorId: string; targetId: string; detail: Record<string, unknown>; createdAt: string };

@Injectable()
export class AdminService {
  private readonly audits: AdminAudit[] = [];
  private readonly balances = new Map<string, number>();
  dashboard() { return { cards: [{ label: '注册用户', value: 1280 }, { label: '认证主播', value: 86 }, { label: '今日订单', value: 42 }, { label: '待审核', value: 7 }], trend: [18, 25, 22, 31, 38, 42, 56], updatedAt: new Date().toISOString() }; }
  users() { return [{ id: 'user-1', username: '姜姜668', displayName: '姜姜', roles: ['USER', 'ANCHOR'], status: 'ACTIVE', coins: this.balances.get('user-1') ?? 1000 }, { id: 'admin', username: 'admin', displayName: '平台管理员', roles: ['ADMIN'], status: 'ACTIVE', coins: 0 }]; }
  anchors() { return [{ id: 'anchor-1', displayName: '姜姜', verified: true, followers: 3280, liveStatus: 'OFFLINE' }]; }
  operations() { return { liveRooms: [{ id: 'room-1', title: '穿搭分享', status: 'ENDED', viewers: 268 }], riskEvents: [], notices: [{ id: 'notice-1', title: '平台使用规范', status: 'PUBLISHED' }] }; }
  commerce() { return { orders: [{ id: 'order-1', orderNo: 'AC202610210001', user: '姜姜668', amount: 199, status: 'PAID' }], refunds: [], paymentChannels: [{ code: 'SANDBOX', enabled: true }] }; }
  config() { return { payment: { provider: 'sandbox', merchantId: 'sandbox', apiKey: '••••••••' }, live: { provider: 'mediamtx', appId: 'local', secretKey: '••••••••' }, registration: { enabled: true, reviewRequired: false } }; }
  adjustWallet(operatorId: string, body: { userId?: string; amount?: number; reason?: string }) {
    if (!body.userId || !Number.isInteger(body.amount) || body.amount === 0 || !body.reason?.trim()) throw new BadRequestException('用户、整数金额和原因必填');
    const amount = body.amount as number;
    const balance = (this.balances.get(body.userId) ?? 0) + amount;
    if (balance < 0) throw new BadRequestException('余额不足');
    this.balances.set(body.userId, balance);
    const audit = { id: randomUUID(), action: 'WALLET_ADJUST', operatorId, targetId: body.userId, detail: { amount, reason: body.reason, balance }, createdAt: new Date().toISOString() };
    this.audits.unshift(audit); return { balance, auditId: audit.id };
  }
  audit() { return this.audits; }
  usersCsv() { const rows = this.users().map((user) => [user.id, user.username, user.displayName, user.status, user.coins]); return ['id,username,displayName,status,coins', ...rows.map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(','))].join('\n'); }
}
