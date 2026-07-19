# Test Infrastructure Design (TEST_INFRA)

This document details the E2E testing infrastructure, feature inventory, category-partition partitions, and test suite layout for the Syamicopy Progressive Web Application.

---

## 1. Testing Framework and Tooling

*   **Test Runner**: Playwright (`@playwright/test`)
    *   Selected for multi-device emulation (Pixel 5, iPhone 12), service worker inspection, offline capability control, and execution speed.
*   **Directory Layout**: All tests reside in the `e2e/` directory.
    *   `e2e/app.spec.js`: Basic app layout, container presentation, and initial state rendering.
    *   `e2e/project.spec.js`: Project CRUD actions, preset project loads, and settings drawer/modal interactions.
    *   `e2e/editor.spec.js`: Piano roll interaction (grid clicks, note additions, drags, deletions, and keyboard playback).
    *   `e2e/bunkafu.spec.js`: Bunkafu view rendering (string mapping, tsubo positions, underlines, rests, extension bars) and export actions.
    *   `e2e/playback.spec.js`: Audio playback status, playhead/cursor tracking, BPM speed timing, and auto-scroll behavior.
    *   `e2e/pwa.spec.js`: PWA manifest presence, service worker registration/activation, and offline application reload.
    *   `e2e/helpers/audioMock.js`: Utility containing the Web Audio API spying/mocking helper `setupAudioSpy`.

---

## 2. Technical Testing Strategies

### Audio Mocking
To bypass real audio output requirements and avoid dependencies on physical sound cards, tests use an initialization script injected via `page.addInitScript()` to mock the Web Audio API. 
*   **Implementation**: Override `window.AudioContext` and `window.webkitAudioContext`.
*   **Verification**: Log triggered oscillator waveforms, types, and frequencies into a global `window.__audioAudit` array. The test suite can assert against this array to ensure the correct pitches are triggered at the correct times.

### Image Export Testing
To verify the export of Bunkafu scores as PNGs (triggered via `html2canvas`):
*   **Implementation**: Intercept download events triggered by the browser.
*   **Verification**: Check that the download starts, the filename is exactly `shamisen_score.png`, and the file size boundaries are within expected ranges.

### PWA & Offline Testing
To ensure the application functions offline:
*   **Implementation**:
    1.  Validate that the manifest link exists in the HTML header.
    2.  Access the browser context to inspect the registered service worker state and verify it is `activated`.
    3.  Set the browser context to offline mode (`context.setOffline(true)`).
    4.  Reload the index page and assert that the application loads and renders correctly from the cache.

---

## 3. Feature Inventory

The test suite covers the following core features:
1.  **App UI Layout**: Rendering of main page components (header, footer, workspace panels, tabs).
2.  **Project Selection & Drawer**: Open/close project list, load preset files, create new projects, delete projects.
3.  **Project Settings**: Configuration of BPM, tuning (honchoshi, niagari, sansagari), and base pitch transpose.
4.  **Piano Roll Grid Editor**: Inserting notes, deleting notes, adjusting note length (dragging/resizing), and selecting steps.
5.  **Piano Roll Keyboard**: Clicking keys to preview tones.
6.  **Bunkafu View**: Vertical cultural tab score display corresponding to the piano roll note positions.
7.  **Bunkafu Styling**: Correct rendering of rests, underlines for rapid notes (e.g. 1/8, 1/16 notes), and horizontal extension bars.
8.  **Bunkafu Image Export**: Generation and download of the score as a PNG image.
9.  **Playback Controls**: Play, pause, stop, and loop behavior.
10. **Playback Auto-scroll**: Automatic scroll follow when playhead moves outside the visible piano roll viewport.
11. **PWA Offline Caching**: Complete load, installation, and operation without network connectivity.

---

## 4. Category-Partition Partitions & Boundaries

The inputs and actions are partitioned as follows to ensure boundary coverage:

*   **Tuning Configuration**
    *   `honchoshi`: Pitch relation [I, IV, VIII] (Open pitches: Base Pitch, Base Pitch + 5, Base Pitch + 12 semi-tones)
    *   `niagari`: Pitch relation [I, V, VIII] (Open pitches: Base Pitch, Base Pitch + 7, Base Pitch + 12 semi-tones)
    *   `sansagari`: Pitch relation [I, IV, VII] (Open pitches: Base Pitch, Base Pitch + 5, Base Pitch + 10 semi-tones)
