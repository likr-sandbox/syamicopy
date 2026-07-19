# Syamicopy

Syamicopy is a Progressive Web Application (PWA) built using React, Vite, and Tailwind CSS. It is a modern digital tool for writing, playing, and exporting shamisen "Bunkafu" (文化譜) notation using a visual Piano Roll editor.

## Key Features

- **Piano Roll Grid Editor**: An intuitive visual grid to insert, delete, drag-resize, and arrange notes.
- **Bunkafu View**: Vertical, cultural tab-style representation of shamisen notation (including rests, underlines for rapid notes, and horizontal extension bars).
- **Tuning & Pitch Control**: Supports standard shamisen tunings (`honchoshi`, `niagari`, `sansagari`) and base pitch transpositions.
- **Audio Playback**: Sound generation using Web Audio API with configurable BPM (40-240).
- **Export & Import**: Export score as a PNG image or backup projects as JSON.
- **PWA Capabilities**: Fully installable and supports offline caching via Service Workers.

---

## Development Guide

First, install dependencies:

```bash
npm install
```

### 1. Run the Development Server
To start the Vite development server locally:

```bash
npm run dev
```

The application will be accessible at `http://localhost:5173` (or the port specified by Vite).

### 2. Run Linting and Formatting
Syamicopy uses **Biome** for fast formatting and linting.

- **Check code quality and formatting**:
  ```bash
  npm run lint
  ```
- **Fix linting and formatting issues automatically**:
  ```bash
  npm run lint:fix
  ```
- **Format code only**:
  ```bash
  npm run format
  ```

Alternatively, you can run Biome directly:
```bash
npx biome check .
```

### 3. Run Unit/Integration Tests
Unit and integration tests are run via **Vitest** and target the core utilities, hooks, and React component behaviors.

- **Run all unit tests**:
  ```bash
  npm run test:run
  ```
- **Run tests in watch mode**:
  ```bash
  npm run test
  ```
- **Run tests with a UI dashboard**:
  ```bash
  npm run test:ui
  ```
- **Generate test coverage report**:
  ```bash
  npm run test:coverage
  ```

### 4. Run End-to-End (E2E) Tests
End-to-End tests are run via **Playwright** and reside in the `e2e/` folder. They cover application UI layout, project CRUD, grid editor, Bunkafu view rendering, audio playback, and PWA offline behavior.

- **Run Playwright E2E tests**:
  ```bash
  npm run e2e
  ```

To run Playwright tests in UI mode:
```bash
npx playwright test --ui
```

---

## Technical Architecture

Refer to `PROJECT.md` for a breakdown of the code layout and architecture, and `TEST_INFRA.md` for details on the test suite organization and technical strategies (such as audio mocking and PWA offline testing).
