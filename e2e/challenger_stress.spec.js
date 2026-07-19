import { expect, test } from '@playwright/test';
import { setupAudioSpy } from './helpers/audioMock';

test.describe('Audio Challenger Stress Tests', () => {
  test.beforeEach(async ({ page }) => {
    await setupAudioSpy(page);
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('sustain polyphony stress: trigger and release multiple keys simultaneously', async ({
    page
  }) => {
    const pitchesToPlay = [57, 59, 60, 62, 64, 65, 67, 69, 71, 72];

    await page.evaluate(() => {
      window.__audioAudit = [];
    });

    // Trigger pointerdown on each key using dispatchEvent
    for (const pitch of pitchesToPlay) {
      const keyLocator = page.locator(`[data-testid="key-${pitch}"]`);
      await expect(keyLocator).toBeVisible();
      await keyLocator.dispatchEvent('pointerdown', { button: 0 });
    }

    // Verify all 10 oscillators started
    const auditAfterStarts = await page.evaluate(() => window.__audioAudit);
    const startEvents = auditAfterStarts.filter(
      (evt) => evt.type === 'oscillator-start'
    );
    expect(startEvents.length).toBe(10);

    // Release pointer on each key
    for (const pitch of pitchesToPlay) {
      const keyLocator = page.locator(`[data-testid="key-${pitch}"]`);
      await keyLocator.dispatchEvent('pointerup');
    }

    // Verify all 10 oscillators stopped
    const auditAfterStops = await page.evaluate(() => window.__audioAudit);
    const stopEvents = auditAfterStops.filter(
      (evt) => evt.type === 'oscillator-stop'
    );
    expect(stopEvents.length).toBe(10);
  });

  test('slide pointer stress with real mouse movement', async ({ page }) => {
    const pitchesToSlide = [69, 67, 65, 64, 62, 60, 59, 57]; // Downwards on the keyboard

    await page.evaluate(() => {
      window.__audioAudit = [];
    });

    // 1. Hover over the first key
    const firstKey = page.locator(`[data-testid="key-${pitchesToSlide[0]}"]`);
    await expect(firstKey).toBeVisible();
    await firstKey.hover();

    // 2. Press mouse down
    await page.mouse.down();

    // 3. Move mouse sequentially over each key's center coordinates
    for (const pitch of pitchesToSlide) {
      const key = page.locator(`[data-testid="key-${pitch}"]`);
      const box = await key.boundingBox();
      if (box) {
        const x = box.x + box.width / 2;
        const y = box.y + box.height / 2;
        await page.mouse.move(x, y, { steps: 5 });
        await page.waitForTimeout(50); // small delay to simulate sliding speed
      }
    }

    // 4. Release mouse
    await page.mouse.up();

    // Wait for any stop ramps
    await page.waitForTimeout(200);

    const audit = await page.evaluate(() => window.__audioAudit);
    const startEvents = audit.filter((evt) => evt.type === 'oscillator-start');
    const stopEvents = audit.filter((evt) => evt.type === 'oscillator-stop');

    console.log(
      `Real mouse slide: Started ${startEvents.length}, Stopped ${stopEvents.length}`
    );

    // Check if any oscillators were left hanging
    expect(stopEvents.length).toBe(startEvents.length);
  });

  test('unmount memory leak: switching tabs while sustaining note leaks oscillator', async ({
    page
  }) => {
    const keyLocator = page.locator('[data-testid="key-60"]');
    await expect(keyLocator).toBeVisible();

    await page.evaluate(() => {
      window.__audioAudit = [];
    });

    await keyLocator.dispatchEvent('pointerdown', { button: 0 });

    let audit = await page.evaluate(() => window.__audioAudit);
    const startEvents = audit.filter((evt) => evt.type === 'oscillator-start');
    expect(startEvents.length).toBe(1);

    // Switch to Bunkafu tab to unmount Keyboard component
    const tabBunkafu = page.locator('[data-testid="tab-bunkafu"]');
    await tabBunkafu.click();

    await expect(page.locator('[data-testid="bunkafu-view"]')).toBeVisible();
    await page.waitForTimeout(100);

    audit = await page.evaluate(() => window.__audioAudit);
    const stopEvents = audit.filter((evt) => evt.type === 'oscillator-stop');

    console.log(
      `Unmount test: Stopped oscillators count = ${stopEvents.length}`
    );

    // Assert that the oscillator has stopped, confirming the fix
    expect(stopEvents.length).toBe(1);
  });
});
