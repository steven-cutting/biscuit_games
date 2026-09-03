---
title: "Testing"
kind: "reference"
audience: [contributor, maintainer, agent]
canonical_for: [testing_reference]
requires: []
---

# Testing

## Framework

Vitest in two configurations. The unit suite runs in jsdom with `globals: true` so Testing
Library registers its automatic cleanup hook, one setup line in `tests/setup.ts`, and is
configured in `vite.config.ts`. The story suite runs in real Chromium through Playwright
and is configured separately in `vitest.storybook.config.ts`.

A third file, `vitest.config.ts`, names those two as projects and holds nothing else. It
exists because `@storybook/addon-vitest` finds its runner's configuration by filename, and
the Testing Module in the Storybook UI otherwise resolves `vite.config.ts` and fails: the
project it filters for, `storybook:<configDir>`, is declared nowhere the jsdom suite can
see. Both recipes pass `--config` themselves, so neither depends on that discovery.

## Layout

Tests live in `tests/`, never colocated with `src/`. Stories live in `stories/`, also at
the repository root, one file per component — here with no exception at all. Poodl carried
one, `Foundations.stories.svelte`, which documented the design tokens rather than a
component; it is not carried here, because in this repository the tokens are the point
rather than a deviation from it. [Work in the component workshop](../how-to/work-in-the-component-workshop.md)
records that reasoning and what such a story would have to show.

| Suffix | Runner |
| --- | --- |
| `*.test.ts` | Vitest in jsdom. Everything in `tests/`. |
| `*.stories.svelte` | Vitest in Chromium, driven by Storybook. Everything in `stories/`. |
| `*.spec.ts` | Playwright directly. Reserved. Playwright itself is installed — it supplies the browser the story run drives — but no suite of this kind exists. |

Files are named for what they cover rather than mirroring a source path. With one component
the two coincide — `tests/wordmark.test.ts` covers `src/lib/components/Wordmark.svelte` —
but the rule is the first of those, so a suite that covers one contract across several
source files is named for the contract.

One file in `tests/` is not a test. `setup.ts` holds the single import that registers the
jest-dom matchers, and it reaches the run through `setupFiles` in `vite.config.ts`. The
`include` glob is `tests/**/*.test.ts`, so it is loaded and never collected — the same
arrangement a shared fixture file would land in when one is needed.

## Conventions

**Query by accessible role and name.** Never by class, never by test id. A query that
fails because a name is missing has found a real defect: it is the same information a
screen reader uses. The front door's one link is `screen.getByRole('link', { name: 'Poodl' })`
to whichever test reaches for it first; no route test exists yet.

Text that is not a control is the stated exception, and the single test here is it. A
wordmark has no role, so it is found by its text and the assertion is anchored:

```ts
expect(screen.getByText(/biscuit/)).toHaveTextContent(/^biscuit games$/);
```

The anchors are the whole point. The mark's "b" is `aria-hidden`, so the accessible text
of the lockup is exactly the two words; an unhidden mark would read "b biscuit games", and
an unanchored assertion would not notice.

**Inject fakes; never stub a global.** There is no `src/lib/ports/` here and no side effect
to put in one. When the first arrives it arrives behind a port that exports an in-memory
fake alongside the real adapter, with the platform object taken as a defaulted argument.
That is [Decision 0005](../decisions/0005-ports-and-fakes.md), a standing rule for what
lands next rather than a description of existing code. The ban on stubbing a global applies
now: it is not a jsdom workaround, because the story run is a real browser where a global
would work, which is exactly why stubbing one stays forbidden.

**Callbacks are asserted through the props.** Components take callbacks as props, so a
test passes `vi.fn()` and asserts on the call. `Wordmark` takes no props, so nothing
exercises this yet.

**A new component lands with its test and its story in the same change.**

## Story tests

`just storybook-test` renders every story in `stories/` in real Chromium and runs axe over
each one. A violation fails the run, because `.storybook/preview.ts` sets the accessibility
addon's test mode to error; the addon's own default only reports. Play functions run in the
same pass, which is where a guarantee about interaction becomes executable rather than
described.

Two stories are what that comes to today, both on `Wordmark`. **Lockup** holds the
accessible text in a real browser, the same claim the unit test makes in jsdom. **Dark
theme** pins the theme global and asserts that `data-theme` reached
`document.documentElement`, which is the element every palette in `src/app.css` is keyed
on — an attribute written onto a wrapper instead would satisfy no selector in that file.

Stories are fixtures, not assertions. The evidence and the coverage floor stay in `tests/`.
And axe is not exhaustive: it skips what it cannot attribute, including anything behind
`aria-hidden`, so a guarantee resting on such an element still has to be measured by hand.
The wordmark's ruled square is the case already in front of us. It is `aria-hidden`, so the
contrast rule never inspects it, and it holds a single character, which axe downgrades to
*incomplete* and reports without failing. The procedure for measuring by hand is in
[Work in the component workshop](../how-to/work-in-the-component-workshop.md).

