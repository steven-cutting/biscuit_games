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
the repository root, one file per component, with one stated exception:
`stories/Foundations.stories.svelte` documents the design tokens rather than a component,
and [Work in the component workshop](../how-to/work-in-the-component-workshop.md) records
why the tokens earn the exception here.

| Suffix | Runner |
| --- | --- |
| `*.test.ts` | Vitest in jsdom. Everything in `tests/`. |
| `*.stories.svelte` | Vitest in Chromium, driven by Storybook. Everything in `stories/`. |
| `*.spec.ts` | Playwright directly. Reserved. Playwright itself is installed — it supplies the browser the story run drives — but no suite of this kind exists. |

Files are named for what they cover rather than mirroring a source path.
`tests/primitives.test.ts` covers four components, `tests/contrast.test.ts` covers one
guarantee across a stylesheet, and `tests/wordmark.test.ts` happens to coincide with its
source; the rule is the first of those.

One file in `tests/` is not a test. `setup.ts` holds the single import that registers the
jest-dom matchers, and it reaches the run through `setupFiles` in `vite.config.ts`. The
`include` glob is `tests/**/*.test.ts`, so it is loaded and never collected.
`stories/fixtures.ts` is the same arrangement on the story side: the two figures the plays
measure a control against, imported by the stories that need them and never a story.

## Conventions

**Query by accessible role and name.** Never by class, never by test id. A query that
fails because a name is missing has found a real defect: it is the same information a
screen reader uses. The front door's one link is `screen.getByRole('link', { name: 'Poodl' })`
to whichever test reaches for it first; no route test exists yet.

Text that is not a control is the stated exception, and the wordmark's test is it. A
wordmark has no role, so it is found by its text — and it takes two assertions, not one:

```ts
expect(screen.getByText('b')).toHaveAttribute('aria-hidden', 'true');
expect(screen.getByText(/biscuit/)).toHaveTextContent(/^biscuit games$/);
```

The second is the obvious one: the anchors catch the words gaining text, so a lockup that
read "biscuit games beta" would fail. The first is the one worth explaining. A text query
matches an element's **own** text nodes rather than everything inside it, so
`getByText(/biscuit/)` resolves to the span holding the words and never to the lockup
around it — which means it finds them whether or not the mark beside them is hidden.
Anchoring does not repair that. The mark's silence is a separate claim and takes a separate
assertion, and without it deleting `aria-hidden` leaves the suite green.

**Inject fakes; never stub a global.** `src/lib/ports/preferences.ts` is the first port:
an interface, a real adapter that takes its host object as a defaulted argument, and an
in-memory fake. `tests/preferences.test.ts` reaches every arm of the adapter by passing a
fake `matchMedia`, an empty host and nothing at all, and stubs no global. That is
[Decision 0005](../decisions/0005-ports-and-fakes.md) carried out. The ban is not a jsdom
workaround: the story run is a real browser where a global would work, which is exactly why
stubbing one stays forbidden. `Modal` reads `document.activeElement` directly, and
[decision 0014](../decisions/0014-the-hub-holds-the-design-system.md) says why that is focus
management on the component's own document rather than a side effect the rule reaches.

**Callbacks are asserted through the props.** Components take callbacks as props, so a
test passes `vi.fn()` and asserts on the call: every control's `onclick`, `Modal`'s
`onclose`, `Notice`'s `ondismiss`, the chip's and the actions' in `HeaderBar`.

**A new component lands with its test and its story in the same change.**

## Story tests

`just storybook-test` renders every story in `stories/` in real Chromium and runs axe over
each one. A violation fails the run, because `.storybook/preview.ts` sets the accessibility
addon's test mode to error; the addon's own default only reports. Play functions run in the
same pass, which is where a guarantee about interaction becomes executable rather than
described.

Thirty-seven stories across nine files. `Wordmark`'s **Dark theme** is the one every other
dark pin rests on: it asserts that `data-theme` reached `document.documentElement`, which is
the element every palette in `src/app.css` is keyed on — an attribute written onto a wrapper
instead would satisfy no selector in that file. The plays that carry a guarantee about
interaction are `Modal`'s focus trap, `Notice`'s keyboard dismissal, `HeaderBar`'s tab order
and its layout at the narrowest supported width, and the target sizes `Button` and
`IconButton` measure.

Stories are fixtures, not assertions. The evidence and the coverage floor stay in `tests/`.
And axe is not exhaustive: it skips what it cannot attribute, including anything behind
`aria-hidden`, so a guarantee resting on such an element still has to be measured by hand.
The wordmark's ruled square is the case already in front of us. It is `aria-hidden`, so the
contrast rule never inspects it, and it holds a single character, which axe downgrades to
*incomplete* and reports without failing. The procedure for measuring by hand is in
[Work in the component workshop](../how-to/work-in-the-component-workshop.md).

