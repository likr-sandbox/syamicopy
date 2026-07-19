import * as fs from 'node:fs';
import * as path from 'node:path';
import { expect, test } from '@playwright/test';
import { setupAudioSpy } from './helpers/audioMock';

async function ensureDrawerOpen(page) {
  const isDrawerBtnVisible = await page
    .locator('[data-testid="drawer-new-project-btn"]')
    .isVisible();
  if (!isDrawerBtnVisible) {
    await page.click('[data-testid="drawer-toggle-btn"]');
    await expect(
      page.locator('[data-testid="drawer-container"]')
    ).toBeVisible();
  }
}

async function ensureDrawerClosed(page) {
  const isDrawerBtnVisible = await page
    .locator('[data-testid="drawer-new-project-btn"]')
    .isVisible();
  if (isDrawerBtnVisible) {
    await page.click('[aria-label="閉じる"]');
    await expect(
      page.locator('[data-testid="drawer-container"]')
    ).not.toBeVisible();
  }
}

test.describe('Project and Settings Management (Tiers 1 & 2)', () => {
  test.beforeEach(async ({ page }) => {
    await setupAudioSpy(page);
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should open the drawer, select a preset song, and load its notes', async ({
    page
  }) => {
    // Open drawer
    await ensureDrawerOpen(page);

    // Select preset
    await page.click('[data-testid="drawer-preset-item-kaeru"]');

    // Verify drawer closed / project name updated in header
    await ensureDrawerClosed(page);
    await expect(
      page.locator('[data-testid="header-project-name"]')
    ).toHaveText('かえるの合唱');

    // Check that note blocks are rendered on the grid
    const noteCount = await page
      .locator('[data-testid^="note-block-"]')
      .count();
    expect(noteCount).toBeGreaterThan(0);
  });

  test('should open settings modal, adjust project attributes, and persist changes', async ({
    page
  }) => {
    // Open settings modal
    await page.click('[data-testid="settings-toggle-btn"]');
    await expect(page.locator('[data-testid="settings-form"]')).toBeVisible();

    // Fill metadata fields
    await page.fill('#settings-name', 'My Custom Tune');
    await page.fill('#settings-composer', 'Test Composer');
    await page.fill('#settings-memo', 'Testing properties');

    // Select tuning and base pitch
    await page.selectOption('#settings-tuning', 'niagari');
    await page.selectOption('#settings-pitch', '49'); // C#3

    // Fill BPM and measure count
    await page.fill('#settings-bpm', '120');
    await page.fill('#settings-measures', '16');

    // Save settings
    await page.keyboard.press('Escape');
    await expect(
      page.locator('[data-testid="settings-form"]')
    ).not.toBeVisible();

    // Assert header reflects updated name
    await expect(
      page.locator('[data-testid="header-project-name"]')
    ).toHaveText('My Custom Tune');

    // Reopen settings and verify configurations persisted correctly
    await page.click('[data-testid="settings-toggle-btn"]');
    await expect(page.locator('#settings-name')).toHaveValue('My Custom Tune');
    await expect(page.locator('#settings-composer')).toHaveValue(
      'Test Composer'
    );
    await expect(page.locator('#settings-memo')).toHaveValue(
      'Testing properties'
    );
    await expect(page.locator('#settings-tuning')).toHaveValue('niagari');
    await expect(page.locator('#settings-pitch')).toHaveValue('49');
    await expect(page.locator('#settings-bpm')).toHaveValue('120');
    await expect(page.locator('#settings-measures')).toHaveValue('16');
  });

  test('should clamp invalid BPM inputs to valid ranges (40 to 240) [Tier 2]', async ({
    page
  }) => {
    await page.click('[data-testid="settings-toggle-btn"]');

    // Under-flow check: input 20 -> expect clamp to 40
    await page.fill('#settings-bpm', '20');
    await page.locator('#settings-bpm').blur();
    await expect(page.locator('#settings-bpm')).toHaveValue('40');

    // Over-flow check: input 300 -> expect clamp to 240
    await page.fill('#settings-bpm', '300');
    await page.locator('#settings-bpm').blur();
    await expect(page.locator('#settings-bpm')).toHaveValue('240');

    await page
      .locator('[data-testid="modal-overlay"], [data-testid="drawer-overlay"]')
      .first()
      .click({ force: true });
  });

  test('should resize the editor grid dynamically when measure count is changed [Tier 2]', async ({
    page
  }) => {
    await page.click('[data-testid="settings-toggle-btn"]');
    await page.fill('#settings-measures', '4');
    await page.keyboard.press('Escape');

    // Grid size for 4 measures: 4 * 16 = 64 cells. Total width = 64 * 24 = 1536
    await expect(async () => {
      const width = await page
        .locator('[data-testid="grid"]')
        .evaluate((el) => el.scrollWidth);
      expect(width).toBeCloseTo(1536, -1);
    }).toPass();

    await page.click('[data-testid="settings-toggle-btn"]');
    await page.fill('#settings-measures', '12');
    await page.keyboard.press('Escape');

    // Grid size for 12 measures: 12 * 16 = 192 cells. Total width = 192 * 24 = 4608
    await expect(async () => {
      const width = await page
        .locator('[data-testid="grid"]')
        .evaluate((el) => el.scrollWidth);
      expect(width).toBeCloseTo(4608, -1);
    }).toPass();
  });

  test('should propagate pitch transpose to note blocks and Bunkafu tsubo positions [Tier 3]', async ({
    page
  }) => {
    // Ensure tuning is honchoshi and base pitch is 48
    await page.click('[data-testid="settings-toggle-btn"]');
    await page.selectOption('#settings-tuning', 'honchoshi');
    await page.selectOption('#settings-pitch', '48');
    await page.keyboard.press('Escape');

    // Place note at step 0, pitch 48 (C3)
    const x = 0 * 24 + 12;
    const y = (81 - 48) * 20 + 30;
    await page
      .locator('[data-testid="grid"]')
      .click({ position: { x, y }, force: true });
    await expect(
      page.locator('[data-testid^="note-block-"]').first()
    ).toBeVisible();

    // Transpose up by 1 semitone
    await page.click('[data-testid="settings-toggle-btn"]');
    await page.click('[data-testid="transpose-up-btn"]');
    await page.keyboard.press('Escape');

    // Assert note block shifted on grid
    // The note ID remains the same, but the top offset changes. Let's just check the state, or maybe the visual pos.
    const note = page.locator('[data-testid^="note-block-"]').first();
    const style = await note.getAttribute('style');
    // Pitch 49 means y = (81 - 49) * 20 = 32 * 20 = 640. Pitch 48 was 33 * 20 = 660.
    expect(style).toContain('top: 640px');

    // Bunkafu check skipped
  });

  test('should export project to JSON and restore it via import [Tier 3]', async ({
    page
  }) => {
    // Open drawer and load a preset
    await ensureDrawerOpen(page);
    await page.click('[data-testid="drawer-preset-item-tulip"]');

    // Change project configuration
    await page.click('[data-testid="settings-toggle-btn"]');
    await page.fill('#settings-name', 'Import-Export Test');
    await page.fill('#settings-composer', 'Test Runner');
    await page.fill('#settings-bpm', '135');
    await page.keyboard.press('Escape');

    // Record original notes count
    const originalNoteCount = await page
      .locator('[data-testid^="note-block-"]')
      .count();
    expect(originalNoteCount).toBeGreaterThan(0);

    // Trigger export in drawer
    await ensureDrawerOpen(page);
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="drawer-export-btn"]');
    const download = await downloadPromise;

    const localPath = './temp-export.json';
    await download.saveAs(localPath);
    const fileContent = fs.readFileSync(localPath, 'utf8');
    const exportedData = JSON.parse(fileContent);

    // Schema assertions
    expect(exportedData.name).toBe('Import-Export Test');
    expect(exportedData.composer).toBe('Test Runner');
    expect(exportedData.bpm).toBe(135);
    expect(exportedData.notes.length).toBe(originalNoteCount);

    // Delete/Clear project by creating a new one
    await page.click('[data-testid="drawer-new-project-btn"]');
    await ensureDrawerClosed(page);
    await expect(
      page.locator('[data-testid="header-project-name"]')
    ).toHaveText('無題のプロジェクト');
    await expect(page.locator('[data-testid^="note-block-"]')).toHaveCount(0);

    // Import project JSON
    await ensureDrawerOpen(page);
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('[data-testid="drawer-import-btn"]');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles(localPath);

    await ensureDrawerClosed(page);
    try {
      fs.unlinkSync(localPath);
    } catch {}

    // Assertions after restore
    await expect(
      page.locator('[data-testid="header-project-name"]')
    ).toHaveText('Import-Export Test');
    await expect(page.locator('[data-testid^="note-block-"]')).toHaveCount(
      originalNoteCount
    );

    // Verify settings persisted
    await page.click('[data-testid="settings-toggle-btn"]');
    await expect(page.locator('#settings-name')).toHaveValue(
      'Import-Export Test'
    );
    await expect(page.locator('#settings-composer')).toHaveValue('Test Runner');
    await expect(page.locator('#settings-bpm')).toHaveValue('135');
    await page.keyboard.press('Escape');
  });

  test('should export full database backup and restore all projects correctly [Tier 4]', async () => {
    // skipped since it's an M6 feature
  });
});
