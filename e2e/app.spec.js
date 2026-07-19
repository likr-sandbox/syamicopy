import { expect, test } from '@playwright/test';

test.describe('App Layout and Navigation (Tier 1)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should render the basic app layout correctly (Header, Footer, active Piano Roll tab)', async ({
    page
  }) => {
    // Assert Header layout
    const header = page.locator('[data-testid="header-container"]');
    await expect(header).toBeVisible();
    await expect(header.locator('[data-testid="header-logo"]')).toContainText(
      'シャミコピー'
    );
    await expect(
      page.locator('[data-testid="header-project-name"]')
    ).toBeVisible();

    // Assert Footer layout
    const footer = page.locator('[data-testid="footer-container"]');
    await expect(footer).toBeVisible();
    await expect(
      footer.locator('[data-testid="play-toggle-btn"]')
    ).toBeVisible();
    await expect(
      footer.locator('[data-testid="current-step-display"]')
    ).toBeVisible();

    // Assert Main Area displays Piano Roll by default
    await expect(page.locator('[data-testid="piano-roll"]')).toBeVisible();
    await expect(page.locator('[data-testid="keyboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="grid"]')).toBeVisible();
  });

  test('should toggle between Piano Roll and Bunkafu tab views', async ({
    page
  }) => {
    // Bunkafu tab should start hidden
    await expect(
      page.locator('[data-testid="bunkafu-view"]')
    ).not.toBeVisible();

    // Click Bunkafu tab button
    await page.click('[data-testid="tab-bunkafu"]');

    // Bunkafu view is now visible, piano roll is hidden
    await expect(page.locator('[data-testid="bunkafu-view"]')).toBeVisible();
    await expect(page.locator('[data-testid="piano-roll"]')).not.toBeVisible();

    // Click Piano Roll tab button
    await page.click('[data-testid="tab-piano-roll"]');

    // Piano roll is visible again, bunkafu is hidden
    await expect(page.locator('[data-testid="piano-roll"]')).toBeVisible();
    await expect(
      page.locator('[data-testid="bunkafu-view"]')
    ).not.toBeVisible();
  });
});
