---
description: Ensure workspace hygiene by preventing clutter in source directories and maintaining centralized agent documentation.
---

# Workspace Hygiene & Context Management

1. **No Temporary Files in Source Directories:**
   - Do NOT leave temporary working files, scratch scripts, or handoff documents (e.g., `handoff.md`, `TEST_READY.md`) in the regular source code directories.
   - If temporary files are needed for execution, place them in a designated scratch space or clean them up immediately after use.

2. **Maintain Context in AGENTS.md:**
   - Summarize critical project context, architectural decisions, and important instructions into `AGENTS.md` (usually located at the project root).
   - Always refer to `AGENTS.md` before making architectural changes.
   - Update `AGENTS.md` whenever new important decisions are made or when overriding previous constraints.
