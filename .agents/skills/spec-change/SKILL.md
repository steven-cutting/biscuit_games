---
name: spec-change
description: Change a shared Allium specification and carry the change through the documentation and every consumer.
---

# Change a shared specification

The specifications under `docs/specs/` decide shared behaviour for the whole platform. Code that disagrees with one is wrong until the specification is changed to say otherwise, so the specification moves first and everything else follows.

1. Read `AGENTS.md` and `docs/explanation/specifications.md`. One module exists today: `appearance.allium`, the shared appearance surface every game inherits. A behaviour belonging to one game belongs in that game's own specifications instead.
2. Read the whole module before editing, including its `Scope`, `Excludes` and `open question` blocks. A change that belongs in another module's scope goes there instead.
3. Edit the specification: state the rule as a trigger, its guards and its outcomes. Record what you could not decide as a new `open question` rather than guessing at a product decision.
4. Keep the module self-contained. It imports nothing on purpose, so a game can inherit it rather than restate it; an external entity here draws a diagnostic precisely because a root module has no governing specification to name.
5. Derive the tests from the changed clauses before writing implementation, and confirm they fail first. A test that is already green proves nothing about the new behaviour.
6. Run `just check-specs`. It asserts that every module reports an empty `diagnostics` array — it reads the JSON rather than the exit code, so an `info` diagnostic fails it too — and an untouched checkout is clean, so anything it reports is a regression your change introduced. Fix it at the root; only a construct the pinned checker is verifiably wrong about may be waived, as a whole-line `-- allium-ignore <code>` comment directly above the diagnosed line with its reason on the comment line above it. Then run `just analyse-specs`, which asserts the `findings` array is empty as well; a finding cannot be waived. Both are gates: they run as pre-commit hooks and inside `just check`, and both need `just install-allium` in a fresh worktree.
7. Run the `consumer-impact` skill. A guarantee changed here changes what a game already claims to satisfy, and no gate in either repository compares the two.
8. Run `just frontend-unit`, then `just check` before handoff.
