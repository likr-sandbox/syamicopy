# Syamicopy - Agent Context

This file serves as the central context and rulebook for all AI agents working on this project. 

## Project Overview
**Syamicopy** is a Progressive Web Application (PWA) built for creating, managing, and exporting shamisen "Bunkafu" notation.
- **Frameworks & Tools:** React, Vite, plain JavaScript (no TypeScript)
- **Code Quality:** Biome (Linter & Formatter)
- **Testing:** Playwright (E2E Tests), Vitest (Unit Tests)
- **Styling:** Tailwind CSS (configured in `tailwind.config.js`)

## Documentation Pointers
For detailed technical documentation, agents must refer to the following files located in `.agents/docs/`:
- **Architecture & Components:** `.agents/docs/PROJECT.md`
- **Testing Infrastructure:** `.agents/docs/TEST_INFRA.md`
- **Historical Implementation Plan:** `.agents/docs/history/implementation_plan.md`

## Key Working Rules (Hygiene)
1. **Clean Workspace:** Never leave temporary scratch files, test output, or `handoff.md` files in the source directories. Put them in `.agents/` or delete them after use.
2. **Context Updates:** When architectural shifts occur, or new significant rules emerge, update this `AGENTS.md` file to reflect them.
