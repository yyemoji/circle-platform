export interface EntryInput { userId: string; amount: number; direction: 'CREDIT' | 'DEBIT'; reason: string }
export interface WalletEntryRecord extends EntryInput { id: string; idempotencyKey: string; balanceAfter: number; createdAt: Date }
export abstract class WalletStore { abstract postAtomic(input: EntryInput, idempotencyKey: string): Promise<WalletEntryRecord>; abstract balance(userId: string): Promise<number>; abstract entries(userId: string): Promise<WalletEntryRecord[]>; }
