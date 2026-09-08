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
| `*.svelte` in `tests/` | None. A caller a test imports so it can write a binding in the shape a consumer writes it, matched by no glob and collected by nothing. `ButtonHost.svelte` and `ExplainerHost.svelte` are the two: one writes a `bind:`, the other passes snippet values inside a prop object, and neither shape can be written from a `.ts` file. |
| `*.spec.ts` | Playwright directly. Reserved. Playwright itself is installed — it supplies the browser the story run drives — but no suite of this kind exists. |

Files are named for what they cover rather than mirroring a source path.
`tests/primitives.test.ts` covers eight components, `tests/contrast.test.ts` covers one
guarantee across a stylesheet, and `tests/brand.test.ts` covers both halves of one lockup
rather than either half's file — it was `wordmark.test.ts` until decision 0017 gave
`Wordmark` a `Monogram` to compose. The rule is the first of those.

Two files in `tests/` are not tests. `setup.ts` holds the single import that registers the
jest-dom matchers, and it reaches the run through `setupFiles` in `vite.config.ts`.
`ButtonHost.svelte` is a caller: it writes `bind:element` on a `Button` and hands back what
the binding delivered, because `bind:` is template syntax that a `.test.ts` has none of, and
a component is the shape the consumer carrying focus across a swap actually writes. The
`include` glob is `tests/**/*.test.ts`, so both are loaded and neither is collected.
On the story side the figures a play measures a control against come from
`src/lib/config.ts`, which mirrors the module that states them — so a play is held to the
specification rather than to a number beside it, and raising the figure in one place cannot
leave the other behind.

## Conventions

**Query by accessible role and name.** Never by class, never by test id. A query that
fails because a name is missing has found a real defect: it is the same information a
screen reader uses. The front door's one link is a `GameCard`, whose name is the whole card —
the game's name, its line of prose and its meta line, in that order — so the query that
reaches it is `screen.getByRole('link', { name: /poodl/ })` rather than an exact string. No
route test exists yet; `tests/primitives.test.ts` asserts that name on the component instead.

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

**A decoration that discharges a guarantee is the other exception, and the marker bar is
it.** The bar that carries `play-surfaces.allium`'s `AMarkIsNeverOnlyAColour` is
`aria-hidden` by construction: it has no role and no accessible name *because* the name
beside it already says the same thing in the game's words, and giving the bar one would have
a reader hear the mark twice. So the role-and-name convention cannot reach it, and it is
queried by `[data-marker]`.

The exception is bounded three ways, and a hook that fails any of them is a test id by
another name. It sits on an element that is `aria-hidden` because the guarantee it discharges
is the *visual* half of a claim whose spoken half is carried elsewhere. It is reached only
from inside an element already found by role and name —
`getByRole('img', { name }).querySelector('[data-marker]')`, never a bare document query. And
it is named for the guarantee rather than for the component, so `Tile` and `Key` are queried
the same way and a third surface that draws one inherits the query.

What is not granted is a hook for state. A mark's own name is in the accessible name and the
element is found by it, so nothing here needs `data-mark` to locate one — the attribute
exists because CSS selects the paint by it, and a test that reached for it would be asserting
the implementation rather than the promise.

This extends a position the page already takes rather than opening a new one. An accessible
name is not evidence that a bar was drawn: the description is the game's words arriving
through a prop, so asserting the name ends in them proves the prop was plumbed and nothing
more — an implementation that drew no bar at all would keep every name-based assertion green.
And axe cannot stand in either, because it "skips what it cannot attribute, including anything
behind `aria-hidden`". jsdom holds the bar's presence; Chromium holds its length, because
only a layout engine can measure a width.

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

A hundred and twenty-four stories across twenty-four files. `Wordmark`'s **Dark theme** is
the one every other dark pin rests on: it asserts that `data-theme` reached `document.documentElement`, which is
the element every palette in `src/app.css` is keyed on — an attribute written onto a wrapper
instead would satisfy no selector in that file. The plays that carry a guarantee about
interaction are `Modal`'s focus trap, `Notice`'s keyboard dismissal, `HeaderBar`'s tab order
and its layout at the narrowest supported width, the target sizes `Button`, `IconButton`,
`GameCard`, `Switch` and `SegmentedControl` measure, `SegmentedControl`'s one-stop-and-arrows
contract — which also holds that nothing between the radio and its fieldset clips, because
the ring `app.css` draws lands entirely outside a radio that fills its segment and a
rounded row once ate all but a sliver of it — and `Input`'s text floor — the last of which is the only figure in
`src/lib/config.ts` no test under `tests/` can measure at all, because jsdom's own default
input font is already 16px and an assertion there would pass whether or not the rule
existed.

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

`Modal`'s focus trap is the one place the split does not help, and it is worth knowing why.
Neither suite presses Tab: both drive `@testing-library/user-event`, which computes the next
stop in JavaScript and calls `focus()`, so the oracle is the same library in Chromium as in
jsdom and the browser's own tab order is never consulted. Where the two agree —
which radio of a group the keyboard stops on, which controls the layout draws, a control a
disabled `fieldset` has turned off, a disclosure's summary — `tests/shells.test.ts` settles
it. Where they part, nothing here can measure the difference: `user-event` scopes a radio
group by name alone, so two forms holding a group of the same name are two groups to a
browser and one to it. `Modal.svelte` follows the browser and says so, and the claim rests on
the HTML specification rather than on a gate.

