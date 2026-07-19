import * as fs from 'node:fs';
import { expect, test } from '@playwright/test';

test.describe('Bunkafu Score View and Image Export (Tiers 1 & 2)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should map notes to correct strings and tsubo numbers in Bunkafu view', async ({
    page
  }) => {
    // Ensure tuning is set to honchoshi via Bunkafu tab selectors
    await page.click('[data-testid="tab-bunkafu"]');
    await page.selectOption(
      '[data-testid="bunkafu-tuning-select"]',
      'honchoshi'
    );
    await page.selectOption('[data-testid="bunkafu-base-pitch-select"]', '60');
    await page.click('[data-testid="tab-piano-roll"]');

    // Input sample pitches in Editor
    await page.click('[data-testid="grid-cell-0-60"]'); // C4 (String 0, Open)
    await page.click('[data-testid="grid-cell-4-65"]'); // F4 (String 1, Open)
    await page.click('[data-testid="grid-cell-8-66"]'); // F#4 (String 1, Tsubo 1)
    await page.click('[data-testid="grid-cell-12-72"]'); // C5 (String 2, Open)

    // Switch to Bunkafu Tab
    await page.click('[data-testid="tab-bunkafu"]');
    await expect(page.locator('[data-testid="bunkafu-view"]')).toBeVisible();

    // Verify Pitch 48 -> tsubo "0" on 一の糸 (String 0) at step 0
    const note1 = page.locator('[data-testid="bunkafu-note-0"]');
    await expect(note1).toHaveText('0');
    await expect(note1).toHaveAttribute('data-string-index', '0');

    // Verify Pitch 53 -> tsubo "0" on 二の糸 (String 1) at step 4
    const note2 = page.locator('[data-testid="bunkafu-note-4"]');
    await expect(note2).toHaveText('0');
    await expect(note2).toHaveAttribute('data-string-index', '1');

    // Verify Pitch 54 -> tsubo "1" on 二の糸 (String 1) at step 8
    const note3 = page.locator('[data-testid="bunkafu-note-8"]');
    await expect(note3).toHaveText('1');
    await expect(note3).toHaveAttribute('data-string-index', '1');

    // Verify Pitch 60 -> tsubo "0" on 三の糸 (String 2) at step 12
    const note4 = page.locator('[data-testid="bunkafu-note-12"]');
    await expect(note4).toHaveText('0');
    await expect(note4).toHaveAttribute('data-string-index', '2');

    // Verify automatic rest mark "●" on 二の糸 (String 1) for empty beat at step 16
    const rest = page.locator('[data-testid="bunkafu-rest-16"]');
    await expect(rest).toBeVisible();
    await expect(rest).toHaveText('●');
    await expect(rest).toHaveAttribute('data-string-index', '1');
  });

  test('should export the Bunkafu score as a PNG image', async ({ page }) => {
    await page.click('[data-testid="tab-bunkafu"]');

    // Intercept download event
    const downloadPromise = page.waitForEvent('download');
    await page.click('[data-testid="bunkafu-export-btn"]');
    const download = await downloadPromise;

    // Validate output properties
    expect(download.suggestedFilename()).toBe('shamisen_score.png');
    const path = await download.path();
    expect(path).toBeTruthy();

    // Assert file size is valid (non-empty binary)
    const buffer = fs.readFileSync(path);
    expect(buffer.length).toBeGreaterThan(1000);
    expect(buffer[0]).toBe(0x89);
    expect(buffer[1]).toBe(0x50);
    expect(buffer[2]).toBe(0x4e);
    expect(buffer[3]).toBe(0x47);
  });

  test('should display fallback symbol (×) for out-of-range pitches [Tier 2]', async ({
    page
  }) => {
    // Inject custom out-of-range notes to state
    await page.evaluate(() => {
      const project = {
        id: 'test-out-of-range',
        name: 'OOR Test',
        tuning: 'honchoshi',
        basePitch: 48,
        timeSignature: { numerator: 4, denominator: 4 },
        bpm: 100,
        measureCount: 4,
        notes: [{ id: 'oor-1', pitch: 40, step: 0, length: 4 }], // Pitch 40 is out of bounds (< 45)
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('syamicopy_projects', JSON.stringify([project]));
      localStorage.setItem('syamicopy_current_project_id', 'test-out-of-range');
    });

    await page.reload();
    await page.click('[data-testid="tab-bunkafu"]');

    // Expect fallback symbol "×" instead of numerical tsubo
    const note = page.locator('[data-testid="bunkafu-note-0"]');
    await expect(note).toHaveText('×');
  });

  test('should render extension lines (ー) for notes spanning multiple beats [Tier 2]', async ({
    page
  }) => {
    // Inject note with length 8 steps (at step 0, pitch 48)
    await page.evaluate(() => {
      const project = {
        id: 'test-extension',
        name: 'Extension Test',
        tuning: 'honchoshi',
        basePitch: 48,
        timeSignature: { numerator: 4, denominator: 4 },
        bpm: 100,
        measureCount: 4,
        notes: [{ id: 'ext-1', pitch: 48, step: 0, length: 8 }],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem('syamicopy_projects', JSON.stringify([project]));
      localStorage.setItem('syamicopy_current_project_id', 'test-extension');
    });

    await page.reload();
    await page.click('[data-testid="tab-bunkafu"]');

    // Verify Pitch 48 -> note at step 0 is "0"
    const note0 = page.locator('[data-testid="bunkafu-note-0"]');
    await expect(note0).toHaveText('0');

    // The extension at step 4 (the next beat where note continues) should be "ー"
    const extension = page.locator('[data-testid="bunkafu-extension-4"]');
    await expect(extension).toHaveText('ー');
  });

  test('should recalculate tsubo positions and string index when tuning changes [Tier 3]', async ({
    page
  }) => {
    // Set initial settings: honchoshi, base pitch 60 via Bunkafu tab
    await page.click('[data-testid="tab-bunkafu"]');
    await page.selectOption(
      '[data-testid="bunkafu-tuning-select"]',
      'honchoshi'
    );
    await page.selectOption('[data-testid="bunkafu-base-pitch-select"]', '60');
    await page.click('[data-testid="tab-piano-roll"]');

    // Place note 65 at step 0, and note 67 at step 4
    await page.click('[data-testid="grid-cell-0-65"]');
    await page.click('[data-testid="grid-cell-4-67"]');

    // Toggle to Bunkafu view
    await page.click('[data-testid="tab-bunkafu"]');

    // Under Honchoshi:
    // Pitch 53 is open 二の糸 (string index 1, tsubo 0)
    // Pitch 55 is 二の糸 fret 2 (string index 1, tsubo 2)
    await expect(page.locator('[data-testid="bunkafu-note-0"]')).toHaveText(
      '0'
    );
    await expect(
      page.locator('[data-testid="bunkafu-note-0"]')
    ).toHaveAttribute('data-string-index', '1');
    await expect(page.locator('[data-testid="bunkafu-note-4"]')).toHaveText(
      '2'
    );
    await expect(
      page.locator('[data-testid="bunkafu-note-4"]')
    ).toHaveAttribute('data-string-index', '1');

    // Shift tuning to niagari directly on Bunkafu view
    await page.selectOption('[data-testid="bunkafu-tuning-select"]', 'niagari');

    // Under Niagari:
    // Pitch 53 is mapped to 一の糸 (string index 0, 5 semitones higher -> tsubo "4")
    // Pitch 55 is mapped to 二の糸 open (string index 1, tsubo "0")
    await expect(page.locator('[data-testid="bunkafu-note-0"]')).toHaveText(
      '4'
    );
    await expect(
      page.locator('[data-testid="bunkafu-note-0"]')
    ).toHaveAttribute('data-string-index', '0');
    await expect(page.locator('[data-testid="bunkafu-note-4"]')).toHaveText(
      '0'
    );
    await expect(
      page.locator('[data-testid="bunkafu-note-4"]')
    ).toHaveAttribute('data-string-index', '1');
  });
});
