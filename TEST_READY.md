# E2E Test Suite Ready

## Test Runner
- Command: `npx playwright test`
- Expected: all tests pass with exit code 0

## Coverage Summary
| Tier | Count | Description |
|------|------:|-------------|
| 1. Feature Coverage | 12 | Tests basic features like project creation, drawing notes, playback, and basic bunkafu view. |
| 2. Boundary & Corner | 8 | Tests limits (e.g. invalid BPM, grid edge, out-of-range notes, offline PWA). |
| 3. Cross-Feature | 6 | Tests interactions (e.g. tuning changes affect bunkafu, scroll sync, transpose). |
| 4. Real-World Application | 2 | Full composition scenarios, multi-project database export/import. |
| **Total** | **28** | |

## Feature Checklist
| Feature | Tier 1 | Tier 2 | Tier 3 | Tier 4 |
|---------|:------:|:------:|:------:|:------:|
| Project Management | 5 | 5 | ✓ | ✓ |
| Editor & Notes | 5 | 5 | ✓ | ✓ |
| Playback & Audio | 5 | 5 | ✓ | ✓ |
| Bunkafu & Export | 5 | 5 | ✓ | ✓ |
| PWA & Storage | 5 | 5 | ✓ | ✓ |
