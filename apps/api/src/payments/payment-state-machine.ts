import { BadRequestException } from '@nestjs/common';
export type PaymentState = 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDING' | 'REFUNDED';
const allowed: Record<PaymentState, PaymentState[]> = { PENDING: ['PAID', 'CANCELLED'], PAID: ['REFUNDING'], CANCELLED: [], REFUNDING: ['REFUNDED'], REFUNDED: [] };
export function transitionPayment(from: PaymentState, to: PaymentState) { if (!allowed[from].includes(to)) throw new BadRequestException(`不允许从 ${from} 变更为 ${to}`); return to; }