## Coverage

v8 provider, measured over `src/lib/**`, with a 90% floor on branches, functions, lines
and statements. Below the floor the run fails. That glob matches every component, the icon
map, the barrel, the ports, the domain and `config.ts`; a file landing under `src/lib/`
without a test is reported at zero and drags the figure down, and
[Test and debug](../how-to/test-and-debug.md) works that case through. A few arms are dead by
construction and accepted, and each is named here so that a new one is noticed rather than
assumed. `Icon`'s `size` interpolation compiles to a nullish fallback no default can reach.
`Select`'s `<option value>` compiles to two more, both in code Svelte wrote: a guard that
skips the write when the option's value has not changed, which cannot fail because the each
block is keyed by that same value and so a value never changes under a node that is already
drawn; and a `?? ''` beneath it, which cannot fire because an option's value is a
required string. None of the three is reachable from a test, all are counted against the
floor anyway, and the floor is met with room — the figure to watch is the aggregate rather
than any one file's column.

The `<select>`'s own binding has a fourth arm of the same shape and it *is* reachable, which
is the distinction worth keeping: it fires only when a value that was given is taken away,
so `fields.test.ts` takes one away. A generated arm is dead by construction or it is a test
nobody has written yet, and the two are told apart by reading the compiled output rather
than by guessing at the mechanism.

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
| `brand.test.ts` | `Wordmark` and `Monogram`: that the lockup's accessible text is exactly "biscuit games" with the mark `aria-hidden`, that it names a game after the platform when given one, and that the mark is silent by default, named when it stands alone, and draws at 20px the four figures it drew as literals before decision 0017 pulled it out of `Wordmark`. |
| `icons.test.ts` | That the map and the directory agree, that every value is SVG markup restroked to 1.5 in `currentColor`, and that the ISC text is beside the files. |
| `primitives.test.ts` | `Icon`, `IconButton`, `Button`, `HeaderBar`, `Card`, `CardLabel`, `Badge` and `GameCard`: role, name, press, disabled, `aria-haspopup`, `aria-current`, the sized icon, the element `Button` hands back to a caller that binds it, the brand snippet, the chip, the actions across a rename and a repeated name, that the grouping chrome carries the words it is given, and that a `GameCard` is a link exactly when there is somewhere to go — a planned game being no control at all rather than a dimmed one, and saying so in words. |
| `fields.test.ts` | `Switch`, `SegmentedControl`, `SettingsRow`, `Input` and `Select` against the `Fields` surface: a name bound to the control rather than beside it, the control's own line bound as its description, a switch reporting its state in words as well as in position, a group of exclusive choices that is one tab stop with the arrows moving inside it, a placeholder that is never the name, a refusal reported through `aria-invalid` and not only inked, and every one of them asking nothing of a caller that supplied no handler. |
| `shells.test.ts` | `Announcer`, `Notice` and `Modal`: the two live regions and their repeat-by-sequence, dismissal, and the dialog's focus, Escape and Tab contract in both directions, over the stops the keyboard really makes — a group of radios, a control the layout does not draw, one a disabled `fieldset` has turned off, and a disclosure's summary. |
| `contrast.test.ts` | Every pair the stylesheet declares against the two floors, in all four combinations; the palette's shape; the two dark blocks and the two high-contrast sets held equal. |
| `preferences.test.ts` | The port: the three queries, change subscription and its end, the fake, and the absent-`matchMedia` fallback reached by argument and by default. |
| `appearance.test.ts` | The three derivations, clause by clause. |
| `package-surface.test.ts` | Every runtime export by name — the components, the two ports, the appearance derivations, the claiming rule and the platform layout — a render through the barrel, and the type exports held at compile time by being written against rather than merely imported. |
| `operation.test.ts` | `operation.allium` over the stylesheet: a tap reaching the control rather than the platform, text a reader selects left alone, the viewport never refusing to be zoomed, the 44px floor on every native control the stylesheet names — a select, a disclosure summary and every input but a checkbox, a radio and a hidden one — and on the label row that carries it for a checkbox, the same control set declining the platform's tap guess with the label half and the text half split, the link in a sentence the invariant exempts, all three config figures, and the pressed ring on exactly the controls whose platform flash was suppressed — the two lists compared outright rather than by asking whether each mentions a label. |
| `play.test.ts` | `Tile`, `Key`, `Keyboard` and `Explainer`: the name a caller composes and the one the platform falls back to, the three marks and none, the bar present on two of them and absent on the third, the press, the disabled key that keeps its bar and its name, a layout the component has never seen, a layout with no keys in it drawing no keyboard at all, a mark whose words are blank or absent drawn as no mark, a cell and a key whose only words are a blank named as though they had none, a key its layout named with nothing drawn and left unnamed, a key valued `constructor` reading no mark off `Object.prototype` and still reading the one the game keyed there, and the sentences carrying an explanation whose examples are silent — including two rows that say the same thing. |
| `typing.test.ts` | `claimKey`'s guards one at a time with no DOM at all; `latinLetters` naming the twenty-six and refusing the two that Unicode case folding once let through; the adapter reading a real event down to a `KeyPress` — each shortcut modifier on its own, Shift not among them, a focused `<summary>` as something the browser activates, and a press that began at no element; `QWERTY` and `QWERTY_BINDINGS` held equal, which is the gate `layouts.ts` cited before it existed; and that unmounting `PhysicalKeyboard` leaves no listener behind. |

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
