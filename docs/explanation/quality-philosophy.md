---
title: "Quality philosophy"
kind: "explanation"
audience: [contributor, maintainer, agent]
canonical_for: [quality_philosophy]
requires: []
---

# Quality philosophy

Gates encode decisions, not taste. Each one exists because someone decided something, and
the gate is what stops the decision quietly reverting. If a gate cannot be traced back to
a decision, it should be deleted rather than tolerated.

## Checks are read-only

Every recipe under `just check` reports and never repairs. `run_project_check.py` enforces
this by snapshotting the worktree and comparing it after every recipe, so a check that
rewrites a file fails the run rather than hiding drift. Repair is `just fix`, which is the
aggregate rather than the only writer — `just format` and the two lock recipes write as well;
[Commands](../reference/commands.md) is the list.

This is why the pre-commit configuration is split in two. `.pre-commit-config.yaml` is
the gate and is what gets installed; `.pre-commit-fix.yaml` holds the mutating hooks and
runs only from `just fix`.

## Fix the cause, not the report

A suppression is a last resort: one rule, one line, with a stated reason. Lowering the
coverage threshold, disabling a lint rule at a call site, or loosening an assertion until
it passes are all ways of deleting the signal while keeping the machinery.

Where a rule is genuinely wrong for this project, the fix is to configure it once, in the
config file, with a comment saying why. Nothing here has needed that yet.
`eslint.config.js` turns no rule off or down on the project's own account: it adopts the
recommended sets whole, and every per-file block in it scopes a parser or the type
program rather than excusing a rule, each with its reason written beside it. Poodl
carries two such exceptions and neither was ported: an exception is an argument about a
particular body of code, and the platform primitives came across without needing either —
the one place Poodl's template-expression override would have fired, a pixel width in a
story, is written as a string instead. The first
exception added here carries its reason in `eslint.config.js`, where the rule lives.

## Unreachable is not untested

Coverage distinguishes two things that look alike. A branch no input can reach is not a
gap in the tests; it is code that should not exist. Three such branches were removed
while building Poodl rather than covered by contrived tests — a bounds check after a
modulo, a null fallback after an exhaustive assignment, and a defensive default that no
caller could trigger. The rule came over with the toolchain: `Wordmark.svelte` refuses a
prop for a game name in its own docblock, on the grounds that a prop nothing here uses
would be a branch with nothing to cover it, and `HeaderBar` takes a game's lockup as a
snippet for the same reason rather than as a name with a branch behind it. `Modal`'s
focus handoff is an attachment rather than a bound element for the same reason again: the
bound form carries an arm for an element that is never unset.

The corollary: do not chase the last few percent. The floor is 90, and the suite reports
100 on statements, functions and lines over `src/lib/**` and one branch short of it — the
compiled arm `Icon`'s size interpolation carries and no default can reach, which
[Testing](../reference/testing.md) records as dead by construction. That is the figure a
real component set produces, and it is the reason the floor is 90 and not 100: a branch
the compiler emits and no input reaches is not a gap in the tests.

## Tests inject, they do not stub

A fake is not a mock. It behaves — the fake clock advances, the fake storage remembers,
the fake random walks a sequence you chose. Tests that assert a function was called are
not evidence that anything works.

Stubbing a global is banned outright, and
[decision 0005](../decisions/0005-ports-and-fakes.md) is what makes the ban affordable:
a side effect sits behind a port — `src/lib/ports/preferences.ts` is the first — and the
real adapter takes its platform object as a defaulted argument rather than reading a
global, so `tests/preferences.test.ts` reaches every arm of it by passing a host in. That
rule is worth more here than it sounds, because the test environment came over unchanged
and provides no
`localStorage`, no `navigator.clipboard` and no `matchMedia` at all. The preferences port
is the one side effect, and its test is what holds the rule: an adapter that reached for
the global would fail in jsdom, and one that takes its host as an argument runs.

## The specification is the arbiter

When a test and the code disagree, one of them is wrong and the specification says which.
Neither is adjusted until it passes.

## Related pages

- [Quality gates](../reference/quality-gates.md)
- [Testing](../reference/testing.md)
- [Specifications](specifications.md)
