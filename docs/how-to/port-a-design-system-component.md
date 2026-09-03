---
title: "Port a design system component"
kind: "how-to"
audience: [contributor, maintainer, agent]
canonical_for: [design_system_porting]
requires: []
---

# Port a design system component

The Biscuit Games design system lives in a Claude Design project ("Copy of Biscuit Games
Design"), as React reference components over the token vocabulary `src/app.css` now
carries. [Decision 0010](../decisions/0010-biscuit-games-design-system.md) brought the
tokens and the two typefaces across;
[decision 0011](../decisions/0011-skeleton-not-a-second-application.md) is why exactly one
component came with them. This page is the procedure for porting the rest into this
repository, one component at a time, and the ledger of what remains.

The direction of travel is what makes the procedure worth writing down. A port arrives here
from the design project, and a game takes it from here afterwards — by copying and citing
rather than by installing, which is
[decision 0002](../decisions/0002-shared-material-travels-by-citation.md). So a port is
never a local convenience. It is the platform settling a shape on behalf of every game that
will render one, which is why the ledger below is a boundary as much as a backlog.

## When to port, and when to restyle in place

Port a component when more than one consumer wants the same shape. The consumers are now
repositories as often as they are call sites: a shape one game renders is that game's
however carefully it is built, and a shape two games will render is the platform's before
the second one starts. [What the hub owns](../project/what-the-hub-owns.md) draws that line;
the ledger applies it component by component.

A design system component with one consumer is a file tax, and here it is a test tax too.
Nothing lands under `src/lib/` without a test in `tests/` and a story in `stories/`, and the
coverage floor is 90% over `src/lib/**`, so a component ported ahead of its consumer is a
file a suite has to exercise while having nothing to say about it. Take the styles into the
consumer, or leave the component in the ledger, and record the decision here either way.

## The recipe

1. **Read the reference component** in the design project (`components/**` there), and the
   spec surface that will consume it — today that is `Appearance` in
   `docs/specs/appearance.allium`, the only module this repository holds. Where they
   disagree, the specification wins; that is AGENTS.md invariant 1, and the deviations
   decision 0010 records are what the rule cost the first time anyone applied it. Where
   Poodl already carries a Svelte version of the same component, read it as a worked
   example — the props contract it settled, the test it earned — but port from the
   reference. Poodl's copy is downstream of this repository even where it happens to exist
   first.
2. **Map tokens, never hex.** Every colour in the port names a token from `src/app.css`.
   Two rules with teeth: a live control's border is `--key-untried-rule`, never `--rule` or
   `--rule-strong`, because a control's boundary owes `minimum_boundary_contrast` against
   the page and the decorative rules do not pay it in dark — the token's name is inherited
   from the board vocabulary, and so is the 1.30 that `--rule` measures there; and
   `--text-2`/`--text-3` are reading inks for the quiet grounds only. A new measured pair —
   any ink on any new ground — has nowhere here to be proved. `tests/contrast.test.ts` was
   not ported, nothing in this repository recomputes a ratio, and every figure the
   stylesheet's comments quote is Poodl's measurement inherited rather than one made here.
   A port that introduces a pair either brings that test across with it or says plainly, in
   the component's own comment, that the pair is unverified. The one exception is the
   unavailable state: `Appearance.@guarantee AnUnavailableControlIsExempt` holds a control
   the reader cannot operate to none of the figures, so `--text-disabled` and a disabled
   border are ported as the design system draws them and are measured nowhere. What a
   ported disabled state does owe is the other half of that guarantee — the unavailability
   in the accessibility tree, and every non-colour indication the live form carried kept.
3. **Write the props contract in TypeScript**: `$props` with an explicit type,
   callbacks-as-props, no event dispatcher, no `...rest` spreading. Port the variants this
   repository renders, list the rest under "Unported variants" below, and be willing to port
   none of them. `Wordmark.svelte` takes no props at all, because a prop for a name nothing
   here has would be a branch with nothing to cover it.
4. **Land component, test and story in one change.** The test queries by role and name in
   `tests/`; the story covers the states the surface names, cites its guarantees, and pins
   dark and high contrast where the look inverts. Never set `box-shadow` on a pressable —
   the pressed ring in `app.css` is owed to every control, and a component that paints its
   own takes it away.
5. **Run the gate**: the story run puts axe over every state at error level, then
   `just check`. Request `/chromatic` on the pull request — a port is a visual change, and
   that review is the design review
   ([decision 0009](../decisions/0009-visual-review-in-chromatic.md)). If the port renamed a
   token, changed an accessible name or moved a guarantee, run the `consumer-impact` skill
   as well: a game is reading this material by citation, and no gate here can see over
   there.

## Add an icon

The icons have not been ported. There is no `src/lib/assets/icons/` in this repository, no
`icons.ts` and no `Icon.svelte`: the 22 restroked Lucide SVGs and the ISC licence text sit
in Poodl, which imports ten of them. The first icon this repository needs therefore brings
the whole apparatus with it — the directory, the licence file, the map and the component —
and that is a port in its own right rather than a step inside one.

Once it is here, the shape is the one Poodl already runs. Drop the Lucide SVG in
`src/lib/assets/icons/` (stroke 1.5, `stroke="currentColor"`, covered by the ISC licence
file beside it), add one `?raw` import and one key in `src/lib/components/icons.ts`, and the
`IconName` union picks it up. Only imported icons ship; an SVG nobody names costs nothing.
An icon is `aria-hidden` and has no accessible name of its own, so the control around it
carries both the name and the meaning.

## The ledger

What the design project holds, who it belongs to, and what stands in the way. The owner
column is the boundary in [What the hub owns](../project/what-the-hub-owns.md) made
concrete, one component at a time: platform material is this repository's to hold and a
game's to copy, and game material stays where it is rendered however well it is built.

| Reference | What it is | Owner | State here |
| --- | --- | --- | --- |
| `Icon`, and the 22 restroked Lucide SVGs | The icon set | Platform | Not ported. Poodl holds the SVGs and the ISC licence and imports ten of them; "Add an icon" above is what arriving looks like. |
| `IconButton` | The 44px icon-only control | Platform | Not ported. Nothing here has a control to put inside one. |
| `Button` | The text control and its variants | Platform | Not ported. The front door has one link and no button. |
| `HeaderBar` | The page's top bar | Platform | Not ported. One route, and no navigation to hold. A second route is the trigger. |
| `core/Card`, `core/Badge` | Grouping chrome | Platform | Not ported. No consumer yet, in either repository. |
| `navigation/GameCard` | The platform's game-switcher tile | Platform | Not ported, and the most hub-shaped row in this table. It waits for a second game to switch to. |
| `forms/Input`, `forms/Select` | Labelled field primitives | Platform | Not ported. There is no form in this repository; Poodl's fields are hand-styled and would fold in here first. |
| `forms/SegmentedControl` | The theme picker's proper shape | Platform | Not ported. `Appearance` specifies the choice; no surface in this repository implements it. |
| `forms/SettingsRow` | The rule-separated preference row | Platform | Not ported. It arrives with the first settings surface, whichever repository builds one. |
| `forms/Switch` | The 44×26 toggle | Platform | Not ported. Poodl restyles the native checkbox where it stands; extract on the same trigger as `SettingsRow`. |
| `feedback/Dialog`, `feedback/Toast` | The shell shapes | Platform | Not ported. Poodl carries them as its `Modal` and `Notice` restyles. A port here takes the primitives rather than those two, because this copy is the one every game reads. |
| `brand/MascotSlot` | Where Biscuit mounts | Platform | Not ported. Waits for the illustrated poses. She lands at the boundaries — the page bookends and a game's outcome moments — and reduces to the mark when motion is off, per [The Biscuit character](../design/character.md). |
| `brand/Mark` as its own component | The reduced icon-mark | Platform | Folded into `Wordmark.svelte`, the one component this repository has. Extract when the favicon or the mascot's motion-off state needs it standalone. |
| `game/Board`, `game/Tile`, `game/Key`, `game/Keyboard` | Play primitives | Game | Stay with the game. Poodl's own components carry the behaviour contracts and Poodl's own specifications decide them; they become shared material only when Pawjong renders the same shape. |
| `game/StatFigure`, `game/Distribution` | Statistics chrome | Game | Stay with the game. Poodl carries them as restyles inside its statistics panel, and a game's figures are its own data. Nothing here has any. |

Unported variants of ported components: none, and the line is kept deliberately rather than
deleted. The only ported component is `Wordmark`, which has no variants and takes no props;
the first port that lands a variant set records here the ones it left behind.

**The first thing that should follow is not a component.** `tests/contrast.test.ts` was not
ported, so nothing in this repository recomputes a contrast ratio, and every figure in
`src/app.css`'s comments is an inherited claim rather than a measurement. The tokens are
here and the proof is in Poodl. That test costs one file and no design decisions, and until
it lands, every row above that would add a colour adds an unverified one — which is exactly
the state the test exists to end. [Accessibility](../explanation/accessibility.md) holds the
model the figures answer to.

## Related pages

- [Decision 0010: The Biscuit Games design system](../decisions/0010-biscuit-games-design-system.md)
- [Decision 0011: A skeleton, not a second application](../decisions/0011-skeleton-not-a-second-application.md)
- [What the hub owns](../project/what-the-hub-owns.md)
- [Design direction](../design/direction.md)
- [Work in the component workshop](work-in-the-component-workshop.md)
- [Testing](../reference/testing.md)