The split between the two suites is by what each runner can see rather than by subject.
jsdom holds presence and the resolved cascade; Chromium holds anything only a layout engine
can produce — a width, a height, whether something scrolls sideways at 320px. No figure of
that kind is taken anywhere yet, because one lockup composes nothing. The rule is stated
ahead of the need because the first component with geometry will want it, and because the
contrast test below is split on exactly this line.

## Coverage

v8 provider, measured over `src/lib/**`, with a 90% floor on branches, functions, lines
and statements. Below the floor the run fails. That glob matches exactly one file today,
`src/lib/components/Wordmark.svelte`, which makes the arithmetic unusually sharp: a second
file landing under `src/lib/` without a test is reported at zero and takes the whole figure
to roughly half, however completely everything else is covered.
[Test and debug](../how-to/test-and-debug.md) works that case through.

Only the jsdom suite is measured. Vitest 4 has no per-project coverage option and the v8
provider merges every project that ran into one report before it checks the thresholds, so
a story sharing a run with the unit suite would raise the number without adding an
assertion. The separation is the file it is declared in: the floor lives in
`vite.config.ts`, the story configuration has no coverage block at all, and
`npm run coverage` pins `--config vite.config.ts` so the run that measures the floor is the
run that cannot reach a story.

Distinguish an untested branch from an unreachable one. Defensive code no input can reach
should be deleted rather than covered; see
[Quality philosophy](../explanation/quality-philosophy.md).

## What the current suite proves

| Suite | Covers |
| --- | --- |
| `wordmark.test.ts` | That `Wordmark` renders, and that its accessible text is exactly the lockup: the mark is `aria-hidden`, so "biscuit games" is the whole of it. |

One row is the honest length of that table, and it is more useful as a measure of what is
absent than of what is held. Everything else this repository owns — the token vocabulary,
the design system, the appearance specification — is asserted by no test here.

## The contrast test is not ported

`tests/contrast.test.ts` has not been ported, and porting it is the most valuable single
thing that could be added to this repository. Nothing here recomputes a contrast ratio.
Poodl's version read `src/app.css` from disk, drove all four combinations of theme and
high contrast through the root attributes, and recomputed every pair the palette actually
paints. This repository carries the whole token vocabulary in the same file, result and key
colours included, and the figures written into its comments are Poodl's measurements
travelling as claims — the file's own header says so. The floors are stated in
`docs/specs/appearance.allium` as `minimum_text_contrast = 4.5` and
`minimum_boundary_contrast = 3.0`, and no gate here reads either number.

What axe covers instead is narrower than it looks. It judges the two words of the lockup,
in the appearance each story selects: the default one and the dark one. No story pins high
contrast, so two of the four combinations `EveryCombinationMeetsTheLegibilityFloor` names
are rendered by nothing. A colour in `src/app.css` can therefore be changed to something
illegible and `just check` will pass.

## What a ported contrast test will hit

The first trap is the import. A stylesheet has to be read from disk with `node:fs` rather
than imported. `?raw` is the idiom for pulling a file in as text, but a `.css` file is
claimed by Vite's stylesheet pipeline first and comes back as the empty string — a test
that injected that would assert against an empty cascade and pass on every property at
once. It is worth knowing about because the failure mode is a green test rather than a red
one.

The second is what jsdom can and cannot see, and it is the whole reason evidence of this
kind ends up split across both suites. jsdom resolves custom properties, `touch-action`,
`user-select` and the logical size floors, so the cascade is real and a colour computation
can be taken there at all. It has no layout engine, so `getBoundingClientRect()` returns
zeros and no figure that depends on layout can be taken there — every one of those belongs
in a story, measured in Chromium. And it answers no media query, so the dark palette is
reachable only by attribute: `src/app.css` declares that palette a second time under
`prefers-color-scheme: dark`, and the only way a jsdom test covers both routes is to read
the two blocks as text and hold them equal. That duplication is here, unmeasured.

Its CSS parser also drops `-webkit-tap-highlight-color` and `-webkit-touch-callout`, both
declared in `src/app.css`, so they resolve to nothing whether or not they were declared. A
story can recover the first from Chromium. The second cannot be recovered by either gate,
because desktop Chromium does not report it and the platform it is written for is iOS
Safari, which leaves it to a check on a real phone; see
[Accessibility](../explanation/accessibility.md).

## Related pages

- [Test and debug](../how-to/test-and-debug.md)
- [Work in the component workshop](../how-to/work-in-the-component-workshop.md)
- [Quality gates](quality-gates.md)
- [Accessibility](../explanation/accessibility.md)
