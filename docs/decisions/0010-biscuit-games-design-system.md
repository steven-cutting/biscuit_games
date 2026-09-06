---
title: "Decision 0010: The Biscuit Games design system"
kind: "decision"
audience: [contributor, maintainer, agent]
canonical_for: [decision_design_system]
requires: []
---

# Decision 0010: The Biscuit Games design system

*Ported from Poodl's decision 0010 at `c26cc4642afa6b1349db70a0f497203db3986599`, and restated for the platform. Poodl's own record stands where it is.*

> **Narrowed on 2026-09-04 by
> [Decision 0014](0014-the-hub-holds-the-design-system.md).** The icons, the platform
> primitives, the contrast test and the preferences port are here now, ported from Poodl.
> What this record decided about the tokens, the typefaces, the deviations and their
> provenance stands unchanged, and the ledger of deviations below is still the ledger.
>
> **Narrowed on 2026-09-05 by
> [Decision 0016](0016-the-play-surface-is-the-platforms.md) and
> [Decision 0015](0015-operation-and-play-are-specified-here.md).** The play surface this
> record excludes is partly here now: `Tile`, `Key`, `Keyboard`, `PhysicalKeyboard` and
> `Explainer` came across generalised, while a board, a rack and a grid are not here,
> because an arrangement encodes a rule. The separations this record
> assigns to a game are the platform's where the marks are the platform's:
> `play-surfaces.allium` states them, so `tests/contrast.test.ts` now holds both ends of the
> `--n-65` and `--n-75` windows rather than one end here and one in Poodl. The second game
> named below as the trigger is **overruled rather than met** — none exists, and 0016 says
> why it was the wrong test. The tokens, the typefaces and the ledger of deviations stand
> unchanged.

## Context

