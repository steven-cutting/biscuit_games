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

Every recipe under `just check` reports and never repairs. `just fix` is the only command
allowed to modify files. `run_project_check.py` enforces this by snapshotting the
worktree and comparing it after every recipe, so a check that rewrites a file fails the
run rather than hiding drift.

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
carries two such exceptions and neither was ported, because an exception is an argument
about a particular body of code and this repository has not yet made one. The first
exception added here carries its reason in `eslint.config.js`, where the rule lives.

## Unreachable is not untested

Coverage distinguishes two things that look alike. A branch no input can reach is not a
gap in the tests; it is code that should not exist. Three such branches were removed
while building Poodl rather than covered by contrived tests — a bounds check after a
modulo, a null fallback after an exhaustive assignment, and a defensive default that no
caller could trigger. The rule came over with the toolchain: `Wordmark.svelte` refuses a
prop for a game name in its own docblock, on the grounds that a prop nothing here uses
would be a branch with nothing to cover it.

The corollary: do not chase the last few percent. The floor is 90, and the suite
currently reports 100 on all four measures over `src/lib/**` — one component, one test,
no branches at all. That figure is a floor being proved to work rather than an
achievement, and it says nothing about what the number will look like once components
with real behaviour arrive. When it falls back towards the floor, the answer is still not
a contrived test.

## Tests inject, they do not stub

A fake is not a mock. It behaves — the fake clock advances, the fake storage remembers,
the fake random walks a sequence you chose. Tests that assert a function was called are
not evidence that anything works.

Stubbing a global is banned outright, and
[decision 0005](../decisions/0005-ports-and-fakes.md) is what makes the ban affordable:
when a side effect arrives it sits behind a port, and the real adapter takes its platform
object as a defaulted argument rather than reading a global. That rule is worth more here
than it sounds, because the test environment came over unchanged and provides no
`localStorage` and no `navigator.clipboard` at all. Nothing in this repository has a side
effect yet — the one component takes no props and touches no platform — so until the
first one lands the rule is held by review rather than by a failing test.

## The specification is the arbiter

When a test and the code disagree, one of them is wrong and the specification says which.
Neither is adjusted until it passes.

## Related pages

- [Quality gates](../reference/quality-gates.md)
- [Testing](../reference/testing.md)
- [Specifications](specifications.md)
