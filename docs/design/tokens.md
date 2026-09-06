---
title: "Design tokens"
kind: "reference"
audience: [contributor, maintainer, agent]
canonical_for: [design_token_reference]
requires: []
---

# Design tokens

`src/app.css` is the token vocabulary of the Biscuit Games design system. It is this
repository's principal artefact: the platform components under `src/lib/components/` spend
it, every game wears it, and `tests/contrast.test.ts` measures it.
[Decision 0010](../decisions/0010-biscuit-games-design-system.md) records how it was chosen;
[Design direction](direction.md) is the reasoning behind the look it carries; this page is
the reference for what is actually in it.

This file is published, as `@steven-cutting/biscuit-games/app.css`. A game repository
imports it at an exact version rather than copying it, which is
[decision 0013](../decisions/0013-shared-material-travels-as-a-package.md). A rename here is
therefore a major version somebody can see rather than a rule silently resolving to nothing —
but only for a consumer that takes the bump, so
[Published artefacts](../reference/published-artefacts.md) states what each level of change
means before you make one.

The hub's route and the platform components spend most of the semantic vocabulary between
them, and `Tile` and `Key` spend the result and key groups since
[decision 0016](../decisions/0016-the-play-surface-is-the-platforms.md). Those two groups
were carried whole rather than pruned before anything here rendered them, and that
was deliberate: this file is the system, and a hub copy missing half
of it would leave a game's copy as the superset, which is exactly the arrangement
[decision 0001](../decisions/0001-biscuit-games-is-the-source-of-truth.md) exists to
prevent.

## How the figures are measured

`tests/contrast.test.ts` reads this file from disk, puts it in a document, drives all four
combinations of theme and high contrast through the root attributes, and recomputes every
pair the palette declares against the two floors `appearance.allium` states —
`minimum_text_contrast = 4.5` and `minimum_boundary_contrast = 3.0`, mirrored in
`src/lib/config.ts`. That is `EveryCombinationMeetsTheLegibilityFloor` run rather than
read, in every combination and not the one a change was looked at in. The test came from
Poodl by [decision 0014](../decisions/0014-the-hub-holds-the-design-system.md), and the block
that measures the state separations followed it under
[decision 0015](../decisions/0015-operation-and-play-are-specified-here.md), once
`play-surfaces.allium` stated the two figures it needs;
[Testing](../reference/testing.md) says what it holds.

Most of the figures quoted in the file's comments — 4.89 and 5.20 for the absent letter on
the scored ground, 6.93 for the warm pair, 17.04 for the focus ring — are what that test
measures, written beside the tokens so the reasoning can be read without running it. There
the test is the evidence and the comment is the provenance: when a value moves, the test
fails before the comment is wrong. That now includes 3.69 and 3.28, the distances `--n-65`
and `--n-75` hold from the unmarked glyph beside them: they are separations between two of
the platform's own marks since decision 0015, so this test measures them here rather than
leaving them as inherited claims, and the raw-palette section below says what pins them.

Two consequences follow, and neither is optional.

- **A change to the palette is shown correct or incorrect by the gate.** A repaint, a ramp
  swap, a new semantic name across four blocks — each is measured in all four combinations
  on the next run, and the `token-change` skill is the procedure.
- **A new pair is a new assertion.** Any ink on any ground the test does not already
  measure is added to it in the same change. A figure computed by hand and recorded in a
  comment is the claim the test was written to replace.

The file's comments still name `game.allium` and `tests/directManipulation.test.ts`. Those
are Poodl's, they came with the file, and each comment that names one says so; the rules
they describe are stated by no specification here, which
[Accessibility](../explanation/accessibility.md) records as a gap.

Axe runs at error level over every story as well, in the appearance each story's globals
select, and every story file that draws something pins dark, and dark high contrast where
the look inverts. Axe
measures one rendered story; the contrast test measures the palette. Neither stands in for
the other, and [Accessibility](../explanation/accessibility.md) says what each can and
cannot see.

## The shape of the file

Four palettes — light, dark, light high contrast, dark high contrast — reached through
these blocks, in source order.

