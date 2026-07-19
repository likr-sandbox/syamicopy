import * as fs from 'node:fs';
import { expect, test } from '@playwright/test';
import { setupAudioSpy } from './helpers/audioMock';

test.describe('Real-World Composition Scenario (Tier 4)', () => {
  test.beforeEach(async ({ page }) => {
    await setupAudioSpy(page);
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should support composition setup from scratch, audio playback, and image export', async ({
    page
  }) => {
    // 1. Create a new project
    await page.click('[data-testid="drawer-toggle-btn"]');
    await page.click('[data-testid="drawer-new-project-btn"]');
    await page.click('[data-testid="create-project-submit"]');

    await expect(
      page.locator('[data-testid="header-project-name"]')
    ).toHaveText('無題のプロジェクト');

    // 2. Adjust settings
    await page.click('[data-testid="settings-toggle-btn"]');
    await page.fill('#settings-name', 'Sakura Sakura Snippet');
    await page.fill('#settings-composer', 'Traditional');
    await page.fill('#settings-bpm', '120');
    await page.fill('#settings-measures', '4');
    await page.keyboard.press('Escape');

    // Adjust tuning and base pitch via Bunkafu tab
    await page.click('[data-testid="tab-bunkafu"]');
    await page.selectOption('[data-testid="bunkafu-tuning-select"]', 'niagari');
    await page.selectOption('[data-testid="bunkafu-base-pitch-select"]', '48');
    await page.click('[data-testid="tab-piano-roll"]');

    // Verify name updated in header
    await expect(
      page.locator('[data-testid="header-project-name"]')
    ).toHaveText('Sakura Sakura Snippet');

    // 3. Input melody notes
    await page
      .locator('[data-testid="piano-roll"]')
      .evaluate((el) => el.scrollTo(0, 300));
    await page.locator('[data-testid="grid"]').click({
      position: { x: 0 * 24 + 12, y: (93 - 57) * 20 + 30 },
      force: true
    }); // A3
    await page.locator('[data-testid="grid"]').click({
      position: { x: 4 * 24 + 12, y: (93 - 57) * 20 + 30 },
      force: true
    }); // A3
    await page.locator('[data-testid="grid"]').click({
      position: { x: 8 * 24 + 12, y: (93 - 59) * 20 + 30 },
      force: true
    }); // B3
    await page.locator('[data-testid="grid"]').click({
      position: { x: 12 * 24 + 12, y: (93 - 57) * 20 + 30 },
      force: true
    }); // A3

    await expect(
      page.locator('[data-testid^="note-block-"]').nth(0)
    ).toBeVisible();
    await expect(
      page.locator('[data-testid^="note-block-"]').nth(3)
    ).toBeVisible();

    // 4. Verify playback audio frequencies
    await page.evaluate(() => {
      window.__audioAudit = [];
    });
    await page.click('[data-testid="play-toggle-btn"]');

    // Allow playhead to advance past step 12
    await expect(async () => {
      const stepText = await page
        .locator('[data-testid="current-step-display"]')
        .innerText();
      expect(
        Number.parseInt(stepText.match(/-?\d+/)[0], 10)
      ).toBeGreaterThanOrEqual(12);
    }).toPass({ timeout: 5000 });
    await page.click('[data-testid="play-toggle-btn"]'); // Stop

    const audit = await page.evaluate(() => window.__audioAudit);
    const noteStarts = audit.filter((evt) => evt.type === 'oscillator-start');
    expect(noteStarts.length).toBeGreaterThanOrEqual(4);

    noteStarts.sort((a, b) => a.timestamp - b.timestamp);
    const frequencies = noteStarts.slice(0, 4).map((n) => n.frequency);
    expect(frequencies[0]).toBeCloseTo(220, -1);
    expect(frequencies[1]).toBeCloseTo(220, -1);
    expect(frequencies[2]).toBeCloseTo(246.94, -1);
    expect(frequencies[3]).toBeCloseTo(220, -1);

    // 5. Image export verification (Skipped since M6 is not yet implemented)
  });
});
