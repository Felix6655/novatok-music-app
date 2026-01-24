// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Likes and Recents', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/music');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.group.relative', { timeout: 10000 });
  });

  test('liking a track persists in localStorage', async ({ page }) => {
    // Find and click like button on first track
    const firstCard = page.locator('.group.relative').first();
    const likeButton = firstCard.locator('button').filter({ has: page.locator('svg.lucide-heart') }).first();
    await likeButton.click();
    
    // Wait for state to persist
    await page.waitForTimeout(500);
    
    // Check localStorage
    const likes = await page.evaluate(() => {
      return localStorage.getItem('novatok_likes');
    });
    
    expect(likes).not.toBeNull();
    const parsed = JSON.parse(likes);
    expect(parsed.length).toBeGreaterThan(0);
  });

  test('liked track shows in Liked tab', async ({ page }) => {
    // Like a track first
    const firstCard = page.locator('.group.relative').first();
    const likeButton = firstCard.locator('button').filter({ has: page.locator('svg.lucide-heart') }).first();
    await likeButton.click();
    await page.waitForTimeout(500);
    
    // Navigate to Liked tab
    await page.click('text=Liked');
    await page.waitForLoadState('networkidle');
    
    // Should show at least one track
    await expect(page.locator('text=Liked Tracks')).toBeVisible({ timeout: 5000 });
    const trackCards = page.locator('.group.relative');
    const count = await trackCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('liked track persists after page reload', async ({ page }) => {
    // Like a track
    const firstCard = page.locator('.group.relative').first();
    const likeButton = firstCard.locator('button').filter({ has: page.locator('svg.lucide-heart') }).first();
    await likeButton.click();
    await page.waitForTimeout(500);
    
    // Reload the page
    await page.reload();
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('.group.relative', { timeout: 10000 });
    
    // Navigate to Liked tab
    await page.click('text=Liked');
    await page.waitForLoadState('networkidle');
    
    // Should still have the liked track
    const trackCards = page.locator('.group.relative');
    const count = await trackCards.count();
    expect(count).toBeGreaterThan(0);
  });

  test('playing a track adds it to Recent', async ({ page }) => {
    // Play a track
    const firstCard = page.locator('.group.relative').first();
    await firstCard.hover();
    await firstCard.locator('button').first().click({ force: true });
    
    // Wait for it to register
    await page.waitForTimeout(1000);
    
    // Check localStorage for recents
    const recents = await page.evaluate(() => {
      return localStorage.getItem('novatok_recents');
    });
    
    expect(recents).not.toBeNull();
    const parsed = JSON.parse(recents);
    expect(parsed.length).toBeGreaterThan(0);
  });

  test('recently played track shows in Recent tab', async ({ page }) => {
    // Play a track
    const firstCard = page.locator('.group.relative').first();
    await firstCard.hover();
    await firstCard.locator('button').first().click({ force: true });
    await page.waitForTimeout(1000);
    
    // Navigate to Recent tab
    await page.click('text=Recent');
    await page.waitForLoadState('networkidle');
    
    // Should show recently played
    await expect(page.locator('text=Recently Played')).toBeVisible({ timeout: 5000 });
    const trackCards = page.locator('.group.relative');
    const count = await trackCards.count();
    expect(count).toBeGreaterThan(0);
  });
});