| Block | Holds |
| --- | --- |
| `:root` | `color-scheme: light dark`, the whole raw palette, the light semantic values, and the type, space, form and motion scales |
| `:root[data-animations='on']` | The three durations, which are `0ms` everywhere else |
| `@media (prefers-color-scheme: dark)` → `:root:not([data-theme='light'])` | The dark palette, for a device that asks while the reader has not chosen light |
| The same media block → `:root:not([data-theme='light'])[data-high-contrast='true']` | Dark high contrast, at (0,3,0), so the light high-contrast block below cannot leak into it |
| `:root[data-theme='light']` | `color-scheme: light` only |
| `:root[data-theme='dark']` | `color-scheme: dark`, and the dark palette again |
| `:root[data-high-contrast='true']` | Light high contrast |
| `:root[data-theme='dark'][data-high-contrast='true']` | Dark high contrast |

Bare `:root` holds light because it is what paints when no attribute is set and no dark
media query matches, and a fallback has to hold some palette. It is not the designed-first
palette: dark is, and the light values answer to it.

Three properties of this arrangement are load-bearing.

- **The dark palette is stated twice on purpose.** It is reached by the device while the
  reader has chosen system, and by the dark choice itself — which is the default and the
  one `src/app.html` ships. The two texts must stay identical, and
  `tests/contrast.test.ts` reads both as text and holds them equal.
- **Order and specificity are deliberate.** `:root[data-high-contrast='true']` is (0,2,0),
  the same weight as `:root[data-theme='dark']`, so it sits after it to win at equal
  weight; the dark high-contrast pairs are (0,3,0) and win outright. Moving a block is a
  palette change even when no value moves.
- **The blocks stay correct by declaring identical token sets.** All five palette blocks
  declare the same twenty-four names, and some of those declarations repeat the bare-root
  value. That redundancy is the parity: shadowing is only total when the set is complete.
  A token added to one block and not the others leaks the wrong palette into whoever asked
  for the combination you forgot — most often high contrast on a dark device — and the
  same test holds the two high-contrast blocks to the same set of names.

`color-scheme` is set once on bare `:root` and never overridden, so `[data-theme='light']`
and `[data-theme='dark']` restate it. Without those two declarations an explicit choice
would flip the custom properties while the user agent kept painting scrollbars, form
controls and system colours the other way.

## The raw palette

Never named by a component. These are the values the semantic layer points at.

| Group | Tokens |
| --- | --- |
| Pure neutrals | `--n-0` through `--n-11`, black to white at zero chroma |
| The two off-ramp greys | `--n-65` (`#6b6b6b`) and `--n-75` (`#8e8e8e`) |
| The biscuit ramp | `--biscuit-1` through `--biscuit-7`, the one warm family |
| Result hues | `--hue-exact-dark`, `--hue-exact-dark-hc`, `--hue-exact-light`, `--hue-exact-light-hc`, and the four `--hue-present-*` counterparts |
| Light-only tile fills | `--fill-exact-light`, `--fill-present-light`, `--fill-exact-light-hc`, `--fill-present-light-hc` |

`--n-65` and `--n-75` are the two greys the even ramp does not hold, and each was pinned
by a constraint window rather than by taste. The windows hold Poodl's state separations,
which are a game's own figures, so Poodl's contrast test measures them and this one
deliberately does not — the section above says why. The result hues were chosen on the
near-black page first, and high contrast answers with a stronger palette in the same hue
families rather than a different pair of hues: telling marks apart without colour vision is
the job of shape and words, and what high contrast buys is distance from the page.

## The semantic vocabulary

What a component names. Each row lists tokens that move together between palettes.

| Group | Tokens | What they are for |
| --- | --- | --- |
| Grounds | `--background`, `--background-sunk`, `--surface`, `--surface-raised`, `--surface-hover`, `--surface-press` | The page, the sunken page, and the raised surfaces with their two interaction states |
| Rules | `--rule`, `--rule-strong`, `--rule-faint` | Decoration and separation. Never a live control's boundary: they do not pay `minimum_boundary_contrast` against the dark page |
| Inks | `--text`, `--text-2`, `--text-3`, `--text-inverse`, `--text-disabled` | Primary copy, the quiet inks for the quiet grounds, ink on an inverted ground, and the unavailable state |
| Focus | `--focus` | The `:focus-visible` outline, drawn 2px with a 2px offset |
| Results | `--result-exact`, `--result-exact-ink`, `--result-exact-fill`, the three `--result-present-*`, `--result-absent`, `--result-absent-text` | A game's marks: two inks, an ink-on-mark, a light-only fill, and absent's two tones |
| Key grounds | `--key-untried-bg`, `--key-untried-rule`, `--key-scored-bg` | A game keyboard's two grounds and the one hairline that is a control's boundary |
| Brand | `--brand-warm`, `--brand-warm-ink` | The rationed warm pair, pinned once |
| Scrim | `--scrim` | The dialog backdrop, `rgba(0, 0, 0, 0.72)` |

