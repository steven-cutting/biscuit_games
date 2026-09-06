---
title: "Decision 0014: The hub holds the design system"
kind: "decision"
audience: [contributor, maintainer, agent]
canonical_for: [decision_hub_holds_the_system]
requires: []
---

# Decision 0014: The hub holds the design system

> **Narrowed on 2026-09-05 by
> [Decision 0016](0016-the-play-surface-is-the-platforms.md).** The play-surface primitives
> named below are here now: `Tile`, `Key`, `Keyboard`, `PhysicalKeyboard` and `Explainer`
> came across generalised, on the precedent this record set with `HeaderBar` and `Notice`.
> `Board` and `DistributionChart` stay with the game. Everything this record decided about
> the platform primitives, the icon set, the contrast test, the port and the rule for adding
> a component stands unchanged, and its reasoning is what 0016 applies rather than what 0016
> contradicts. The third reopener below is **overruled rather than carried out**: no second
> game exists, and 0016 says why a second game was the wrong trigger.
>
> **Narrowed on 2026-09-05 by
> [Decision 0015](0015-operation-and-play-are-specified-here.md).** Two figures this record
> settles are settled differently now. The constraint windows behind `--n-65` and `--n-75`
> are no longer held at one end here and the other in Poodl: `play-surfaces.allium` states
> both separations, so `tests/contrast.test.ts` holds both ends. And the 44px target and the
> 320px width are no longer story fixtures: `operation.allium` states them, and
> `src/lib/config.ts` mirrors them exactly as it already did for the two contrast floors.

## Context

[Decision 0011](0011-skeleton-not-a-second-application.md) shipped the toolchain whole and
the application as a skeleton: one route, one component, the token stylesheet, and a rule
that a component is added when the hub site needs one or a second consumer appears — "never
speculatively", because "a component built here for a game that does not exist is a guess
with a test around it". [Decision 0010](0010-biscuit-games-design-system.md) recorded the
port of the tokens and the typefaces and left the components, the icons and the contrast
test in Poodl, and the porting guide's rule followed: port when more than one consumer wants
the shape.

That left the platform's design system with exactly one full implementation, and it was in
a game. The stylesheet was here; the components that spend it, the icons they draw, the
test that measures the palette's ratios and the port that reads the device were in Poodl.
[Decision 0001](0001-biscuit-games-is-the-source-of-truth.md) makes this repository the
source of truth for what every game shares, and
[decision 0013](0013-shared-material-travels-as-a-package.md) makes the package the way a
file reaches a game. A package that shipped a stylesheet and one lockup, while the
components every game will render lived in the first game, was the arrangement 0001 exists
to end: the game's copy was the superset, and the hub was authoritative over material it
did not hold.

On 2026-09-04 the maintainer settled it. Biscuit Games is the home of everything shared
across the games, so the design system is copied here in full, and Poodl will consume it
from the package afterwards.

## Decision

The hub holds the design system's implementation, not only its vocabulary. From Poodl at
`a24f6c7112fbd8bf7a814c655ccaa81108a92b30`, the platform primitives came across:

- The icon set: the 22 restroked Lucide SVGs, the ISC licence text, the `icons.ts` map that
  names all of them, and `Icon`.
- `Button`, `IconButton`, `HeaderBar`, `Modal`, `Notice` and `Announcer`, each with a test
  and a story.
- `tests/contrast.test.ts`, which reads `src/app.css` from disk and measures every pair the
  palette declares against the floors `appearance.allium` states, in all four combinations
  of theme and high contrast.
- `src/lib/ports/preferences.ts`, the first port, and `src/lib/domain/appearance.ts` with
  the `ThemeChoice` type beside it; `src/lib/config.ts` mirrors the specification's two
  floors for the test to read.
- `stories/Foundations.stories.svelte`, the token specimen.

The play-surface primitives stay in Poodl: `Tile`, `Board`, `Keyboard`, `PhysicalKeyboard`,
`DistributionChart` and `HowToPlay` carry Poodl's behaviour contracts, and the line in
[What the hub owns](../project/what-the-hub-owns.md) is unchanged — a shape that means
something only inside one game is that game's.

The rule for adding a component changes. A platform-shaped component, one a second game
would render unchanged, is built or ported here first, whether or not a second consumer
exists yet, because this is where the platform's shapes are decided. The hub's own site does
not have to need it. What stays forbidden is guessing a game's shape, and the test in What
the hub owns still decides which side of the line a component sits on.

Two contracts were generalised on the way, because Poodl's carried Poodl's vocabulary.
`HeaderBar` takes a `brand` snippet, an optional chip of `{ word, label, onclick, popup }`
and a list of actions of `{ icon, label, onclick, popup }` rather than a game mode, a game
status and five named callbacks. `Notice` takes a `message` and a `tone` of `alert` or
`success` rather than a union of Poodl's notice kinds. Poodl supplies its words at the call
site; each is an item in [Poodl handover](../operations/poodl-handover.md).

The source of the port is Poodl's Svelte implementations, not the design project's React
references. Poodl's are the ones a contrast test has measured and an axe run has seen, and
their props contracts and tests are the settled ones. `Modal` and `Notice` therefore arrive
as Poodl's shapes rather than as the design project's Dialog and Toast primitives, for the
same reason, and the porting guide's ledger says so.

## Consequences

**Decision 0011 is superseded.** Its reasoning is contradicted, not only its inventory: a
platform-shaped component built here ahead of a second game is no longer a guess with a test
around it, because the platform is where the shape is decided. What stands from it is the
one-route site — the front door is still one page, and it does not yet mount the chrome it
now holds — and the account of why the gate was adopted before there was anything to guard.

