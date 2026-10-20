import { expect, test } from '@playwright/test';
import { setupAudioSpy } from './helpers/audioMock';

test.describe('Piano Roll Grid and Keyboard Editor (Tiers 1 & 2)', () => {
  test.beforeEach(async ({ page }) => {
    await setupAudioSpy(page);
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('should add a note by clicking on a grid cell and delete it by clicking the note block', async ({
    page
  }) => {
    // Reset spied audio context audit list
    await page.evaluate(() => {
      window.__audioAudit = [];
    });

    // Click grid cell to place note (step 4, MIDI pitch 70)
    const x = 4 * 24 + 12;
    const y = (84 - 70) * 20 + 30;
    await page
      .locator('[data-testid="grid"]')
      .click({ position: { x, y }, force: true });

    // Verify note is rendered
    const note = page.locator('[data-testid^="note-block-"]').first();
    await expect(note).toBeVisible();

    // Verify audio spier captured oscillator start with pitch 70
    const audit = await page.evaluate(() => window.__audioAudit);
    const audioTrigger = audit.find((evt) => evt.type === 'oscillator-start');
    expect(audioTrigger).toBeDefined();
    expect(audioTrigger.frequency).toBeCloseTo(466.16, 1); // 466.16Hz is Bb4 (MIDI 70)

    // Delete note by tapping the block
    await note.click();
    await expect(note).not.toBeVisible();
  });

  test('should play note sound when clicking keys on the visual keyboard', async ({
    page
  }) => {
    await page.evaluate(() => {
      window.__audioAudit = [];
    });

    const key = page.locator('[data-testid="key-60"]');
    await expect(key).toBeVisible();

    // Simulate key down
    await key.dispatchEvent('pointerdown');

    // Assert that AudioContext triggered oscillator start
    let audit = await page.evaluate(() => window.__audioAudit);
    const startEvent = audit.find((evt) => evt.type === 'oscillator-start');
    expect(startEvent).toBeDefined();
    expect(startEvent.frequency).toBeCloseTo(261.63, 1);

    // Simulate key up
    await key.dispatchEvent('pointerup');

    // Assert that AudioContext triggered oscillator stop
    audit = await page.evaluate(() => window.__audioAudit);
    const stopEvent = audit.find((evt) => evt.type === 'oscillator-stop');
    expect(stopEvent).toBeDefined();
  });

  test('should prevent duplicate note creation on the same cell [Tier 2]', async ({
    page
  }) => {
    // Verify DOM reduction: 0 cell divs exist in DOM
    expect(await page.locator('[data-testid^="grid-cell-"]').count()).toBe(0);

    // First click puts a note (step 8, MIDI pitch 60)
    const x = 8 * 24 + 12;
    const y = (84 - 60) * 20 + 30;
    await page
      .locator('[data-testid="grid"]')
      .click({ position: { x, y }, force: true });
    const note = page.locator('[data-testid^="note-block-"]').first();
    await expect(note).toBeVisible();

    // Second click directly on the grid content area should not create duplicate note
    await page.locator('[data-testid="grid"]').evaluate(
      (el, { x, y }) => {
        const content = el.querySelector('.cursor-crosshair');
        const rect = content.getBoundingClientRect();
        content.dispatchEvent(
          new MouseEvent('click', {
            bubbles: true,
            clientX: rect.left + x,
            clientY: rect.top + (y - 20)
          })
        );
      },
      { x, y }
    );
    const notes = page.locator('[data-testid^="note-block-"]');
    await expect(notes).toHaveCount(1);
  });

  test('should clamp note resize actions at the right edge of the grid [Tier 2]', async ({
    page
  }) => {
    // Open settings and set measure count to 4 (64 steps: 0 to 63)
    await page.click('[data-testid="settings-toggle-btn"]');
    await page.fill('#settings-measures', '4');
    await page.keyboard.press('Escape');

    // Add note near the end: step 60, pitch 70
    const x = 60 * 24 + 12;
    const y = (84 - 70) * 20 + 30;
    await page.locator('[data-testid="piano-roll"]').evaluate((el) => {
      if (el) el.scrollLeft = 1200;
    });
    await page
      .locator('[data-testid="grid"]')
      .click({ position: { x, y }, force: true });
    const note = page.locator('[data-testid^="note-block-"]').first();
    await expect(note).toBeVisible();

    // Locate the resize handle
    const handle = note.locator('[data-testid="note-handle-right"]');
    await expect(handle).toBeVisible();

    // Drag handle far to the right beyond the grid bounds
    const handleBox = await handle.boundingBox();
    expect(handleBox).not.toBeNull();
    await page.mouse.move(
      handleBox.x + handleBox.width / 2,
      handleBox.y + handleBox.height / 2
    );
    await page.mouse.down();
    await page.mouse.move(handleBox.x + 500, handleBox.y);
    await page.mouse.up();

    // Assert note container does not overflow past grid viewport bounds
    const noteBox = await note.boundingBox();
    const gridBox = await page.locator('[data-testid="grid"]').boundingBox();
    expect(noteBox).not.toBeNull();
    expect(gridBox).not.toBeNull();
    expect(noteBox.x + noteBox.width).toBeLessThanOrEqual(
      gridBox.x + gridBox.width
    );
  });
});
