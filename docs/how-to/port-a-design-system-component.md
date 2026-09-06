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
that measures the palette they spend. This page is the procedure for porting what remains,
one component at a time, and the ledger of what is where.

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

What has not changed is the line. [What the hub owns](../project/what-the-hub-owns.md) asks
whether a second game would need the shape unchanged. A header bar, a button, a dialog
shell: yes, and they are here. A board, a tile, an on-screen keyboard, a result mark: no,
and they stay in the game that has them, however carefully they are built, because the
shape only means something inside that game. The ledger applies the test component by
component, and a row that moves from one side to the other is a decision record, not an
edit.

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
   `docs/specs/appearance.allium`, `Operation` and `Dialog` in `operation.allium`, and the
   three surfaces in `play-surfaces.allium` — and where source
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
   `Notice`'s 40px are the worked examples. The 44px touch target and the 320px narrowest
   width are `operation.allium`'s `config.minimum_touch_target` and
   `config.narrowest_supported_width`, mirrored in `src/lib/config.ts` and measured by
   `tests/operation.test.ts` and by the plays.
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
| `core/Card`, `core/Badge` | Grouping chrome | Platform | Not ported. No consumer yet, in either repository, and Poodl has no Svelte version to port from. |
| `navigation/GameCard` | The platform's game-switcher tile | Platform | Not ported, and the most hub-shaped row in this table. It waits for a second game to switch to. |
| `forms/Input`, `forms/Select` | Labelled field primitives | Platform | Not ported. Poodl's fields are hand-styled rather than components, so there is no carrier to port; they fold into a component here first. |
| `forms/SegmentedControl` | The theme picker's proper shape | Platform | Not ported. `Appearance` specifies the choice; no surface in either repository implements it as a component. |
| `forms/SettingsRow` | The rule-separated preference row | Platform | Not ported. It arrives with the first settings surface built as a component, whichever repository builds one. |
| `forms/Switch` | The 44×26 toggle | Platform | Not ported. Poodl restyles the native checkbox where it stands; extract on the same trigger as `SettingsRow`. |
| `feedback/Dialog`, `feedback/Toast` | The shell shapes | Platform | Ported as Poodl's shapes, `Modal` and `Notice`, rather than as the design project's primitives: Poodl's are the ones a contrast test measured and an axe run has seen. `Notice` is generalised to a message and a tone. |
| `Announcer` | The visually hidden live region | Platform | Ported. Not in the design project — it has nothing to draw — and here because every game owes an announcement somewhere. |
| `brand/MascotSlot` | Where Biscuit mounts | Platform | Not ported. Waits for the illustrated poses. She lands at the boundaries — the page bookends and a game's outcome moments — and reduces to the mark when motion is off, per [The Biscuit character](../design/character.md). |
| `brand/Mark` as its own component | The reduced icon-mark | Platform | Folded into `Wordmark.svelte`. Extract when the favicon or the mascot's motion-off state needs it standalone. |
| `game/Board`, `game/Tile`, `game/Key`, `game/Keyboard` | Play primitives | Game | Stay with the game. Poodl's own components carry the behaviour contracts and Poodl's own specifications decide them; they become shared material only when Pawjong renders the same shape. |
| `game/StatFigure`, `game/Distribution` | Statistics chrome | Game | Stay with the game. Poodl carries them as restyles inside its statistics panel, and a game's figures are its own data. Nothing here has any. |

Unported variants of ported components, recorded so that a consumer who reaches for one
knows it is a port rather than an omission:

- `Button`: the design project's `lg` size and its `warm` variant. The platform's chrome
  consumes neither, and the warm family is rationed to `::selection`.
- `IconButton`: the `outline` variant. The platform's chrome is ghost throughout.

## Related pages

- [Decision 0014: The hub holds the design system](../decisions/0014-the-hub-holds-the-design-system.md)
- [Decision 0010: The Biscuit Games design system](../decisions/0010-biscuit-games-design-system.md)
- [What the hub owns](../project/what-the-hub-owns.md)
- [Design direction](../design/direction.md)
- [Work in the component workshop](work-in-the-component-workshop.md)
- [Testing](../reference/testing.md)
- [Poodl handover](../operations/poodl-handover.md)
