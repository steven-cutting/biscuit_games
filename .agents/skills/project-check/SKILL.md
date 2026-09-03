---
name: project-check
description: Bring a workspace to a state where the full gate runs, and interpret what it reports.
---

# Run the full gate

1. Read `AGENTS.md`. The `Justfile` is the only supported interface to the checks; do not assemble an equivalent pipeline by hand.
2. Check the prerequisites exist: `uv.lock`, `package-lock.json`, `node_modules/` and the pinned checker at `.tools/bin/allium`. The checker alone is `just install-allium`; it is gitignored and per-worktree, so a fresh worktree needs it before gates 2, 10 and 11 can pass.
3. Do not run `just install-hooks` from a secondary worktree. It writes an absolute path into `.git/hooks/`, which every worktree of this repository shares, so a hook installed here runs against this worktree's virtual environment from every other one — and keeps doing so after this worktree is deleted. Install hooks from the primary checkout or not at all.
4. Run `just check`. It runs each recipe in order and snapshots the worktree between them, comparing against a baseline it took at the start.
5. Read only the first failure. The gates are ordered so that a later failure is often a consequence of an earlier one.
6. A report that a recipe changed the worktree is a defect in that recipe, not in the change under test. Checks are read-only; `just fix` is where mutation belongs. The usual cause is a generated file that no longer matches a `.gitignore` entry.
7. Hand a failing gate to the `fix-quality` skill rather than working around it.
8. `just check` already proves the run changed nothing, so it needs no clean worktree and no commit first. Bare `just check-clean` is the stricter, separate question of whether the worktree matches `HEAD`; run it only when that is what you mean.
