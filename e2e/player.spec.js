// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Global Player', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/music');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.waitForLoadState('networkidle');
    // Wait for tracks to load
    await page.waitForSelector('.group.relative', { timeout: 10000 });
  });

  test('clicking play button starts player', async ({ page }) => {
    // Hover over first track to reveal play button
    const firstCard = page.locator('.group.relative').first();
    await firstCard.hover();
    
    // Click the play button overlay
    const playButton = firstCard.locator('button').first();
    await playButton.click({ force: true });
    
    // Mini player should appear at bottom
    await expect(page.locator('.fixed.bottom-0')).toBeVisible({ timeout: 5000 });
    
    // Should show track info in mini player
    const miniPlayer = page.locator('.fixed.bottom-0');
    await expect(miniPlayer.locator('img')).toBeVisible();
  });

  test('player shows pause button when playing', async ({ page }) => {
    // Start playback
    const firstCard = page.locator('.group.relative').first();
    await firstCard.hover();
    await firstCard.locator('button').first().click({ force: true });
    
    // Wait for player
    await page.waitForSelector('.fixed.bottom-0', { timeout: 5000 });
    
    // The card should show "Playing" indicator
    await expect(firstCard.locator('text=Playing')).toBeVisible({ timeout: 5000 });
  });

  test('player persists when navigating to library', async ({ page }) => {
    // Start playback
    const firstCard = page.locator('.group.relative').first();
    await firstCard.hover();
    await firstCard.locator('button').first().click({ force: true });
    
    // Wait for mini player
    await page.waitForSelector('.fixed.bottom-0', { timeout: 5000 });
    
    // Get current track title from mini player
    const miniPlayer = page.locator('.fixed.bottom-0');
    const trackTitle = await miniPlayer.locator('p.text-white.font-medium').first().textContent();
    
    // Navigate to library
    await page.click('text=Liked');
    await page.waitForLoadState('networkidle');
    
    // Mini player should still be visible with same track
    await expect(page.locator('.fixed.bottom-0')).toBeVisible();
    const newTrackTitle = await page.locator('.fixed.bottom-0').locator('p.text-white.font-medium').first().textContent();
    expect(newTrackTitle).toBe(trackTitle);
  });

  test('player persists when navigating to lyrics page', async ({ page }) => {
    // Start playback
    const firstCard = page.locator('.group.relative').first();
    await firstCard.hover();
    await firstCard.locator('button').first().click({ force: true });
    
    // Wait for mini player
    await page.waitForSelector('.fixed.bottom-0', { timeout: 5000 });
    
    // Navigate to lyrics
    await page.click('text=Lyrics');
    await page.waitForLoadState('networkidle');
    
    // Player should still exist (check for progress bar or controls)
    await expect(page.locator('.fixed.bottom-0')).toBeVisible();
  });

  test('player state persists in localStorage', async ({ page }) => {
    // Start playback
    const firstCard = page.locator('.group.relative').first();
    await firstCard.hover();
    await firstCard.locator('button').first().click({ force: true });
    
    // Wait for player
    await page.waitForSelector('.fixed.bottom-0', { timeout: 5000 });
    await page.waitForTimeout(1000); // Give time for state to save
    
    // Check localStorage
    const playerState = await page.evaluate(() => {
      return localStorage.getItem('novatok_player_state');
    });
    
    expect(playerState).not.toBeNull();
    const parsed = JSON.parse(playerState);
    expect(parsed.currentTrack).not.toBeNull();
    expect(parsed.queue).toBeDefined();
  });

  test('expanded player opens when clicking mini player', async ({ page }) => {
    // Start playback
    const firstCard = page.locator('.group.relative').first();
    await firstCard.hover();
    await firstCard.locator('button').first().click({ force: true });
    
    // Wait for mini player
    await page.waitForSelector('.fixed.bottom-0', { timeout: 5000 });
    
    // Click on track info area to expand
    await page.locator('.fixed.bottom-0 .flex.items-center.gap-3').first().click();
    
    // Expanded player should appear (full screen overlay)
    await expect(page.locator('text=Now Playing')).toBeVisible({ timeout: 3000 });
  });
});
