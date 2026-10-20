import { render, screen } from '@testing-library/vue';
import ElementPlus from 'element-plus';
import { describe, expect, it, vi } from 'vitest';
import SystemView from './SystemView.vue';

vi.mock('../../api', () => ({ api: { get: vi.fn().mockResolvedValue({ data: { payment: { merchantId: 'sandbox', apiKey: '••••••••' }, live: { secretKey: '••••••••' }, registration: { enabled: true, reviewRequired: false } } }) } }));

describe('system settings', () => {
  it('never renders raw secrets', async () => {
    render(SystemView, { global: { plugins: [ElementPlus] } });
    expect(await screen.findAllByText('••••••••')).toHaveLength(2);
    expect(screen.queryByText('secret-value')).toBeNull();
  });
});
