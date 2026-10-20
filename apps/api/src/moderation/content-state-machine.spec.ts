import { BadRequestException } from '@nestjs/common';
import { describe, expect, it } from 'vitest';
import { transitionContent } from './content-state-machine';

describe('content moderation state machine', () => {
  it.each([
    ['DRAFT', 'PENDING'],
    ['PENDING', 'APPROVED'],
    ['PENDING', 'REJECTED'],
    ['REJECTED', 'DRAFT'],
    ['APPROVED', 'OFFLINE'],
  ] as const)('allows %s -> %s', (from, to) => expect(transitionContent(from, to, to === 'REJECTED' ? '内容不符合规范' : undefined)).toBe(to));

  it.each([
    ['DRAFT', 'APPROVED'],
    ['APPROVED', 'DRAFT'],
    ['OFFLINE', 'APPROVED'],
  ] as const)('rejects %s -> %s', (from, to) => expect(() => transitionContent(from, to)).toThrow(BadRequestException));

  it('requires a rejection reason', () => expect(() => transitionContent('PENDING', 'REJECTED', '')).toThrow(BadRequestException));
});
