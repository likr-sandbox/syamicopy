# Project: Syamicopy

## Architecture
Syamicopy is a Progressive Web Application (PWA) built using React, Vite, and vanilla JavaScript. It allows users to write, play, and export shamisen "Bunkafu" notation using a visual Piano Roll editor.

### Key Components
1. **Core Logic (Utilities)**:
   - `music.js`: Pitch and frequency helpers.
   - `shamisen.js`: Convert pitches to string indices and Bunkafu tsubo positions.
   - `timeSignature.js`: Measure and step conversions.
   - `storage.js`: Local project serialization and file import/export.
   - `audio.js`: Sound generation via Web Audio API.
2. **State Management (Hooks)**:
   - `useProjects`: Manage multiple local/preset projects.
   - `useAudio`: Audio playback state, scheduling, and auto-scroll triggers.
   - `useNoteEditor`: Handles placement, deletion, drag-move, and resizing of notes.
3. **UI Presentation**:
   - `PianoRoll`: Main editing area with keyboard and grid.
   - `BunkafuView`: Cultural tab-style rendering.
   - `SettingsModal` & `Drawer`: Settings and project import/export drawers.

## Code Layout
```
/home/likr/syamscore/
├── .github/workflows/ci.yml
├── public/
│   ├── manifest.json
│   ├── favicon.svg
│   ├── icon-192.png
│   └── icon-512.png
├── src/
│   ├── main.jsx
│   ├── App.jsx
│   ├── index.css
│   ├── components/
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── Drawer.jsx
│   │   ├── SettingsModal.jsx
│   │   ├── PianoRoll/
│   │   │   ├── PianoRoll.jsx
│   │   │   ├── Keyboard.jsx
│   │   │   ├── Grid.jsx
│   │   │   └── NoteBlock.jsx
│   │   ├── BunkafuView/
│   │   │   ├── BunkafuView.jsx
│   │   │   ├── BunkafuNote.jsx
│   │   │   └── BunkafuExport.jsx
│   │   ├── ImportExport/
│   │   │   ├── ImportModal.jsx
│   │   │   └── ExportModal.jsx
│   │   └── common/
│   │       ├── Modal.jsx
│   │       ├── TabBar.jsx
│   │       └── IconButton.jsx
│   ├── hooks/
│   │   ├── useProjects.js
│   │   ├── useAudio.js
│   │   ├── useNoteEditor.js
│   │   └── useAutoScroll.js
│   ├── utils/
│   │   ├── constants.js
│   │   ├── music.js
│   │   ├── shamisen.js
│   │   ├── audio.js
│   │   ├── storage.js
│   │   └── timeSignature.js
│   ├── data/
│   │   ├── presets.js
│   │   └── aiPrompt.js
│   └── i18n/
│       └── ja.js
├── e2e/
│   └── app.spec.js
├── biome.json
├── netlify.toml
├── playwright.config.js
├── vite.config.js
├── package.json
├── index.html
└── README.md
```

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Base Infrastructure | Vite, Biome, Vitest, Playwright, CI/CD configs | None | DONE |
| E2E | E2E Testing Track | Playwright E2E infrastructure and test cases | None | DONE |
| M2 | Core Utilities | `music.js`, `shamisen.js`, `timeSignature.js`, `storage.js`, `audio.js` | M1 | DONE |
| M3 | Data & State Layer | Presets, AI prompts, Custom React hooks | M2 | DONE |
| M4 | Presentation & Layout | Header, Footer, Drawer, Settings, CSS Styling | M3 | DONE |
| M5 | Visual Note Editor | PianoRoll, Keyboard, Grid, NoteBlock (drag/resize/tap) | M4 | DONE |
| M6 | Bunkafu & Image Export | BunkafuView, BunkafuNote, BunkafuExport, Import/Export modals | M5 | DONE |
| M7 | E2E Integration (Tiers 1-5) | Fully pass E2E tests, handle adversarial coverage (Tier 5) | M6, E2E Test Suite | DONE |

## Interface Contracts
### Data Structures
#### Project Object
```json
{
  "id": "string (uuid)",
  "name": "string",
  "composer": "string",
  "memo": "string",
  "tuning": "honchoshi | niagari | sansagari",
  "basePitch": 48,
  "timeSignature": { "numerator": 4, "denominator": 4 },
  "bpm": 100,
  "measureCount": 8,
  "notes": [
    { "id": "string", "pitch": 48, "step": 0, "length": 4 }
  ],
  "createdAt": "string (ISO)",
  "updatedAt": "string (ISO)"
}
```

### Shamisen Pitch Mapping
`src/utils/shamisen.js` converts pitch to:
```json
{ "stringIndex": 0 | 1 | 2, "tsubo": "string" }
```
where stringIndex = 2 (三の糸), 1 (二の糸), 0 (一の糸).
Tsubo numbers are mapping: 0, 1, 2, 3, #, 4, 5, 6, 7, 8, 9, b, 10...
For pitches outside the range of a tuning, return null.