**Decision 0010 is narrowed.** What it decided about the tokens, the typefaces, the
deviations and their provenance stands. Its reopener for the contrast test has been carried
out, and the inventory it left in the porting guide is now held here rather than owed.

**Components land ahead of a second consumer, and pay the full price here.** Every one
arrived with a test in `tests/`, a story in `stories/`, and the coverage floor met over the
enlarged glob, which is what 0011 said a speculative component would cost. That cost is
accepted because the components are not speculative: every one is rendered by Poodl today,
and the second game inherits them from the package rather than from Poodl.

**The preferences adapter takes a host object.** Poodl's `createMediaPreferences` defaults
its argument to a wrapper around `globalThis.matchMedia`, and the arm for an absent
`matchMedia` can only be reached in jsdom by stubbing a global, which invariant 3 forbids.
The hub's adapter takes the host — `createMediaPreferences(host = globalThis)` — and asks
`host.matchMedia`, so a test passes `{ matchMedia }`, `{}` or nothing and every arm is
reached by argument. Poodl's route calls it with no argument and is unaffected; Poodl's tests
that pass a function change shape when it consumes the package.

**`Modal` reads `document.activeElement` directly.** Focus management on the component's
own document is not the class of side effect the port rule names — storage, a clock, a
random source, the clipboard, the device's preferences — and jsdom implements focus, so the
tests drive the real thing rather than a fake. It is recorded here so the next reader does
not put it behind a port on principle. The focus handoff is an attachment rather than
`onMount` over a bound element, which removes the arm for an element that is never unset.

**Two platform controls draw their boundary in `--key-untried-rule`.** `Button`'s secondary
variant and `HeaderBar`'s chip. The token is named for a game's keyboard, and it is the one
hairline in the palette that clears the boundary floor in the dark themes, so the platform
borrows the name rather than declaring a second token with the same value. The contrast
test measures it as the boundary of every hairline control on the page.

**The icon map ships Vite's `?raw` specifiers.** `svelte-package` copies the SVGs to
`dist/assets/icons/` and leaves the suffix in the emitted `icons.js`, so a consumer needs a
Vite-class build to resolve them — every SvelteKit game has one. `package.json`'s `files`
narrowed from `!dist/assets` to `!dist/assets/fonts` so the icons reach the tarball, and
`just package-smoke` renders an icon in a scaffolded consumer because `just check` cannot
see this. `src/lib/assets/icons/raw.d.ts` keeps the emitted declarations typed as strings,
because the declaration emit runs over `src/lib/` alone and would otherwise type every icon
as `any`.

**The contrast test measures the palette and not a game's separations.** Poodl's test also
holds `AnUntriedKeyIsDistinguishableFromAScoredOne` against `minimum_state_separation` and
`minimum_mark_separation`; those figures are Poodl's `game.allium`'s, and
`appearance.allium` assigns a separation between a game's own states to the game. That
block was not ported, so each of the constraint windows behind `--n-65` and `--n-75` is now
held at one end here and at the other in Poodl: the bound that puts the absent letter on the
scored ground is a pair this test measures, and the bound that separates it from the untried
letter beside it is one only Poodl's gate holds. The thirteen cases the two tests share
become redundant in Poodl once its test reads the packaged stylesheet.

**The 44px target and the 320px width are story fixtures.** No specification here states
either figure, and `src/lib/config.ts` mirrors only what `appearance.allium` declares, so
the plays that measure a rendered control take both from `stories/fixtures.ts`.
[Accessibility](../explanation/accessibility.md) names the gap.

**Chromatic snapshots grow from two to thirty-seven**, with no TurboSnap.
[Decision 0009](0009-visual-review-in-chromatic.md) named the snapshot count as the trigger
for that question; the count is real now, and the question is noted rather than answered
here.

**Poodl duplicates what the package holds until it consumes it.** Every component, the
icons, the port and the derivations now exist in both repositories, and the handover page
carries the item that ends that.

## What would reopen this

A game needing a shape the hub's version cannot express without a game-specific prop. The
shape belongs to the game, and the component here should lose the feature rather than grow
it; the generalised contracts are the precedent.

Poodl's consumption stalling. If Poodl keeps its copies indefinitely, the hub holds a system
nobody renders, and 0011's argument returns with the evidence on its side.

A second game wanting the play-surface primitives, which is 0010's trigger and is unchanged
by this record: they move here when Pawjong renders the same shape, and not before.

**Overruled on 2026-09-05.** [Decision 0016](0016-the-play-surface-is-the-platforms.md)
moved them with no second game. Not *carried out*: nothing this paragraph planned happened,
and the trigger was replaced rather than met. What decides these shapes is the palette, and
the palette is already decided here and already measured here, so waiting for a second game
was waiting for evidence this repository's own stylesheet had been carrying since decision
0010.

## Related pages

- [Port a design system component](../how-to/port-a-design-system-component.md)
- [What the hub owns](../project/what-the-hub-owns.md)
- [Poodl handover](../operations/poodl-handover.md)
- [Published artefacts](../reference/published-artefacts.md)
- [Testing](../reference/testing.md)
- [Decision 0011: A skeleton, not a second application](0011-skeleton-not-a-second-application.md)
- [Decision 0010: The Biscuit Games design system](0010-biscuit-games-design-system.md)
- [Decision 0005: Side effects behind ports](0005-ports-and-fakes.md)