[Design direction](../design/direction.md) decided how Biscuit Games looks — dark is home,
thin rules rather than heavy fills, one rationed warm family, a face with fingerprints.
A complete design system was generated from that page in a Claude Design project ("Copy of
Biscuit Games Design"), as React reference components over a token vocabulary, with
restroked Lucide icons and the two typefaces the direction page had shortlisted. The
project's own readme flagged its colour values as unverified proposals.

It was ported into Poodl first, because Poodl was the only place there was to render it.
The token file, the fonts, the icons and the primitives all landed inside a game, and the
corrections verification forced were computed there, against that game's board and its
on-screen keyboard. That left the platform's design system owned by one of its consumers,
which is the arrangement
[decision 0001](0001-biscuit-games-is-the-source-of-truth.md) exists to end.

Adopting the design project wholesale was not on offer then and is not on offer now. The
reference components are React; this repository is Svelte 5 with its own accessibility
contracts; and the mechanics a palette looks as though it carries are pinned by
specification rather than by colour. `docs/specs/appearance.allium` states the legibility
floors as ratios and names no colour at all, and the states a game marks belong to that
game's own module — which is why an indication scheme moves in a specification before it
moves in a stylesheet.

## Decision

The design system belongs to this repository, and `src/app.css` is where it lives. It is
carried whole rather than pruned to what the hub renders, and it is spent by components
one at a time, as a consumer appears — the rest recorded in
[Port a design system component](../how-to/port-a-design-system-component.md).

- **Tokens.** `src/app.css` holds the raw palette (pure neutrals, the biscuit ramp, the
  result hues chosen dark-first), the semantic vocabulary (`--surface*`, `--rule*`,
  `--text*`, `--result-*`, the key grounds), and the type, space, form and motion scales.
  The result and key groups are a game surface's and nothing here draws a mark or a key —
  though `--key-untried-rule` is the boundary of two platform controls — and they stay
  because a hub copy missing half the system would make a game's copy the superset.
  [Design tokens](../design/tokens.md) is the reference page for the file. The legacy
  names the pinned element rules depend on — `--background`, `--text`, `--focus` — survive,
  which is why the pressed ring and the tests reading it in Poodl needed no edit. The warm
  family is spent in exactly one place, and it is the design system's own: `::selection`
  paints `--brand-warm-ink` on `--brand-warm`. A token measured and never rendered is a
  figure that cannot regress where anyone would see it, which is why the pair is spent
  somewhere a reader meets it — and `tests/contrast.test.ts` asserts that rule exists,
  here as in Poodl.
- **Fonts.** Bricolage Grotesque for display and the board, Instrument Sans for the
  interface: committed latin-subset variable woff2 files under `src/lib/assets/fonts/`,
  extracted from the pinned fontsource 5.3.0 packages (provenance, URLs and checksums in
  the `app.css` header), with the OFL texts beside them. Both faces carry the `tnum`
  feature `--figures-tabular` names — verified from the files themselves when they were
  committed in Poodl, not from the foundry page, and the same files by checksum.
- **Icons.** The restroked Lucide set, under the ISC licence, is the system's. When this
  was decided its implementation was Poodl's — there was no `src/lib/assets/icons/` here,
  no `icons.ts` and no `Icon` component — and
  [decision 0014](0014-the-hub-holds-the-design-system.md) brought all three across: the
  directory, the ISC text and the arrangement that inlines an SVG through a `?raw` import.
  The porting guide holds the recipe for adding one.
- **Primitives.** `Wordmark` was the only component ported with this decision; the
  platform primitives followed under decision 0014, from Poodl's implementations. The brand
  mark is folded into `Wordmark` rather than being a component of its own, because nothing
  else consumes one. The ledger in the porting guide names every primitive the system
  draws, which of them are here, and what blocks the rest.
- **Mascot and favicon deferred.** No `MascotSlot`, and no placeholder where one would go:
  the direction page rations Biscuit hard, and a reserved hollow slot is a second break.
  `app.html` keeps its empty data-URI icon until the reduced icon-mark exists, since the
  typographic placeholder in `Wordmark` is a header lockup and not an icon. The porting
  guide records where she eventually mounts.

What is not ported is the play surface, and that is a boundary rather than an oversight: a
board, a tile, a key and a result mark mean something only inside the game that renders
them, so they stay there, and the porting guide's ledger says which rows those are.
Everything else came across under
[decision 0014](0014-the-hub-holds-the-design-system.md), `tests/contrast.test.ts` with it,
so every figure in this record, in the ledgers below and in the comments of `src/app.css`
is recomputed here on every run — every figure but the separations between a game's own
states, which `appearance.allium` assigns to the game and only Poodl's gate holds.

## Deviations from the design system as shipped

Recorded because the design project stays readable and someone will diff it. The readme
called its hues proposals; these are the corrections verification forced. Every ratio in
this section and the next was measured in Poodl at
`c26cc4642afa6b1349db70a0f497203db3986599`, against the floors this repository now states
as `appearance.allium`'s `minimum_text_contrast` (4.5) and `minimum_boundary_contrast`
(3.0). Read each one as provenance for a figure `tests/contrast.test.ts` now measures here,
minus the separations between a game's own states, which the game measures for itself.

These are the platform-level judgements — they hold for any surface wearing the system.

- **The warm pair is one pinned pair, not four.** The brand ink is biscuit-1, not
  biscuit-2, which measures 4.25 on biscuit-6 against the 4.5 text floor; and
  `--brand-warm`/`--brand-warm-ink` are declared once on bare `:root` rather than answered
  per theme the way the design system answers them. Two of its four pairs measure under
  that floor — biscuit-2 on biscuit-6 at 4.25 in dark, biscuit-7 on biscuit-3 at 4.40 in
  light — where the pinned pair measures 6.93 in every palette. The lockup itself stays
  neutral, as the design system's own `Mark` does at its default tone: `::selection` is the
  one place the pair is spent, what makes the wordmark the wordmark is the name and the
  face it is set in rather than a colour — see
  [the design direction](../design/direction.md) — and the mark's one break is the fourth
  corner.
- **An unavailable control is exempt from the legibility floor, and the specification says
  so.** The design system's `Button` paints a disabled control in `--text-disabled` on
  nothing, bounded by `--rule`, and Poodl's port keeps that shape. What it had not kept was the
  ink: `--text-disabled` had drifted lighter than the system on three of the four palettes
  — neutral-9 where `tokens/theme-light.css` says neutral-8, neutral-9 again in light high
  contrast where it says neutral-7, neutral-6 in dark high contrast where
  `tokens/theme-dark.css` says neutral-7 — and no bullet here claimed it, so it was drift
  rather than a decision. The system's own values are restored, which lifted the ink from
  1.36–2.48 to 2.31–4.62 against the page and the raised surface. That still does not clear
  4.5 in either standard palette, and the `--rule` boundary measures 1.19–4.62 against 3.0.
  Poodl halves those figures again by dimming its finished keyboard at `opacity: 0.5` —
  its own doing, since the system's `Key` has no disabled state at all — and that is the
  case that forced the question. So the remaining choice was to repaint past what the
  design asks for or to say what the design already meant, and
  `Appearance.@guarantee AnUnavailableControlIsExempt` now sits beside
  `EveryCombinationMeetsTheLegibilityFloor` in `appearance.allium`: WCAG 2.2 exempts an
  inactive component from 1.4.3 and 1.4.11 for the reason that applies here too — dimming
  is *how* unavailability reads, and a dim held to a live control's bar would not read as
  one. The exemption is only from the figures. A dimmed control still reports its state to
  the accessibility tree and still keeps every non-colour indication its live form carried.
  See [Accessibility](../explanation/accessibility.md) for the model and for the half of it
  that is not a ratio. `Button` and `IconButton` render a disabled control here now, and
  the two inks are the ones the contrast test deliberately never measures, so they are
  still the likeliest tokens to drift unnoticed.
- **A control with no drawn edge owes no edge contrast.** `ghost` is `transparent` on
  transparent in the design system too, and the boundary clause used to read as though it
  owed 3.0 anyway. `EveryCombinationMeetsTheLegibilityFloor` now says a control is
  identifiable by the boundary it draws or, where it draws none, by its own words — which
  `ghost` pays in `--text-2`, already measured on both grounds. No pixel moved; the clause
  stopped being ambiguous about a variant the system ships and this repository does not yet
  render.
- **No destructive button variant.** The system offers no red, and the weight goes on a
  two-step confirmation and a sentence naming what will go, rather than on a colour a
  colour-blind reader would miss. Poodl's "Clear everything" is the case that settled it,
  and it is a secondary button there.
- **The shell is 34rem, not 480px.** A bottom keyboard row is ten flex shares and eight
  gaps plus the gutters; a 480px shell caps a letter key at about 40px on a screen with
  room for 44, and a control the reader can hit is owed in both directions down to the
  narrowest supported width. The arithmetic is a ten-across row's, but `--shell-max` is the
  platform's token and every surface wearing the system inherits the width.

## Figures measured in Poodl, against Poodl's board

These corrections were computed by Poodl's `tests/contrast.test.ts` against a board, an
on-screen keyboard and result marks this repository does not have, and against two config
values that live in Poodl's `game.allium` rather than here:
`minimum_state_separation` and `minimum_mark_separation`. They moved tokens that are in
`src/app.css`, so they are recorded here as the system's history — how the palette came to
hold the values it holds — and not as this repository's own measurements. Nothing here
renders any of these surfaces. Several of the numbers are nonetheless checked here, because
the pair behind them is the palette's rather than the board's: a letter on the scored
ground, a control's boundary against the page. What is checked nowhere here is a separation
between two of a game's own states, which is where `minimum_state_separation` and
`minimum_mark_separation` live and why they stay Poodl's.

- **The dark absent letter is `#8e8e8e`, not neutral-7.** `#767676` measures 3.75 on the
  scored ground against a 4.5 floor. The replacement sits in the only window that clears
  4.5 there while holding `minimum_state_separation` under the untried letter — 3.28
  against 3.0, one of the tightest pairs in the palette.
- **The light absent borders are dark — neutral-5, and neutral-2 in high contrast.** The
  design system drew them in light greys that measure under 1.5 against the white page,
  and an absent key is a control whose boundary owes 3.0. No light value satisfies both
  that and `minimum_mark_separation` against exact, so the border crosses to the dark side
  of exact and the separation is a distance with no direction — which is how the amended
  guarantee words it.
- **Scored keys sit on the neutral raised ground in every theme.** The design system gave
  light-theme exact and present keys tinted fills; the tint moves the ink's measured
  ground per state and buys nothing the border, letter and bar do not already carry, so
  the tiles keep the light-only fills and the keys do not.
- **The untried key's border is neutral-7, not `--rule`.** Same reason as the absent
  border: a control's boundary, not a decoration, and the design system's `--rule` is 1.30
  against the dark page. It is what `--key-untried-rule` names.
- **Typed tiles are drawn in `--rule`, not `--rule-strong`.** The design system firms the
  border the moment a letter lands. Poodl's grid stays on the faintest rule throughout —
  1.30 against the dark page and 1.48 against the light one — and a typed cell separates by
  weight alone, `--rule-w-strong` against `--rule-w`, so the board is lighter than the
  system draws it: the grid recedes and the letters carry it. No guarantee reads the step,
  because a typed tile carries its letter at 19.68 and an accessible name of its own, and
  no gate can settle whether it reads, because tiles sit outside the measured floors. The
  way back is `--rule-strong`, which costs no test churn for the same reason.
- **Tiles are 48px, not the reference 56px.** Five 56px tiles and their four gaps come to
  300px, and the narrowest supported viewport leaves the shell a 288px content box — the
  reference was drawn for a wider column than the specification permits. 48px keeps the
  board inside every supported screen, the letter scales with the cell, and `--fs-board`
  here is still sized to that cell.

## Consequences

**The repository that owns the system renders it in the workshop, and on its own page
almost not at all.** The platform primitives and the token sheet spend most of the semantic
vocabulary; the result hues, the key grounds and the light-only fills are carried and drawn
only on the token sheet, because a mark and a key are a game's. The design review this
decision would most want is real now: [Chromatic](0009-visual-review-in-chromatic.md) diffs
thirty-seven stories, the story files pin dark and dark high contrast where the look
inverts, and the contrast test measures what axe cannot attribute. That is
[decision 0014](0014-the-hub-holds-the-design-system.md), stated in the place a designer
will look for it.

**A gate here recomputes every ratio, and that is the single most important fact on this
page.** `tests/contrast.test.ts` stayed in Poodl when this was decided and came across
under [decision 0014](0014-the-hub-holds-the-design-system.md). Every figure in both
ledgers and every figure in the comments of `src/app.css` was measured in Poodl at
`c26cc4642afa6b1349db70a0f497203db3986599` and is measured here on every run, minus the
separations between a game's own states, which `appearance.allium` leaves to the game.
`src/app.css` is no longer frozen — a repaint, a ramp swap, a new semantic name across four
palette blocks is shown correct or incorrect by the gate — and a change that introduces a
pair adds it to the test rather than computing it by hand;
[Design tokens](../design/tokens.md) states the procedure.

The committed fonts are about 240KB of repository weight and, with the icons that followed,
one of the two asset classes the lockfiles do not govern; the provenance comment in
`app.css` (package, version, tarball sha256) is what stands in for a lockfile there. That
comment is now a two-repository fact: Poodl holds the same three files, and a re-extraction
has to agree with both.

**The system reaches surfaces no gate here renders.** The hub site is published nowhere —
[decision 0012](0012-the-domain-root-stays-with-poodl.md) leaves the domain root with Poodl
— and the landing page at that root wears this same stylesheet and serves these same font
files. So a token renamed here can leave a rule over there resolving to nothing, with no gate
on either side saying so, and moving a font path moves something in Poodl's staging step too.
The stylesheet now also ships as a package
([decision 0013](0013-shared-material-travels-as-a-package.md)), which makes a rename a major
version a consumer can see — but only for the copies a release retires, and Poodl's copies are
retired by a change in Poodl rather than by one here. Until then renaming a token is still a
cross-repository change, and the `consumer-impact` skill is still the only thing that will
look.

**The claim that games are the same instrument with a different attachment is still a
claim.** The play primitives that would prove it — board, tile, key, keyboard — live in
Poodl, carrying that game's behaviour contracts, and moving them here before a second game
exists would be a guess with a test around it.

## What would reopen this

`tests/contrast.test.ts` being ported, which is the cheapest of these and turns every
figure above from an inherited claim into a measurement, unfreezing `src/app.css` with it.

**Carried out on 2026-09-04.** [Decision 0014](0014-the-hub-holds-the-design-system.md)
ported the test, minus the block that measured Poodl's own state separations. Every figure
above is a measurement, and `src/app.css` is no longer frozen.

The mascot arriving, which brings `MascotSlot` and the favicon in from the porting guide.

A second game, which would pull the play-surface primitives out of Poodl into shared
components here and test the "same instrument, different attachment" claim for real.

Or the design project moving ahead of this repository — the sync is manual, and the
porting guide is the procedure.

## Related pages

- [Design direction](../design/direction.md)
- [Design tokens](../design/tokens.md)
- [Port a design system component](../how-to/port-a-design-system-component.md)
- [Accessibility](../explanation/accessibility.md)
- [Decision 0002: Shared material travels by citation](0002-shared-material-travels-by-citation.md)
- [Decision 0009: Visual review in Chromatic](0009-visual-review-in-chromatic.md)
- [Decision 0011: A skeleton, not a second application](0011-skeleton-not-a-second-application.md)
- [Decision 0012: The domain root stays with Poodl](0012-the-domain-root-stays-with-poodl.md)
