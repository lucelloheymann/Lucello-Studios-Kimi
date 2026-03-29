import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to dashboard (assumes auth is handled)
    await page.goto('/dashboard');
  });

  test('should display dashboard title', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
  });

  test('should show KPI cards', async ({ page }) => {
    await expect(page.getByText(/leads gesamt/i)).toBeVisible();
    await expect(page.getByText(/freigabe offen/i)).toBeVisible();
    await expect(page.getByText(/demo erstellt/i)).toBeVisible();
    await expect(page.getByText(/gesendet/i)).toBeVisible();
  });

  test('should navigate to leads page', async ({ page }) => {
    await page.getByRole('link', { name: /leads gesamt/i }).click();
    await expect(page).toHaveURL(/\/leads/);
    await expect(page.getByRole('heading', { name: /leads/i })).toBeVisible();
  });
});
