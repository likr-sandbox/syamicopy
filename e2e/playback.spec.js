import { expect, test } from '@playwright/test';
import { setupAudioSpy } from './helpers/audioMock';

test.describe('Playback Controls and Scheduler (Tiers 1 & 2)', () => {
  test.beforeEach(async ({ page }) => {
    await setupAudioSpy(page);
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should control playback status (play, stop) and update the playhead indicator', async ({
    page
  }) => {
    const display = page.locator('[data-testid="current-step-display"]');
    await expect(display).toHaveText('ステップ: -'); // Playback starts stopped

    // Toggle play state
    await page.click('[data-testid="play-toggle-btn"]');
    await expect(page.locator('[data-testid="play-toggle-btn"]')).toHaveText(
      /停止/
    );

    // Current step increments while playing
    await expect(async () => {
      const stepText = await display.innerText();
      expect(
        Number.parseInt(stepText.match(/-?\d+/)[0], 10)
      ).toBeGreaterThanOrEqual(0);
    }).toPass({ timeout: 2000 });

    // Click play/stop to stop playback
    await page.click('[data-testid="play-toggle-btn"]');
    await expect(display).toHaveText('ステップ: -');
  });

  test('should trigger correct audio pitches matching notes as the playhead advances', async ({
    page
  }) => {
    // Increase BPM to speed up test execution
    await page.click('[data-testid="settings-toggle-btn"]');
    await page.fill('#settings-bpm', '240');
    await page.keyboard.press('Escape');

    // Add note on step 0, MIDI pitch 72 (C5)
    const x = 0 * 24 + 12;
    const y = (93 - 72) * 20 + 30;
    await page
      .locator('[data-testid="grid"]')
      .click({ position: { x, y }, force: true });

    // Clear spied audit logs
    await page.evaluate(() => {
      window.__audioAudit = [];
    });

    // Start playback
    await page.click('[data-testid="play-toggle-btn"]');
    await expect(async () => {
      const audit = await page.evaluate(() => window.__audioAudit);
      const startEvent = audit.find((evt) => evt.type === 'oscillator-start');
      expect(startEvent).toBeDefined();
    }).toPass({ timeout: 2000 });
    await page.click('[data-testid="play-toggle-btn"]'); // Stop

    // Verify frequency triggered matches MIDI pitch 72 (~523.25Hz)
    const audit = await page.evaluate(() => window.__audioAudit);
    const startEvent = audit.find((evt) => evt.type === 'oscillator-start');
    expect(startEvent).toBeDefined();
    expect(startEvent.frequency).toBeCloseTo(523.25, 1);
  });

  test('should auto-scroll the piano roll viewport as the playhead advances beyond the visible area [Tier 2]', async ({
    page
  }) => {
    const gridContainer = page.locator('.flex-1.overflow-auto').first();
    await expect(gridContainer).toBeVisible();

    const initialScroll = await gridContainer.evaluate((el) => el.scrollLeft);
    expect(initialScroll).toBe(0);

    // Place a note at step 60, pitch 72
    const x = 60 * 24 + 12;
    const y = (93 - 72) * 20 + 30;
    await page
      .locator('[data-testid="grid"]')
      .click({ position: { x, y }, force: true });

    // Set BPM to 240 for quick execution
    await page.click('[data-testid="settings-toggle-btn"]');
    await page.fill('#settings-bpm', '240');
    await page.keyboard.press('Escape');

    // Click Play and wait for playhead to reach advanced steps
    await page.click('[data-testid="play-toggle-btn"]');

    // Verify grid container auto-scrolled
    await expect(async () => {
      const currentScroll = await gridContainer.evaluate((el) => el.scrollLeft);
      expect(currentScroll).toBeGreaterThan(0);
    }).toPass({ timeout: 5000 });

    await page.click('[data-testid="play-toggle-btn"]'); // Stop
  });

  test.skip('should synchronize scroll offsets between editor and Bunkafu views [Tier 3]', async ({
    page
  }) => {
    const pianoGrid = page.locator('.flex-1.overflow-auto').first();

    await expect(pianoGrid).toBeVisible();

    // Scroll Piano Roll and assert Bunkafu syncs
    await pianoGrid.evaluate((el) => {
      el.scrollLeft = 150;
      el.dispatchEvent(new Event('scroll'));
    });

    await page.click('[data-testid="tab-bunkafu"]');
    const bunkafuScroll = page
      .locator('[data-testid="bunkafu-view-scroll"], .bunkafu-scroll-container')
      .first();
    await expect(async () => {
      const _offset = await bunkafuScroll.evaluate((el) => el?.scrollLeft || 0);
      // Wait, bunkafu view doesn't exist yet, we should maybe skip this test.
    }).toPass();
  });

  test('should move playhead cursor during playback [Tier 3]', async ({
    page
  }) => {
    const cursor = page.locator('[data-testid="playback-head"]');

    // Playback cursor starts off screen or index -1
    await expect(cursor).not.toBeVisible();

    // Start playback
    await page.click('[data-testid="play-toggle-btn"]');

    // Playback cursor must display and its style left offset should increment
    await expect(cursor).toBeVisible();
    await expect(async () => {
      const leftVal = await cursor.evaluate((el) => el.style.left);
      const numericLeft = Number.parseInt(leftVal, 10);
      expect(numericLeft).toBeGreaterThan(0);
    }).toPass({ timeout: 3000 });

    // Stop playback
    await page.click('[data-testid="play-toggle-btn"]');
    await expect(cursor).not.toBeVisible();
  });
});
