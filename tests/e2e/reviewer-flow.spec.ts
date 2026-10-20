import { expect, test } from '@playwright/test';
import { asAdmin } from './helpers';

test('审核员可批量通过待审内容', async ({ page }) => {
  await asAdmin(page);
  let reviewed = false;
  await page.route('**/api/moderation/content/batch', async (route) => {
    reviewed = true;
    await route.fulfill({ status: 201, contentType: 'application/json', body: '[]' });
  });
  await page.goto('http://127.0.0.1:4174/admin/moderation');
  await page.locator('.el-table__body-wrapper .el-checkbox').click();
  await page.getByRole('button', { name: '批量通过' }).click();
  await expect.poll(() => reviewed).toBe(true);
  await expect(page.getByText('今日直播预告')).toHaveCount(0);
});
