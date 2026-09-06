---
title: "Decision 0016: The play surface is the platform's"
kind: "decision"
audience: [contributor, maintainer, agent]
canonical_for: [decision_play_surface_ownership]
requires: []
---

# Decision 0016: The play surface is the platform's

## Context

**This reverses a position three pages of this handbook state deliberately.**
[What the hub owns](../project/what-the-hub-owns.md) listed "its play-surface primitives — a
board, a tile, a rack, an on-screen keyboard, a result mark" among the things that live in a
game repository. [Decision 0014](0014-the-hub-holds-the-design-system.md) named `Tile`,
`Board`, `Keyboard`, `PhysicalKeyboard`, `DistributionChart` and `HowToPlay` as staying in
Poodl. [The porting guide](../how-to/port-a-design-system-component.md) said "A board, a
tile, an on-screen keyboard, a result mark: no, and they stay in the game that has them,"
and its ledger put four of them under Owner **Game**. None of that was an oversight. It was
the answer, and it was argued for.

**What changed is not that a second game appeared.** It has not. Both 0010 and 0014 name a
second game as the trigger, and that trigger has been overruled rather than met — the
reasoning below is why it was the wrong test.

What changed is the evidence about who already decides these shapes. `src/app.css` in this
repository and in Poodl is byte-identical in every declaration: 110 custom properties on
each side, none unique to either. Among them are `--result-exact`, `--result-present`,
`--result-absent`, `--key-untried-bg`, `--key-untried-rule`, `--key-scored-bg`, `--gap-tile`,
`--gap-key`, `--radius-tile`, `--radius-key`, `--font-board`, `--fs-board` and
`--track-board`. This repository's own stylesheet header says why they are here: "The result
and key tokens below are the game surface's, and they are carried here whole rather than
pruned: this file is the system, and a hub copy missing half of it would make a game's the
superset." `tests/contrast.test.ts` measures every one of them, in all four combinations, on
every run of `just check`. And two of the platform's own controls — `Button`'s secondary
variant and `HeaderBar`'s chip — draw their boundary in `--key-untried-rule`, a token named
for a game's keyboard, because it is the one hairline in the palette that clears the
boundary floor in dark.

**So the hub already decides what a tile and a key look like. What Poodl holds is the
markup.** That is the arrangement [decision 0001](0001-biscuit-games-is-the-source-of-truth.md)
exists to end, and 0014 said so in its own words about the components it did port: the
game's copy was the superset, and the hub was authoritative over material it did not hold.
0014 applied that argument to `Button` and `Modal` and declined to apply it to `Tile`, on the
grounds that `Tile` "carries Poodl's behaviour contracts". It does. So did `HeaderBar`, which
arrived carrying a game mode, a game status and five named callbacks, and so did `Notice`,
which arrived carrying a union of Poodl's notice kinds. **0014 generalised both rather than
refusing them, and that is the precedent this record applies.**

Poodl's own decision 0010 anticipated it in terms: a second game "would pull the board
primitives out into shared components and test the 'same instrument, different attachment'
claim for real." The claim is still a claim, and a second game is the expensive way to test
it. Building the shape here first is what 0014 already decided to do for every other
component.

**What the test in What the hub owns actually asks is whether a second game would need the
shape unchanged, and the answer turns on how much of a game is in the shape.** Read
Poodl's `Tile.svelte` and the game-specific parts are three: the word "Position", the
sentence "in the word, wrong place", and the state name `correct`. Everything else — a cell,
a glyph, a border in a result ink, a marker bar whose length is the non-colour indication —
is the palette's, and the palette is ours. A crossword cell and a rack tile render that
shape unchanged. `Board.svelte` is the opposite: it reads `MAX_ATTEMPTS`, `WORD_LENGTH`,
`describeAttempt` and `ScoredGuess`, and six rows of five is a rule wearing a grid.

**That asymmetry is where the new line is drawn.** On 2026-09-05 the maintainer settled it.

## Decision

**A cell and a key are the platform's. How cells are arranged, what a mark means, and a
game's own figures are the game's.**

Five components come across from Poodl, generalised on the way, under the obligations
[decision 0015](0015-operation-and-play-are-specified-here.md) states:

- **`Tile`** — one cell that is read. Takes `content` as a string rather than a letter, an
  optional mark, and a `label` that is the caller's own sentence about where the cell is.
- **`Key`** — one cell that is pressed: a real button, so it takes focus, answers Enter and
  Space, and reports its own unavailability.
- **`Keyboard`** — rows of keys from a layout the caller supplies, with one callback
  carrying the pressed key's value. Poodl's three named callbacks do not survive a second
  consumer: a crossword needs *clear* and *check*, a rack needs *shuffle*, *recall*, *play*,
  *pass* and *exchange*, and two named callbacks cannot express five actions.