The result and key groups are the play surface's, and the hub renders one since
[decision 0016](../decisions/0016-the-play-surface-is-the-platforms.md): `Tile` and `Key`
spend every token in both groups, and `tests/contrast.test.ts` measures them against the
floors and against each other. That the palette was decided here while the markup lived in a
game is the inversion 0016 exists to end. `--key-untried-rule` is also the boundary of two
chrome controls — `Button`'s secondary and `HeaderBar`'s chip. `--key-untried-bg` and
`--key-scored-bg` are derived once on bare `:root` from `--background` and
`--surface-raised`, so they follow the theme through the tokens they name rather than
being restated per palette.

Two rules travel with this vocabulary and are worth restating because they are easy to
break by accident. A live control's boundary is `--key-untried-rule` or a result token,
never `--rule` or `--rule-strong`. And `--text-2` and `--text-3` are reading inks for the
quiet grounds, not a general dimmer.

`--text-disabled` and a disabled control's `--rule` border are the two inks the design
system states rather than derives. They are exempt from every figure by
`Appearance.@guarantee AnUnavailableControlIsExempt`, so the contrast test measures neither
— they drift silently, and
[decision 0010](../decisions/0010-biscuit-games-design-system.md) records the drift that
already happened once.

## The legacy aliases

`--background`, `--text` and `--focus` kept their pre-design-system names when the
vocabulary landed. That was not tidiness deferred: the pinned element rules at the foot of
`src/app.css` name them — `body`, `:focus-visible`, and the pressed ring's
`inset 0 0 0 2px var(--text), inset 0 0 0 4px var(--background)` — and in Poodl that ring is
read by `tests/directManipulation.test.ts`, which is why the port needed no edit there.
Renaming any of the three is a cross-repository change, not a token change.

## Type

| Token | Value or purpose |
| --- | --- |
| `--font-ui` | Instrument Sans, then the system stack |
| `--font-display` | Bricolage Grotesque, falling back to `--font-ui` |
| `--font-board` | `--font-display`, named separately so a board can move alone |
| `--fs-micro`, `--fs-mono-label`, `--fs-small` | 0.6875rem, 0.75rem, 0.8125rem |
| `--fs-body`, `--fs-body-lg` | 0.9375rem, 1.0625rem |
| `--fs-title` | 1.25rem |
| `--fs-display-3`, `--fs-display-2`, `--fs-display-1` | 1.625rem, 2.125rem, 2.875rem |
| `--fs-board`, `--fs-stat` | 1.5rem, 1.75rem |
| `--track-display`, `--track-title`, `--track-label`, `--track-board` | -0.02em, -0.01em, 0.09em, 0.01em |
| `--figures-tabular` | `tabular-nums`, for the figures the display face carries |

`--fs-body` is copy only. Below 16px iOS Safari magnifies the page when a text control
takes focus, so inputs and textareas take `font: inherit` off the 16px body instead — a
rule the file carries for a guarantee that lives in Poodl's specifications rather than in
this repository's. `--fs-board` is sized to the 48px cell decision 0010 records rather than
the design reference's 56px.

Nothing resolves a token name, either. A declaration naming a token no block defines is
invalid at computed-value time and silently falls back to the inherited value, so a
misspelt or invented token name is a size that never arrives and never complains. The front
door did exactly that once, naming `--fs-1` for its section heading, and the heading sat at
the inherited 16px until someone read the file. No gate says so, in `src/` or in a game's
copy; write the name against the table above rather than from memory.

## Space, form and motion

`--s-1` through `--s-13` are the spacing scale, 2px to 88px. Beside it sit the fixed
figures a layout needs: `--gap-tile` and `--gap-key` at 5px, `--gap-row` at 6px,
`--shell-pad` at 16px, and `--shell-max` at **34rem** — not the design system's 480px,
because a 480px shell caps a letter key at about 40px on a screen with room for 44.

Form is four radii and two rule weights: `--radius-tile` and `--radius-key` at 3px,
`--radius-card` at 4px, `--radius-max` at 6px, `--rule-w` at 1px and `--rule-w-strong` at
1.5px, plus `--lift-dialog`, the hard offset shadow a dialog sits on.

