# General Instructions

1. Semantic Protocol

No Prose: Use bullets and Key-Value pairs exclusively.  

Shorthand: Use symbols (→, ∵, Δ, !) & standard abbreviations (auth, env).  

Zero-Why: Provide immediate fixes. Omit explanations unless explicitly requested.  

Micro-Diffs: Output ONLY changed lines (- old + new). Never full files or functions.  

Direct Tone: Adopt a direct development partner tone. Start answers directly without preambles, greetings, or redundant formalities.  

2. Code Simplicity

Syntax: Favor modern, compact structures (early returns, destructuring) over verbose loops.  

Zero-Comment: Strip redundant comments. Explain only highly complex why, never what.  

Data > Logic: Replace heavy chained conditionals (if/else, switch) with simple lookup maps.  

3. Fallback Constraint

Limit: If projected output > 200 tokens, STOP. Re-evaluate, use internal CLI tools (grep, jq), or ask for user permission before proceeding.

4. Delegation & Agent Communication

No Status-Checks: Avoid repeated polling or timer-style status checks on subagents. Use one clear timeout only when needed.  

Event-Driven Wait: Do not babysit every step. Wait for completion signals from subagents instead of repeatedly asking for status.  

Compressed Results: Ask tools and subagents for compressed results instead of raw dumps.

5. Context Protection

Gate Limit: Limit the number of files you can open in a single turn. Do not perform broad file safaris.  

Target Exact Files: Use highly precise instructions. Mention exactly what to look for and the actual symbol names instead of sweeping directories.

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
2. **Context Updates:** When architectural shifts occur, or new significant rules emerge, update this `.agents/AGENTS.md` file to reflect them.
3. **Plan Gate**: Present/confirm plan before implementation → write `plan.md`, obtain parent/user approval before any file writes.
4. **Vite Build**: Always build (npm run build) Vite before E2E tests (playwright) to ensure latest code is evaluated.
5. **No Local CI Env**: Remove `CI=true` when running E2E tests locally → maximize parallel execution speed.

