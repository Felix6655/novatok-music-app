// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Settings Page', () => {
  test('settings page shows Guest Mode status', async ({ page }) => {
    await page.goto('/music/settings');
    await page.waitForLoadState('networkidle');
    
    // Should show Guest Mode Active (exact match in the card title)
    await expect(page.getByText('Guest Mode Active', { exact: true })).toBeVisible({ timeout: 10000 });
    
    // Should show Current Mode section
    await expect(page.getByText('Current Mode')).toBeVisible();
  });

  test('settings page shows env variables section', async ({ page }) => {
    await page.goto('/music/settings');
    await page.waitForLoadState('networkidle');
    
    // Should show NEXT_PUBLIC_SUPABASE_URL
    await expect(page.locator('code:has-text("NEXT_PUBLIC_SUPABASE_URL")')).toBeVisible({ timeout: 10000 });
    
    // Should show Missing badge
    await expect(page.getByText('Missing').first()).toBeVisible();
  });

  test('settings page shows demo data counts', async ({ page }) => {
    await page.goto('/music/settings');
    await page.waitForLoadState('networkidle');
    
    // Should show Demo Data section
    await expect(page.getByText('Demo Data')).toBeVisible({ timeout: 10000 });
    
    // Should show track count (20)
    await expect(page.getByText('20')).toBeVisible();
    await expect(page.getByText('Tracks')).toBeVisible();
  });

  test('settings page has back button', async ({ page }) => {
    await page.goto('/music/settings');
    await page.waitForLoadState('networkidle');
    
    // Should have back link
    const backLink = page.getByRole('link', { name: /Back to Music/i });
    await expect(backLink).toBeVisible({ timeout: 10000 });
    
    // Click back and verify navigation
    await backLink.click();
    await page.waitForLoadState('networkidle');
    expect(page.url()).toContain('/music');
  });
});
