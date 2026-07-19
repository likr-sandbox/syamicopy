import { expect, test } from '@playwright/test';

test.describe('PWA Capabilities (Tiers 1 & 2)', () => {
  test('should include PWA manifest tag in HTML head', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    const manifestLink = page.locator('link[rel="manifest"]').first();
    await expect(manifestLink).toBeAttached();

    const href = await manifestLink.getAttribute('href');
    expect(href).toBe('/manifest.json');

    // Request manifest directly and assert properties
    const response = await page.request.get('/manifest.json');
    expect(response.status()).toBe(200);

    const manifest = await response.json();
    expect(manifest.name).toBe('Syamicopy');
    expect(manifest.short_name).toBe('Syamicopy');
    expect(manifest.display).toBe('standalone');
  });

  test('should install service worker and load the application offline [Tier 2]', async ({
    context,
    page
  }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();

    // Validate that Service Worker registers successfully
    const swState = await page.evaluate(async () => {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready;
        if (!registration.active) return null;
        if (registration.active.state === 'activated') {
          return 'activated';
        }
        return new Promise((resolve) => {
          const handler = (e) => {
            if (e.target.state === 'activated') {
              registration.active.removeEventListener('statechange', handler);
              resolve('activated');
            }
          };
          registration.active.addEventListener('statechange', handler);
          if (registration.active.state === 'activated') {
            registration.active.removeEventListener('statechange', handler);
            resolve('activated');
          }
        });
      }
      return null;
    });
    expect(swState).toBe('activated');

    // Emulate offline context
    await context.setOffline(true);

    // Reload page under offline state
    await page.reload();

    // Verify application remains interactive and renders correctly from cache
    await expect(
      page.locator('[data-testid="header-container"]')
    ).toBeVisible();
    await expect(page.locator('[data-testid="header-logo"]')).toContainText(
      'シャミコピー'
    );
    await expect(page.locator('[data-testid="piano-roll"]')).toBeVisible();
  });
});