Motion is `--ease` and three durations. `--dur-1`, `--dur-2` and `--dur-3` are `0ms` on
bare `:root` and become 120ms, 150ms and 180ms only under `:root[data-animations='on']`,
which is how a component may write its transition unconditionally and leave the appearance
surface as the single gate. Keyframe animations cannot use that trick — a 0ms animation
still fires its events — so they gate on the attribute themselves.

## The fonts

Two families, three committed files, all latin-subset variable woff2 under
`src/lib/assets/fonts/`:

| File | Family | Range |
| --- | --- | --- |
| `bricolage-grotesque-latin-variable.woff2` | Bricolage Grotesque | weight 200–800, stretch 75–100% |
| `instrument-sans-latin-variable.woff2` | Instrument Sans | weight 400–700, stretch 75–100% |
| `instrument-sans-latin-variable-italic.woff2` | Instrument Sans, italic | weight 400–700, stretch 75–100% |

They were extracted from the pinned `@fontsource-variable` 5.3.0 packages, and the
`src/app.css` header carries the package name, version, tarball URL and sha256 for each.
That header is the only lockfile these files have: fonts and icons are the two asset
classes `package-lock.json` does not govern, so the checksum in the comment is what a
future re-extraction is checked against. The icons' provenance is simpler — Lucide,
restroked to 1.5, with the ISC text beside them in `src/lib/assets/icons/` — and
`tests/icons.test.ts` holds the restroke. Both faces are OFL 1.1, and the licence texts sit beside
them as `OFL-bricolage-grotesque.txt` and `OFL-instrument-sans.txt`. Deleting either text
is a licensing defect, not a cleanup.

Each face declares `font-display: swap` and the same `unicode-range` the fontsource
latin-standard build ships. The `src` URLs are relative, so they resolve through Vite's
graph and the files are hashed into the build and follow whatever base path the build was
given without knowing it. This repository sets no base path and publishes no site
([decision 0012](../decisions/0012-the-domain-root-stays-with-poodl.md)). Poodl's landing
page at the domain root wears this same stylesheet and serves these same font files — the
duplication 0012 records — so moving one of these paths moves something over there too.

## Where the warm pair is spent

Once, in `::selection`, which paints `--brand-warm-ink` on `--brand-warm`. That is the
whole ration.

The pair is pinned on bare `:root` rather than answered per theme, so one pair serves all
four palettes; the measured figure is 6.93 in every one of them. The rule matters as much
as the value: a token that is measured and never rendered is a figure that cannot regress
where anyone would see it, which is why the design system's own colour is spent somewhere
a reader actually meets it. `tests/contrast.test.ts` asserts that this rule is what
spends it.

The lockup itself stays neutral. `Wordmark.svelte` draws in `--text`, and what makes the
wordmark the wordmark is the name, the display face and the mark's one soft corner — see
[Design direction](direction.md).

## Changing a token

Use the `token-change` skill, which is the procedure rather than a summary of it. The
shape of the work:

1. Change the value in the semantic layer where you can. A raw palette entry is a wider
   change than an alias and needs a stated reason.
2. Redeclare it in every palette block that declares its neighbours. Identical sets, all
   five blocks, or the parity above stops holding.
3. Run `just frontend-coverage`. `tests/contrast.test.ts` measures the new value against
   `appearance.allium`'s floors in all four combinations, and a pair it does not yet hold
   is added to it in the same change. Update the figure in the comment beside the token,
   which is provenance rather than evidence.
4. Look at it in the workshop. The toolbar in `.storybook/preview.ts` drives theme, high
   contrast, animations and simulated reduced motion onto the document root, which is
   where every palette is keyed — see
   [Work in the component workshop](../how-to/work-in-the-component-workshop.md).
   `stories/Foundations.stories.svelte` is the specimen: the palette on its grounds, pinned
   dark and dark high-contrast, the type ramp, the spacing scale and the radii.
5. Run the `consumer-impact` skill. A renamed or removed token leaves a game's stylesheet
   resolving to nothing, and no gate here can say so.
6. Run `just check`, and request `/chromatic` on the pull request. A token change is a
   visual change, and that review is the design review.

Porting a component that needs a token it has no name for is the same procedure seen from
the other end; [Port a design system component](../how-to/port-a-design-system-component.md)
holds that half.

## Related pages

- [Design direction](direction.md)
- [Accessibility](../explanation/accessibility.md)
- [Port a design system component](../how-to/port-a-design-system-component.md)
- [Testing](../reference/testing.md)
- [Decision 0010: The Biscuit Games design system](../decisions/0010-biscuit-games-design-system.md)
