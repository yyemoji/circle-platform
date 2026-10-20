import { BadRequestException } from '@nestjs/common';

export type ContentState = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'OFFLINE';
const allowed: Record<ContentState, ContentState[]> = {
  DRAFT: ['PENDING'],
  PENDING: ['APPROVED', 'REJECTED'],
  APPROVED: ['OFFLINE'],
  REJECTED: ['DRAFT'],
  OFFLINE: [],
};

export function transitionContent(from: ContentState, to: ContentState, rejectionReason?: string): ContentState {
  if (!allowed[from].includes(to)) throw new BadRequestException(`不允许从 ${from} 变更为 ${to}`);
  if (to === 'REJECTED' && !rejectionReason?.trim()) throw new BadRequestException('驳回时必须填写原因');
  return to;
}
