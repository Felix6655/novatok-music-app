// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('Search Functionality', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/music');
    await page.waitForLoadState('networkidle');
  });

  test('search bar is visible and functional', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');
    await expect(searchInput).toBeVisible();
    
    // Type in search
    await searchInput.fill('Djo');
    await page.waitForTimeout(500); // Wait for debounce
    
    // Should show search results dropdown
    await expect(page.locator('text=TRACKS').first()).toBeVisible({ timeout: 5000 });
  });

  test('search returns relevant results', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('End of Beginning');
    await page.waitForTimeout(500);
    
    // Should find the track in dropdown
    const dropdown = page.locator('.bg-zinc-900\\/95');
    await expect(dropdown.locator('text=End of Beginning').first()).toBeVisible({ timeout: 5000 });
  });

  test('search can find artists', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('Kehlani');
    await page.waitForTimeout(500);
    
    // Should show artists section in dropdown
    const dropdown = page.locator('.bg-zinc-900\\/95');
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    await expect(dropdown.locator('text=ARTISTS')).toBeVisible({ timeout: 5000 });
  });

  test('clicking search result plays track', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('Golden');
    await page.waitForTimeout(500);
    
    // Click on the track result in dropdown
    const dropdown = page.locator('.bg-zinc-900\\/95');
    await expect(dropdown).toBeVisible({ timeout: 5000 });
    const trackResult = dropdown.locator('.hover\\:bg-white\\/10').first();
    await trackResult.click();
    
    // Player should start
    await expect(page.locator('.fixed.bottom-0')).toBeVisible({ timeout: 5000 });
  });

  test('clear button clears search', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('test');
    await page.waitForTimeout(500);
    
    // Click clear button
    await page.locator('button').filter({ has: page.locator('svg.lucide-x') }).click();
    
    // Input should be empty
    await expect(searchInput).toHaveValue('');
  });

  test('no results shows appropriate message', async ({ page }) => {
    const searchInput = page.locator('input[placeholder*="Search"]');
    await searchInput.fill('xyznonexistent123');
    await page.waitForTimeout(500);
    
    // Should show no results message
    await expect(page.locator('text=No results found')).toBeVisible({ timeout: 5000 });
  });
});
