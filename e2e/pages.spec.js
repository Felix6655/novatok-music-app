// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Page Routes', () => {
  test('track detail page renders without errors', async ({ page }) => {
    // Use a known track ID from seed data
    await page.goto('/music/track/t1000000-0000-0000-0000-000000000001');
    await page.waitForLoadState('networkidle');
    
    // Should show track title (Golden)
    await expect(page.getByRole('heading', { name: 'Golden' })).toBeVisible({ timeout: 10000 });
    
    // Should have play button
    await expect(page.locator('button:has-text("Play")')).toBeVisible();
    
    // Should show artist info
    await expect(page.locator('text=Artist')).toBeVisible();
  });

  test('artist page renders without errors', async ({ page }) => {
    // Use a known artist ID from seed data
    await page.goto('/music/artist/a1000000-0000-0000-0000-000000000001');
    await page.waitForLoadState('networkidle');
    
    // Should show artist name (HUNTR/X)
    await expect(page.getByRole('heading', { name: 'HUNTR/X' })).toBeVisible({ timeout: 10000 });
    
    // Should have play all button
    await expect(page.locator('button:has-text("Play All")')).toBeVisible();
  });

  test('album page renders without errors', async ({ page }) => {
    // Use a known album ID from seed data
    await page.goto('/music/album/b1000000-0000-0000-0000-000000000001');
    await page.waitForLoadState('networkidle');
    
    // Should show album title (K-Pop Demon Hunters)
    await expect(page.getByRole('heading', { name: 'K-Pop Demon Hunters' })).toBeVisible({ timeout: 10000 });
    
    // Should have play all button
    await expect(page.locator('button:has-text("Play All")')).toBeVisible();
  });

  test('library page renders without errors', async ({ page }) => {
    await page.goto('/music/library');
    await page.waitForLoadState('networkidle');
    
    // Should show library heading
    await expect(page.getByRole('heading', { name: 'Your Library' })).toBeVisible({ timeout: 10000 });
    
    // Should have tabs for liked and recent
    await expect(page.getByRole('button', { name: 'Liked Songs' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Recent Plays' })).toBeVisible();
  });

  test('lyrics page renders without errors', async ({ page }) => {
    await page.goto('/music/lyrics');
    await page.waitForLoadState('networkidle');
    
    // Should show session title
    await expect(page.locator('input[value="Untitled Session"]')).toBeVisible({ timeout: 10000 });
    
    // Should have lyrics textarea
    await expect(page.locator('textarea')).toBeVisible();
    
    // Should show "No lyrics loaded" initially
    await expect(page.locator('text=No lyrics loaded')).toBeVisible();
  });

  test('karaoke page renders without errors', async ({ page }) => {
    await page.goto('/music/karaoke');
    await page.waitForLoadState('networkidle');
    
    // Should show session title
    await expect(page.locator('input[value="Untitled Session"]')).toBeVisible({ timeout: 10000 });
    
    // Should have fullscreen button
    await expect(page.locator('button').filter({ has: page.locator('svg.lucide-maximize-2') })).toBeVisible();
  });

  test('AI studio page renders with coming soon', async ({ page }) => {
    await page.goto('/music/ai-studio');
    await page.waitForLoadState('networkidle');
    
    // Should show AI Studio heading
    await expect(page.locator('h1:has-text("AI Studio")')).toBeVisible({ timeout: 10000 });
    
    // Should show coming soon badge
    await expect(page.locator('text=Coming Soon')).toBeVisible();
  });

  test('invalid track ID shows not found message', async ({ page }) => {
    await page.goto('/music/track/invalid-id-12345');
    await page.waitForLoadState('networkidle');
    
    // Should show not found message
    await expect(page.locator('text=Track not found')).toBeVisible({ timeout: 10000 });
  });

  test('root path redirects to /music', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Should be on /music
    expect(page.url()).toContain('/music');
  });
});