- **`PhysicalKeyboard`** — the device's own keyboard wired to a surface, over a port.
- **`Explainer`** — the scaffold of an explanation and not its words.

**A mark is inseparable from the words for it.** The mark a component takes carries both the
name and the game's sentence, so a painted state with nothing to say is unrepresentable
rather than merely discouraged. Two independent optional props could not be enforced by the
type system and could not be caught by a test: the tile would render, axe would pass, the bar
would draw, and a reader would hear a glyph with no state — `AMarkIsNeverOnlyAColour` failing
silently in the one channel no gate inspects.

**`Board`, `DistributionChart` and `StatFigure` stay with the game**, and the ledger says so
with the reason rather than by omission. They are refused on the same test that admitted the
cell: an arrangement encodes a rule, and a distribution draws a game's own data.

**`PhysicalKeyboard` is a port, not a component that listens.**
[Layering](../explanation/layering.md) forbids a component from reaching for a browser
global and narrows that to `Modal`'s read of its *own* document; a window-level key
subscription that outlives the render is categorically stronger, and invariant 3 already
prescribes the shape. So the guards live in `src/lib/domain/` as a pure predicate over a
value type, the subscription lives in `src/lib/ports/`, and the component wires the two for
as long as it is mounted. Three returns: every guard becomes a unit test with no DOM,
`DroppingTheClaimIsTotal` becomes an assertion that no listener remains rather than an
argument from a conditional block, and `layering.md` needs no amendment because its table already
describes this arrangement.

## Consequences

**The count of components rises, and the coverage floor is paid over all of them.** Every
one arrives with a test in `tests/` and a story in `stories/`. That is what 0014 said a
component costs here, and it is the same price.

**`tests/` gains a structural-hook exception this repository has never had.** The marker bar
that discharges `AMarkIsNeverOnlyAColour` is `aria-hidden` decoration with no role and no
name *because* the name beside it already says the same thing in words — giving it one would
have a reader hear the mark twice. So the role-and-name convention cannot reach it and it is
queried by `[data-marker]`, on stated terms. Only that one hook crosses: Poodl also
grandfathers `data-mark` so its tests can find a key by its state, and nothing here does,
because a mark's description is in the accessible name and the element is found by it.

**`Explainer` is the weakest row under "unchanged", and this record says so rather than
letting the ledger imply otherwise.** A scaffold with its prose, its examples and its note
all injected is close to a layout. The honest defence is narrow: what it holds that a layout
does not is that each example is drawn with the same component the surface itself draws, in
every theme and both palettes, which is the only way a legend cannot drift from the thing it
explains. If a second game wants a different arrangement of that legend, the row goes back
rather than growing a prop.

**Poodl gains a contract change at every call site**, each an item in
[Poodl handover](../operations/poodl-handover.md): the mark's name and its words, the
keyboard's layout and its single callback, the tile's content and label, the explainer's
words, and a port to construct at its route. Its marker-bar geometry changes too, because
`Tile` and `Key` drew the same indication to different figures and the system now owns one
set.

**Chromatic's snapshot count grows again.** [Decision 0009](0009-visual-review-in-chromatic.md)
named the count as the trigger for the TurboSnap question; it was noted rather than answered
at thirty-seven, and it is noted again here.

**The claim 0010 wanted a second game to test is now testable without one.** Whether these
shapes really are one instrument with different attachments is answered when a second game
renders them. Until then the claim is made with the cost paid up front here, which is the
arrangement 0014 already chose for every other component, and the failure mode is visible: a
component that has to grow a game-specific prop is the evidence that it was wrong, and it
loses the feature rather than gaining it.

## What would reopen this

A shape that needs a game-specific prop to express. Same rule as 0014, and now with more
surface for it to bite on: `Keyboard` is the likeliest, because a layout is where a game's
alphabet lives.

A game needing a mark the palette does not name. The component set can express exactly
`exact`, `present` and `absent`; a fourth is a token change, a `play-surfaces.allium` change
and a contrast-test change before it is a component, and if that arithmetic will not close,
the shape belongs to whoever needs it.

`Board` being wanted here. It is refused today because it reads a game's rules; a `Grid` that
took its rows and cells and knew nothing else would be a different component and a different
record, not this one reopened by argument.

Poodl's consumption stalling, which is 0014's second reopener with more at stake. Thirteen
components nobody renders is a worse version of eight.

## Related pages

- [What the hub owns](../project/what-the-hub-owns.md)
- [Port a design system component](../how-to/port-a-design-system-component.md)
- [Decision 0015: Operation and play are specified here](0015-operation-and-play-are-specified-here.md)
- [Decision 0014: The hub holds the design system](0014-the-hub-holds-the-design-system.md)
- [Decision 0010: The Biscuit Games design system](0010-biscuit-games-design-system.md)
- [Design tokens](../design/tokens.md)
- [Testing](../reference/testing.md)
- [Poodl handover](../operations/poodl-handover.md)