The split between the two suites is by what each runner can see rather than by subject.
jsdom holds presence and the resolved cascade — the component suites and the contrast test;
Chromium holds anything only a layout engine can produce — a control's box against the 44px
fixture, and whether the header scrolls sideways at 320px. The contrast test below is split
on exactly this line.

## Coverage

v8 provider, measured over `src/lib/**`, with a 90% floor on branches, functions, lines
and statements. Below the floor the run fails. That glob matches every component, the icon
map, the barrel, the port, the domain and `config.ts`; a file landing under `src/lib/`
without a test is reported at zero and drags the figure down, and
[Test and debug](../how-to/test-and-debug.md) works that case through. One arm is dead by
construction and accepted: `Icon`'s `size` interpolation compiles to a nullish fallback no
default can reach, and it is the one branch the glob leaves uncovered.

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
| `icons.test.ts` | That the map and the directory agree, that every value is SVG markup restroked to 1.5 in `currentColor`, and that the ISC text is beside the files. |
| `primitives.test.ts` | `Icon`, `IconButton`, `Button` and `HeaderBar`: role, name, press, disabled, `aria-haspopup`, `aria-current`, the sized icon, the brand snippet, the chip and the actions. |
| `shells.test.ts` | `Announcer`, `Notice` and `Modal`: the two live regions and their repeat-by-sequence, dismissal, and the dialog's focus, Escape and Tab contract in both directions. |
| `contrast.test.ts` | Every pair the stylesheet declares against the two floors, in all four combinations; the palette's shape; the two dark blocks and the two high-contrast sets held equal. |
| `preferences.test.ts` | The port: the three queries, change subscription and its end, the fake, and the absent-`matchMedia` fallback reached by argument and by default. |
| `appearance.test.ts` | The three derivations, clause by clause. |
| `package-surface.test.ts` | Every runtime export by name, a render through the barrel, and the type exports held at compile time. |

## The contrast test

`tests/contrast.test.ts` reads `src/app.css` from disk, drives all four combinations of
theme and high contrast through the root attributes, and recomputes every pair the palette
declares against the floors `docs/specs/appearance.allium` states —
`minimum_text_contrast = 4.5` and `minimum_boundary_contrast = 3.0`, read from
`src/lib/config.ts`. It came from Poodl by
[decision 0014](../decisions/0014-the-hub-holds-the-design-system.md), minus the block that
measured Poodl's own state separations, which the specification leaves to the game. The
figures in the stylesheet's comments are what it measures.

Three things about it are worth knowing before editing it.

The import. A stylesheet has to be read from disk with `node:fs` rather than imported.
`?raw` is the idiom for pulling a file in as text, but a `.css` file is claimed by Vite's
stylesheet pipeline first and comes back as the empty string — a test that injected that
would assert against an empty cascade and pass on every property at once. The failure mode
is a green test rather than a red one.

What jsdom can and cannot see, which is the reason evidence of this kind is split across
both suites. jsdom resolves custom properties, `touch-action`, `user-select` and the
logical size floors, so the cascade is real and a colour computation can be taken there —
with one wrinkle the test's `token()` helper walks: jsdom reports `var(--background)`
rather than substituting it. It has no layout engine, so `getBoundingClientRect()` returns
zeros and every figure that depends on layout belongs in a story, measured in Chromium. And
it answers no media query, so the dark palette is reachable only by attribute: `src/app.css`
declares that palette a second time under `prefers-color-scheme: dark`, and the test covers
both routes by reading the two blocks as text and holding them equal, and the two
high-contrast blocks to the same set of names.

Its CSS parser also drops `-webkit-tap-highlight-color` and `-webkit-touch-callout`, both
declared in `src/app.css`, so they resolve to nothing whether or not they were declared. A
story can recover the first from Chromium. The second cannot be recovered by either gate,
because desktop Chromium does not report it and the platform it is written for is iOS
Safari, which leaves it to a check on a real phone; see
[Accessibility](../explanation/accessibility.md).

Axe is the other half, and narrower than it looks: it judges one rendered story in the
appearance its globals select, so a palette is covered when a story pins it and never
automatically. Every story file that draws something pins dark, and dark high contrast where
the look inverts; `Announcer`'s does not, because a visually hidden live region looks the
same in every palette and pinning one would prove nothing. A
colour changed to something illegible fails the contrast test in every combination before
any story is rendered.

## Related pages

- [Test and debug](../how-to/test-and-debug.md)
- [Work in the component workshop](../how-to/work-in-the-component-workshop.md)
- [Quality gates](quality-gates.md)
- [Accessibility](../explanation/accessibility.md)
