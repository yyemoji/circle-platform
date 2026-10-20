export type LedgerDirection = 'CREDIT' | 'DEBIT'; export type OrderStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDING' | 'REFUNDED';
export interface WalletEntry { id: string; amount: number; direction: LedgerDirection; balanceAfter: number; reason: string; idempotencyKey: string }
