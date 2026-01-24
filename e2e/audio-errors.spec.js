// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Audio Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/music');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.group.relative', { timeout: 10000 });
  });

  test('tracks with null audio_url show error toast', async ({ page }) => {
    // Navigate to a track with null audio_url (Drift Away or Spark have null URLs)
    await page.goto('/music/track/t1000000-0000-0000-0000-000000000017');
    await page.waitForLoadState('networkidle');
    
    // Click play
    await page.click('button:has-text("Play")');
    
    // Should show toast notification
    await expect(page.locator('text=Audio unavailable')).toBeVisible({ timeout: 5000 });
  });

  test('player handles missing audio gracefully', async ({ page }) => {
    // Go to track detail page for track with no audio
    await page.goto('/music/track/t1000000-0000-0000-0000-000000000018');
    await page.waitForLoadState('networkidle');
    
    // Click play button
    await page.click('button:has-text("Play")');
    
    // App should not crash - page should still be functional
    await expect(page.locator('h1')).toBeVisible();
    
    // Should show error toast
    await expect(page.locator('[data-sonner-toast]')).toBeVisible({ timeout: 5000 });
  });

  test('player UI remains stable after audio error', async ({ page }) => {
    // Try to play track with no audio
    await page.goto('/music/track/t1000000-0000-0000-0000-000000000017');
    await page.waitForLoadState('networkidle');
    await page.click('button:has-text("Play")');
    await page.waitForTimeout(1000);
    
    // Navigation should still work
    await page.click('text=Discover');
    await page.waitForLoadState('networkidle');
    
    // Page should render normally
    await expect(page.locator('text=Discover New Music')).toBeVisible({ timeout: 5000 });
  });
});
