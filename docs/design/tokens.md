---
title: "Design tokens"
kind: "reference"
audience: [contributor, maintainer, agent]
canonical_for: [design_token_reference]
requires: []
---

# Design tokens

`src/app.css` is the token vocabulary of the Biscuit Games design system. It is this
repository's principal artefact — the hub is a skeleton around it, and this file is the
thing worth having. [Decision 0010](../decisions/0010-biscuit-games-design-system.md)
records how it was chosen; [Design direction](direction.md) is the reasoning behind the
look it carries; this page is the reference for what is actually in it.

Nothing here is published as a package and nothing imports it. A game repository copies
the file and cites this one, which is what
[decision 0002](../decisions/0002-shared-material-travels-by-citation.md) means by
travelling by citation. That makes a rename here a change in every repository that took a
copy, and no gate anywhere can tell you so.

The hub itself spends about twenty of these tokens, between `src/routes/+page.svelte`,
`src/lib/components/Wordmark.svelte` and the element rules at the foot of `src/app.css`.
The rest are carried whole rather than pruned. That is deliberate: this file is the
system, and a hub copy missing half of it would leave a game's copy as the superset, which
is exactly the arrangement [decision 0001](../decisions/0001-biscuit-games-is-the-source-of-truth.md)
exists to prevent.

## Nothing here recomputes a ratio

`tests/contrast.test.ts` has not been ported. No test, recipe or hook in this repository
reads a colour out of `src/app.css` and computes a contrast ratio, and
[Quality gates](../reference/quality-gates.md) lists none that does.

Every figure quoted in the file's comments — 3.69, 4.89, 5.20, 3.28, 6.93, 17.04 — is
**inherited from Poodl at commit `c26cc4642afa6b1349db70a0f497203db3986599`**, where it was
measured. Here it is a comment to be trusted, which is the precise condition that test
exists to end. Treat every one of them as provenance, not as evidence.

Two consequences follow, and neither is optional.

- **`src/app.css` is frozen for anything larger than a single considered change.** A
  repaint, a ramp swap, a new semantic name across four blocks — none of those can be
  shown correct here. They wait for the test. Porting `tests/contrast.test.ts` is the
  remedy, and it is a smaller job than any of the changes it unblocks.
- **A single change carries its own arithmetic.** Compute the ratio by hand against
  `appearance.allium`'s floors, record it in a comment beside the token, and say in the
  pull request that it was computed rather than measured.

The file's comments also still name `game.allium`, `sharing.allium`,
`tests/directManipulation.test.ts`, `src/lib/config.ts` and `Keyboard.svelte`. None of
those exists here. They are the game's, they came with the file, and where a comment says
a gate "recomputes" something it is describing Poodl's gate and not one of ours.

What automation there is amounts to axe running at error level over the workshop's
stories. Today that is one component in two states, and the high-contrast global is never
switched on in the run, so neither high-contrast palette is ever rendered, let alone
checked. `docs/specs/appearance.allium` states the floors —
`minimum_text_contrast = 4.5` and `minimum_boundary_contrast = 3.0` — and
`EveryCombinationMeetsTheLegibilityFloor` holds them in all four combinations of theme and
high contrast. In this repository that guarantee is met by reading, not by running.

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
  one `src/app.html` ships. The two texts must stay identical, and nothing checks that
  they do.
- **Order and specificity are deliberate.** `:root[data-high-contrast='true']` is (0,2,0),
  the same weight as `:root[data-theme='dark']`, so it sits after it to win at equal
  weight; the dark high-contrast pairs are (0,3,0) and win outright. Moving a block is a
  palette change even when no value moves.
- **The blocks stay correct by declaring identical token sets.** All five palette blocks
  declare the same twenty-four names, and some of those declarations repeat the bare-root
  value. That redundancy is the parity: shadowing is only total when the set is complete.
  A token added to one block and not the others leaks the wrong palette into whoever asked
  for the combination you forgot — most often high contrast on a dark device.

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
by a constraint window rather than by taste — inherited windows, in the terms of the
section above. The result hues were chosen on the near-black page first, and high contrast
answers with a stronger palette in the same hue families rather than a different pair of
hues: telling marks apart without colour vision is the job of shape and words, and what
high contrast buys is distance from the page.

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

The result and key groups are the game surface's. Nothing in the hub renders one today,
and that is not a reason to delete them — see the opening section. `--key-untried-bg` and
`--key-scored-bg` are derived once on bare `:root` from `--background` and
`--surface-raised`, so they follow the theme through the tokens they name rather than
being restated per palette.

Two rules travel with this vocabulary and are worth restating because they are easy to
break by accident. A live control's boundary is `--key-untried-rule` or a result token,
never `--rule` or `--rule-strong`. And `--text-2` and `--text-3` are reading inks for the
quiet grounds, not a general dimmer.

`--text-disabled` and a disabled control's `--rule` border are the two inks the design
system states rather than derives. They are exempt from every figure by
`Appearance.@guarantee AnUnavailableControlIsExempt`, which means nothing would have
recomputed them even with the contrast test in place — so they drift silently, and
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
That header is the only lockfile these files have: fonts are the one asset class
`package-lock.json` does not govern, so the checksum in the comment is what a future
re-extraction is checked against. Both faces are OFL 1.1, and the licence texts sit beside
them as `OFL-bricolage-grotesque.txt` and `OFL-instrument-sans.txt`. Deleting either text
is a licensing defect, not a cleanup.

Each face declares `font-display: swap` and the same `unicode-range` the fontsource
latin-standard build ships. The `src` URLs are relative, so they resolve through Vite's
graph and the files are hashed into the build and follow whatever base path the build was
given without knowing it. This repository sets no base path and publishes nothing
([decision 0012](../decisions/0012-the-domain-root-stays-with-poodl.md)). Poodl's landing
page at the domain root wears this same stylesheet and serves these same font files — the
duplication 0012 records — so moving one of these paths moves something over there too.

## Where the warm pair is spent

Once, in `::selection`, which paints `--brand-warm-ink` on `--brand-warm`. That is the
whole ration.

The pair is pinned on bare `:root` rather than answered per theme, so one pair serves all
four palettes; the inherited figure is 6.93 in every one of them. The rule matters as much
as the value: a token that is measured and never rendered is a figure that cannot regress
where anyone would see it, which is why the design system's own colour is spent somewhere
a reader actually meets it. In Poodl the contrast test asserts that this rule is what
spends it. Here nothing does.

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
3. Do the arithmetic by hand against `appearance.allium`'s floors, in all four
   combinations, and record it beside the token. Nothing here will do it for you.
4. Look at it in the workshop. The toolbar in `.storybook/preview.ts` drives theme, high
   contrast, animations and simulated reduced motion onto the document root, which is
   where every palette is keyed — see
   [Work in the component workshop](../how-to/work-in-the-component-workshop.md). There is
   no token specimen story here yet; `stories/Wordmark.stories.svelte` is the only story in
   the repository.
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
