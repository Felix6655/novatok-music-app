// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Music Discover Page', () => {
  test.beforeEach(async ({ page }) => {
    // Clear localStorage before each test
    await page.goto('/music');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
  });

  test('should load and display track grid', async ({ page }) => {
    await page.goto('/music');
    await page.waitForLoadState('networkidle');
    
    // Wait for tracks to load
    await expect(page.locator('text=Discover New Music')).toBeVisible({ timeout: 10000 });
    
    // Should show track cards
    const trackCards = page.locator('.group.relative');
    await expect(trackCards.first()).toBeVisible({ timeout: 10000 });
    
    // Should have multiple tracks
    const count = await trackCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should display header with search bar and tabs', async ({ page }) => {
    await page.goto('/music');
    
    // Check header elements
    await expect(page.locator('text=NovaTok Music')).toBeVisible();
    await expect(page.locator('input[placeholder*="Search"]')).toBeVisible();
    await expect(page.locator('text=Discover')).toBeVisible();
    await expect(page.locator('text=Trending')).toBeVisible();
    await expect(page.locator('text=Liked')).toBeVisible();
    await expect(page.locator('text=Recent')).toBeVisible();
  });

  test('should show Guest Mode banner', async ({ page }) => {
    await page.goto('/music');
    
    // Should show guest mode indicator
    await expect(page.locator('text=Guest Mode')).toBeVisible();
  });

  test('should navigate between tabs', async ({ page }) => {
    await page.goto('/music');
    await page.waitForLoadState('networkidle');
    
    // Click Trending tab
    await page.click('text=Trending');
    await expect(page.locator('text=Trending Tracks')).toBeVisible({ timeout: 5000 });
    
    // Click back to Discover
    await page.click('text=Discover');
    await expect(page.locator('text=Discover New Music')).toBeVisible({ timeout: 5000 });
  });

  test('track cards should have required elements', async ({ page }) => {
    await page.goto('/music');
    await page.waitForLoadState('networkidle');
    
    // Wait for first card
    const firstCard = page.locator('.group.relative').first();
    await expect(firstCard).toBeVisible({ timeout: 10000 });
    
    // Should have image
    await expect(firstCard.locator('img').first()).toBeVisible();
    
    // Should have like button (heart icon)
    await expect(firstCard.locator('button').filter({ has: page.locator('svg') })).toHaveCount(2); // play overlay might add more
  });
});
