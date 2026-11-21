import { test, expect } from '@playwright/test';

test.describe('CertiFlow Monorepo Foundation Smoke Tests', () => {
  test('Public verification shell loads with clean layout and accessible search input', async ({ page }) => {
    await page.goto('/');

    // Check title or header presence
    await expect(page).toHaveTitle(/CertiFlow/i);
    const searchInput = page.getByPlaceholder(/CERT-2026/i);
    await expect(searchInput).toBeVisible();
  });
});