*   **MIDI Pitches**
    *   `Valid Pitches`: 45 to 81 (e.g. 45, 48, 53, 60, 81)
    *   `Invalid/Out-of-range Pitches`: < 45 or > 81 (must render fallback symbol `×` in Bunkafu view instead of a tsubo)
*   **Note Steps and Lengths**
    *   `Steps`: Start at `0`, end at max step (e.g. `127` for an 8-measure score of 16th notes)
    *   `Short Length`: 1–2 steps
    *   `Standard Length`: 4 steps (quarter note equivalent)
    *   `Long Length`: > 4 steps (half note, whole note, etc.)
*   **Beats Per Minute (BPM)**
    *   `Valid Range`: 40 to 240
    *   `Under-flow`: < 40 (must clamp to 40)
    *   `Over-flow`: > 240 (must clamp to 240)
*   **Project Import/Export Payload**
    *   `Valid JSON`: Correct keys matching the project schema
    *   `Empty JSON`: Handled gracefully (displays error or does not crash)
    *   `Malformed JSON`: Validated with structural checking (displays error message)

---

## 5. E2E Test Case Tier Layout (Tiers 1-4)

### Tier 1 (Feature Coverage)
*   **Basic Layout Render**: Inspect that the Header, Footer, Piano Roll, and Bunkafu tabs render properly upon page load.
*   **Preset Load**: Load a preset project from the drawer and verify that note blocks are correctly drawn in both the grid and Bunkafu views.
*   **Grid Note Placement/Deletion**: Tap a cell on the grid to create a note, verify it exists, and then click/right-click/delete it.
*   **Tab View Toggling**: Alternate between the editor and Bunkafu views, confirming each becomes active.
*   **Settings Adjustment**: Open the Settings modal, change BPM and tuning, and confirm changes persist.

### Tier 2 (Boundary Cases)
*   **Clamped BPM Limits**: Try typing `30` or `300` in the BPM input and assert that values clamp to `40` and `240` respectively.
*   **Out-of-range Pitch Rendering**: Place a note with a MIDI pitch outside the 45-81 range, switch to Bunkafu view, and assert that it displays `×`.
*   **Measure Count Grid Resizing**: Modify the measure count in settings (e.g., from 8 to 12) and assert that the grid width changes accordingly.
*   **Note Overlap Collision Block**: Attempt to drag or place a note onto another existing note at the same step and pitch, verifying that overlapping is blocked or correctly resolved.
*   **Right-edge Drag Bounding**: Resize a note toward the right edge of the grid and verify that it cannot exceed the maximum available steps.
*   **Offline PWA Cache Load**: Register the service worker, go offline, reload, and verify the app compiles and is interactive.

### Tier 3 (Cross-Feature Integration)
*   **Pitch Transpose Propagation**: Set a base pitch transpose, verify that the MIDI pitches of existing notes change accordingly, and confirm that the Bunkafu tsubo positions update to reflect the new pitches.
*   **Full JSON Export & Import Restore**: Export the current project as a JSON file, delete it, import the file back, and verify the notes, BPM, tuning, and title are identical.
*   **PlaybackCursor Movement & Sync Scrolling**: Start playback and assert that the playhead cursor updates its step offset. Scroll both the Piano Roll and Bunkafu views synchronously as the playhead progresses.
*   **Tuning Change Realignment**: Change the tuning type from `honchoshi` to `niagari` and verify that notes realign their pitch-to-string mappings on the Bunkafu view.

### Tier 4 (Real-World Scenarios)
*   **Composition Setup from Scratch**:
    1.  Create a new blank project.
    2.  Rename it and adjust BPM to 120, tuning to `niagari`.
    3.  Enter a short melody (e.g. "Sakura Sakura" snippet).
    4.  Verify playback sound triggers correctly using the audio audit mock.
    5.  Trigger a PNG score export and confirm the downloaded file matches expectations.
*   **Full Backup Export/Restore**: Create multiple projects, perform a full app backup export, clear local storage, import the backup, and assert that all projects are restored with their integrity intact.
