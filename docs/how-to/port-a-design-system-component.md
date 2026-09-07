---
title: "Port a design system component"
kind: "how-to"
audience: [contributor, maintainer, agent]
canonical_for: [design_system_porting]
requires: []
---

# Port a design system component

The Biscuit Games design system was designed in a Claude Design project ("Copy of Biscuit
Games Design"), as React reference components over the token vocabulary `src/app.css`
carries, and first built in Poodl as Svelte 5 components over that same stylesheet.
[Decision 0010](../decisions/0010-biscuit-games-design-system.md) brought the tokens and the
two typefaces across;
[decision 0014](../decisions/0014-the-hub-holds-the-design-system.md) brought the platform
primitives — the icon set, `Button`, `IconButton`, `HeaderBar`, `Modal`, `Notice` and
`Announcer` — with their tests, their stories, the preferences port and the contrast test
that measures the palette they spend;
[decision 0016](../decisions/0016-the-play-surface-is-the-platforms.md) brought the play
surface; and
[decision 0017](../decisions/0017-the-rest-of-the-design-system-is-ported.md) brought the
rest — the grouping chrome, the game switcher, the fields and the brand mark — overruling
the triggers five of those rows were waiting behind. This page is the procedure, one
component at a time, and the ledger of what is where.

The direction of travel is what makes the procedure worth writing down. A component is
settled here and a game takes it from the package afterwards, which is
[decision 0013](../decisions/0013-shared-material-travels-as-a-package.md). So a port is never
a local convenience. It is the platform settling a shape on behalf of every game that will
render one, which is why the ledger below is a boundary as much as a backlog.

## What is ported, and what stays a game's

A platform-shaped component is built or ported here first, whether or not a second consumer
exists yet. This repository is where the platform's shapes are decided, and a system whose
only implementation lives in a game is the arrangement
[decision 0001](../decisions/0001-biscuit-games-is-the-source-of-truth.md) exists to end.
That is decision 0014, and it replaces the earlier rule that a component waited for its
second consumer.

What has not changed is the test. [What the hub owns](../project/what-the-hub-owns.md) asks
whether a second game would need the shape unchanged, and the answer has moved for four rows
below, because the answer depends on what is in the shape. A header bar, a button, a dialog
shell: yes, and they are here. A cell and a key: yes as well, and
[decision 0016](../decisions/0016-the-play-surface-is-the-platforms.md) is why — both are
drawn entirely in tokens this repository declares and measures, so what was left in the game
was the markup rather than the shape. What a game keeps is the arrangement and the meaning: a
board is six rows of five because a rule says six and five, and "in the word, wrong place" is
a sentence about one game's rules. The ledger applies the test component by component, and a
row that moves from one side to the other is a decision record, not an edit — four did, and
0016 is the record.

The cost of holding a component here is real and is paid in this repository. Nothing lands
under `src/lib/` without a test in `tests/` and a story in `stories/`, the coverage floor
is 90% over `src/lib/**`, and every ratio the component's tokens make is measured by
`tests/contrast.test.ts` in all four combinations. A component with a game-specific prop is
the thing to refuse: generalise the contract, as `HeaderBar` and `Notice` were generalised
on arrival, or leave the shape in the game.

## The recipe

1. **Read the source.** Where Poodl already carries a Svelte version of the shape, that is
   the source: it is the one a contrast test measured and an axe run has seen, and its props
   contract and its test are the settled ones. Where Poodl does not, read the reference
   component in the design project (`components/**` there). Either way, read the spec
   surface that will consume it — today that is `Appearance` in
   `docs/specs/appearance.allium`, `Operation`, `Dialog` and `Fields` in `operation.allium`,
   and the three surfaces in `play-surfaces.allium` — and where source
   and specification disagree, the specification wins; that is AGENTS.md invariant 1, and
   the deviations decision 0010 records are what the rule cost the first time anyone applied
   it.
2. **Map tokens, never hex.** Every colour in the port names a token from `src/app.css`.
   Two rules with teeth: a live control's border is `--key-untried-rule`, never `--rule` or
   `--rule-strong`, because a control's boundary owes `minimum_boundary_contrast` against
   the page and the decorative rules do not pay it in dark — `Button`'s secondary and
   `HeaderBar`'s chip are the two platform controls that draw in it; and
   `--text-2`/`--text-3` are reading inks for the quiet grounds only. A new measured pair —
   any ink on any new ground — is added to `tests/contrast.test.ts` in the same change,
   where it is measured in all four combinations rather than quoted. The one exception is
   the unavailable state: `Appearance.@guarantee AnUnavailableControlIsExempt` holds a
   control the reader cannot operate to none of the figures, so `--text-disabled` and a
   disabled border are ported as the design system draws them and are measured nowhere.
   What a ported disabled state does owe is the other half of that guarantee — the
   unavailability in the accessibility tree, and every non-colour indication the live form
   carried kept.
3. **Write the props contract in TypeScript**: `$props` with an explicit type,
   callbacks-as-props, no event dispatcher, no `...rest` spreading. Strip the source's
   product vocabulary out of the contract — a game's mode names, its sentences, its notice
   kinds — and take strings and callbacks instead; the game supplies its words at the call
   site. Where a component reaches into what a consumer passes, say so in the contract:
   `HeaderBar` collapses a `brand` snippet's words below 26rem only when they sit in an
   element carrying the class `words`, and that class is the whole of what a snippet has to
   meet. Port the variants the platform's own components consume, list the rest under
   "Unported variants" below, and be willing to port none of them. A prop nothing here
   passes is a branch with nothing to cover it.
4. **Keep geometry literal where it is not a token by meaning.** A control height that
   happens to equal a spacing step stays a literal, with a comment saying which token it
   coincides with and why it is not named — `Wordmark`'s mark, `Button`'s 48px and
   `Notice`'s 40px are the worked examples. The 44px touch target, the 320px narrowest width
   and the 16px floor under a field's own text are `operation.allium`'s
   `config.minimum_touch_target`, `config.narrowest_supported_width` and
   `config.minimum_field_text_size`, mirrored in `src/lib/config.ts` and measured by
   `tests/operation.test.ts` and by the plays. The last of the three is measured only by a
   play: jsdom's default input font is already 16px, so an assertion in `tests/` would pass
   whether or not the rule existed.
5. **Land component, test and story in one change.** The test queries by role and name in
   `tests/`; the story covers the states the surface names, cites its guarantees, and pins
   dark and high contrast where the look inverts. Never set `box-shadow` on a pressable —
   the pressed ring in `app.css` is owed to every control, and a component that paints its
   own takes it away.
6. **Run the gate**: `just frontend-coverage` before moving on, because the floor is
   measured over the whole glob and a ported suite that leaves an arm dead is found here
   rather than at the end; then the story run, which puts axe over every state at error
   level; then `just check`. Request `/chromatic` on the pull request — a port is a visual
   change, and that review is the design review
   ([decision 0009](../decisions/0009-visual-review-in-chromatic.md)). Every port is a Minor
   version under [Published artefacts](../reference/published-artefacts.md) and gets a
   `CHANGELOG.md` entry, and if it renamed a token, changed an accessible name or moved a
   guarantee, run the `consumer-impact` skill as well and record the consequence in
   [Poodl handover](../operations/poodl-handover.md).

## Add an icon

The set lives in `src/lib/assets/icons/`: Lucide SVGs restroked to 1.5 with
`stroke="currentColor"`, covered by the ISC licence text beside them, and mapped one by one
in `src/lib/components/icons.ts`. Every file in the directory is in the map, and
`tests/icons.test.ts` holds the two equal — the map is the package's whole icon API, so a
file without a key is an icon no game can reach.

Drop the new SVG in the directory, restroked the same way, add one `?raw` import and one
key in `icons.ts` — the key is the file name, and the binding is the file name in camel
case, or the nearest thing to it that is not a reserved word: `delete` binds as `del` and
`type` as `typeIcon` — and the `IconName` union picks it up. An icon is `aria-hidden` and has no
accessible name of its own, so the control around it carries both the name and the meaning.

Two things about shipping. `package.json`'s `files` excludes `dist/assets/fonts` and nothing
else under `dist/assets`, because `svelte-package` copies the SVGs to `dist/assets/icons/`
and the emitted `icons.js` still imports them by relative path; widen that exclusion and the
icons leave the tarball while the map still names them, which `just package-smoke` catches
and `just check` does not. And the map keeps Vite's `?raw` suffix, so a consumer needs a
Vite-class build to resolve it — decision 0014 records that cost, and
`src/lib/assets/icons/raw.d.ts` is what keeps the emitted declarations typed as strings.

## The ledger

What the design project holds, who it belongs to, and where it is. The owner column is the
boundary in [What the hub owns](../project/what-the-hub-owns.md) made concrete, one
component at a time: platform material is this repository's to hold and a game's to
install, and game material stays where it is rendered however well it is built.

| Reference | What it is | Owner | State here |
| --- | --- | --- | --- |
| `Icon`, and the 22 restroked Lucide SVGs | The icon set | Platform | Ported, all 22, with the ISC text. "Add an icon" above is the procedure. |
| `IconButton` | The 44px icon-only control | Platform | Ported: the ghost variant, which is all the platform's chrome consumes. |
| `Button` | The text control and its variants | Platform | Ported: primary, secondary and ghost at two sizes, with `current` for the selected one of a set. |
| `HeaderBar` | The page's top bar | Platform | Ported and generalised: a `brand` snippet, an optional chip and a list of actions, so a game supplies its own words. Not yet mounted on the front door. |
| `core/Card`, `core/Badge` | Grouping chrome | Platform | Ported by 0017. `Card` takes three tones and a snippet; `Badge` takes two tones and the word it carries. Their trigger — a consumer — was overruled rather than met. |
| `core/CardLabel` | The uppercase label above a group | Platform | Ported by 0017, and a row this table never had: `CardLabel` is a real component of the design project that no earlier pass listed. It is a level-two heading here rather than the reference's `div`, because the front door was already drawing it as one. |
| `navigation/GameCard` | The platform's game-switcher tile | Platform | Ported by 0017 and mounted on the front door. Its "waits for a second game" was not overruled so much as stale: 0014 had already replaced the wait-for-a-consumer rule and this row was never updated. A reachable game is a link; a planned one is not a control at all, which is where the port departs from the reference. |
| `forms/Input`, `forms/Select` | Labelled field primitives | Platform | Ported by 0017, under the `Fields` surface that record added to `operation.allium`. A real `<label for>`, the hint bound with `aria-describedby`, a refusal reported through `aria-invalid` rather than only inked, and `config.minimum_field_text_size` answered in the field's own `1rem`. |
| `forms/SegmentedControl` | The theme picker's proper shape | Platform | Ported by 0017 as native radios in a `<fieldset>`, not the reference's buttons wearing `role="radio"` — which are each their own tab stop and answer no arrow key, failing both halves of `AGroupOfExclusiveChoicesIsOneStopAndArrowsMoveWithinIt`. It is wired to no setting: doing that would answer an open question by building it. |
| `forms/SettingsRow` | The rule-separated preference row | Platform | Ported by 0017, and reduced to the rule and the room around it. The reference's row also carries the setting's name and description; both moved onto the controls, because the row has to *be* the label for the whole of it to be the 44px target and only the control knows which element that is. |
| `forms/Switch` | The 44×26 toggle | Platform | Ported by 0017. The track is the checkbox itself under `appearance: none`, not a `<span>` beside a hidden one: a hidden control takes focus where the reader cannot see it. The whole `<label>` is the row and the row is the target. The off state draws in `--key-untried-rule`, not the reference's `--rule-strong`, which stands 2.33 off the dark page against a boundary floor of 3.0. |
| `feedback/Dialog`, `feedback/Toast` | The shell shapes | Platform | Ported as Poodl's shapes, `Modal` and `Notice`, rather than as the design project's primitives: Poodl's are the ones a contrast test measured and an axe run has seen. `Notice` is generalised to a message and a tone. |
| `Announcer` | The visually hidden live region | Platform | Ported. Not in the design project — it has nothing to draw — and here because every game owes an announcement somewhere. |
| `brand/MascotSlot` | Where Biscuit mounts | Platform | Not ported, and 0017 declined it explicitly rather than passing over it. The blocker is not a consumer but the art: [The Biscuit character](../design/character.md) says there is "deliberately no placeholder where one would go, because a reserved hollow slot is a second break", and the reference's version is exactly such a placeholder — a dashed box reading "biscuit". Waits for the illustrated poses. |
| `brand/Mark` as its own component | The reduced icon-mark | Platform | Ported by 0017 as **`Monogram`**, not `Mark`: `src/lib/domain/types.ts` already exports `Mark` for a play surface's mark, and renaming that is a Major version. `Wordmark` composes it, and the reference's ratios reproduce the four literals `Wordmark` carried — exactly, at size 20 — which is what makes it a refactor rather than a redraw. |
| `game/Tile` | The single cell | Platform | Ported and generalised by [decision 0016](../decisions/0016-the-play-surface-is-the-platforms.md): `content` rather than a letter, a mark that carries the game's own words with it, and a `label` the caller writes. "Position 3, C, correct" is composed at the call site. |
| `game/Key` | One key of an on-screen keyboard | Platform | Ported by 0016 as a component rather than an inlined button: a real button, an optional mark, a required name, `onpress`, and a glyph for a key that ends a turn. |
| `game/Keyboard` | The keyboard's grouped layout | Platform | Ported and generalised by 0016. The layout is data the caller supplies — `QWERTY` is a default and not a rule — and one callback carries the pressed key's value, because a rack needs five actions and two named callbacks cannot express them. |
| `PhysicalKeyboard` | Typing straight into a surface | Platform | Ported by 0016, over a port. The guards are a pure predicate in `src/lib/domain/typing.ts`, the subscription is `src/lib/ports/keys.ts`, and the component wires the two for as long as it is mounted — so "off" means no listener rather than a listener that declines. Not in the design project: it draws nothing. |
| `HowToPlay` | The mark legend, as a scaffold | Platform | Ported by 0016 as `Explainer`, words injected: prose, a list of example-and-sentence rows drawn with the real `Tile`, and a note. The weakest row in this table under "unchanged", and 0016 says so — what earns it a place is that the legend and the surface draw the same component, so they cannot drift. Not in the design project. |
| `game/Board` | The arrangement of cells | Game | Stays with the game, and by argument rather than by grouping. Poodl's reads `MAX_ATTEMPTS`, `WORD_LENGTH`, `describeAttempt` and `ScoredGuess`: six rows of five is a rule wearing a grid, and a second game changes both numbers. A `Grid` that knew only its rows and cells would be a different component and a different record. |
| `game/StatFigure`, `game/Distribution` | Statistics chrome | Game | Stay with the game, refused on the same test that admitted the cell: what they draw is a game's own data, and an arrangement of it encodes a rule. The reason this row used to give — that nothing here has any figures — was simply wrong, and 0017 corrected it rather than the answer: `--fs-stat` and `--figures-tabular` are both declared in `src/app.css`, measured by `tests/contrast.test.ts` and drawn in `stories/Foundations.stories.svelte`. A row refused for a reason that is not true is a row that gets reopened for the wrong one. |
| `ui_kits/platform` — the page shell, the footer, the About screen | The hub's own page furniture | Platform | Not ported, and a row this table never had. The design project's platform kit carries all three and none was ever catalogued. An About screen is a *second route*, which [decision 0011](../decisions/0011-skeleton-not-a-second-application.md) names as its own reopener, so the three wait on that decision rather than on this page. |

Unported variants of ported components, recorded so that a consumer who reaches for one
knows it is a port rather than an omission:

- `Button`: the design project's `lg` size and its `warm` variant. The platform's chrome
  consumes neither, and the warm family is rationed to `::selection`. Also its `full` width
  and its `as`/`href` forms, both found unrecorded by 0017's survey — a `Button` that rendered
  a link would drop silently out of `EveryControlIsAComfortableTarget`, since `src/app.css`
  floors buttons and fields at 44px and deliberately not links.
- `IconButton`: the `outline` variant. The platform's chrome is ghost throughout. Also its
  `size` and `box` props, which let a caller draw a smaller glyph in a smaller target.
- `Modal`: the reference's `width`. The panel is `min(28rem, 100%)` here and a caller cannot
  narrow it. Whether it should also dismiss on a scrim click is genuinely undecided — the
  reference does, the port does not, and its doc comment never says which it meant.
- `Notice`: the reference is a floating `Toast` a caller positions; this is a block in the
  page's flow. Whether the platform owes both shapes is open, and it decides whether the
  missing animation and shadow are questions at all.
- `Wordmark`: the reference's `md` and `lg` sizes and its `withMark`. Its `product` is no
  longer among them — 0017 ported it, because without one a game could not render its own
  lockup from the package at all.
- `Card`: `pad` and `lift`. A `pad` taking a CSS string is an escape hatch out of the spacing
  scale; a lift needs a shadow scale this repository has argued against having.
- `Badge`: `exact`, `present` and `warm`. The first two are a play surface's marks and a badge
  is not a play cell. `warm` fails twice: the ration, and `--brand-warm` standing about 2.1 off
  the light page against a text floor of 4.5.
- `Monogram`: the `warm` tone, for the second of those reasons.

## Related pages

- [Decision 0014: The hub holds the design system](../decisions/0014-the-hub-holds-the-design-system.md)
- [Decision 0010: The Biscuit Games design system](../decisions/0010-biscuit-games-design-system.md)
- [What the hub owns](../project/what-the-hub-owns.md)
- [Design direction](../design/direction.md)
- [Work in the component workshop](work-in-the-component-workshop.md)
- [Testing](../reference/testing.md)
- [Poodl handover](../operations/poodl-handover.md)
