import { test, expect, devices } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const QUESTION_COUNT = Number.parseInt(process.env.SCREENSHOT_QUESTION_COUNT ?? '4', 10);
const OUTPUT_DIR = process.env.SCREENSHOT_OUTPUT_DIR ?? 'output/playwright/mobile-fullpage';
const { defaultBrowserType: _ignoredDefaultBrowserType, ...IPHONE_13_CHROMIUM } = devices['iPhone 13'];

test.use(IPHONE_13_CHROMIUM);

test('capture mobile full-page screenshots after answer selection', async ({ page }) => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });

  await page.goto('/');
  await page.getByRole('button', { name: 'Explorer toutes les questions' }).click();

  for (let questionIndex = 1; questionIndex <= QUESTION_COUNT; questionIndex += 1) {
    await expect(page.getByText(`Question ${questionIndex} / 30`)).toBeVisible();

    await page.locator('h2 + div button').first().click();
    await expect(page.getByText('Indices à repérer')).toBeVisible();

    const filename = `q${String(questionIndex).padStart(2, '0')}-after-answer.png`;
    await page.screenshot({
      path: path.join(OUTPUT_DIR, filename),
      fullPage: true
    });

    if (questionIndex < QUESTION_COUNT) {
      await page.getByRole('button', { name: 'Question suivante' }).click();
    }
  }
});
