import { expect, test } from '@playwright/test';

test('home page renders start CTA', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('link', { name: 'Commencer le quiz' })).toBeVisible();
});
