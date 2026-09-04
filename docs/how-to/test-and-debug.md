---
title: "Test and debug"
kind: "how-to"
audience: [contributor, maintainer, agent]
canonical_for: [test_workflow]
requires: []
---

# Test and debug

## Run the suites

```console
just frontend-unit        # Vitest, once
just frontend-coverage    # Vitest with the coverage floor enforced
just frontend-static      # ESLint, Prettier check, svelte-check
just storybook-test       # every story in Chromium, with axe over each
```

To iterate on one file, watch it:

```console
just frontend-watch tests/wordmark.test.ts
just frontend-watch                          # everything, still watching
```

Do not reach for `npx vitest <file>` instead. Bare Vitest resolves `vitest.config.ts`, which
names both projects, so the browser project loads and Chromium comes with it — a run that
wanted one jsdom file. The recipe pins `vite.config.ts` the way `just frontend-unit` and
`just frontend-coverage` already do; see [Testing](../reference/testing.md).

There is one test file today, so the suite and that file are the same run. That stops
being true the moment a second component lands, and the habit of naming the file is worth
keeping until then.

Framework configuration and conventions are described in
[Testing](../reference/testing.md); this page is about narrowing down a failure.

## Narrow down a failing test

1. Run the single file first. A failure that only appears in the whole suite is usually
   shared state, and there is almost none of it here — one component, one test file, and
   no side effects to construct.
2. If a component assertion fails, read the DOM that Testing Library prints. It shows the
   accessible names, which is what the queries match on.
3. If the expectation is about appearance — theme, high contrast, animations — work it
   through by hand against `docs/specs/appearance.allium`. The specification is the
   arbiter, not the current code. Note what it will not do for you: nothing in this
   repository recomputes a contrast ratio, so `EveryCombinationMeetsTheLegibilityFloor`
   fails no test here. Any ratio quoted in the handbook is an inherited claim, and a
   change that could move one is answered by measuring, not by a green run.
4. Do not weaken an assertion to make it pass. If the specification is wrong, change the
   specification — see [Work with the specifications](work-with-the-specs.md).

## Debug a coverage failure

`just frontend-coverage` prints the uncovered lines per file. Two cases look alike and are
not:

- **Untested behaviour.** Add the test. This is the common case.
- **Unreachable code.** A defensive branch no input can reach, or a Svelte-compiled
  update branch for a value that never changes. Remove the branch rather than inventing
  a test that reaches it artificially.

Never lower the threshold in `vite.config.ts`.

Read a red coverage gate here as arithmetic before reading it as a missing branch. The
floor is 90% of branches, functions, lines and statements over `src/lib/**`, and the
measured glob matches exactly one file today: `src/lib/components/Wordmark.svelte`, the
fonts beside it being neither TypeScript nor Svelte. A file added under `src/lib/` without
a test is reported at zero and joins totals small enough that one such file of comparable
size takes the whole figure to roughly half — far under the floor, however completely
everything else is covered. So the usual cause is not a branch nobody thought about; it is
something landing without its test — the case
[decision 0011](../decisions/0011-skeleton-not-a-second-application.md) makes likely, and
the one the floor exists to catch. The remedy is the test, in the same change.

## Debug a browser problem

There is no server, so the browser and the build output are the whole system.

```console
just frontend-build
just preview
```

Both assume the site root, so the preview sits where the build expects to be served from,
and the hub site is published nowhere — see
[decision 0012](../decisions/0012-the-domain-root-stays-with-poodl.md).

If something works under `just dev` but not under `just preview`, suspect prerendering:
module-scope work runs once at build time, and anything per-visitor must happen in the
browser.

## Related pages

- [Testing](../reference/testing.md)
- [Quality gates](../reference/quality-gates.md)
- [Work in the component workshop](work-in-the-component-workshop.md)
- [Troubleshooting](../operations/troubleshooting.md)
