---
title: "Decision 0017: The rest of the design system is ported"
kind: "decision"
audience: [contributor, maintainer, agent]
canonical_for: [decision_design_system_completion]
requires: []
---

# Decision 0017: The rest of the design system is ported

## Context

[The porting guide](../how-to/port-a-design-system-component.md) carries a ledger of every
component the Claude Design project holds, who owns it, and where it is. Nine rows marked
Owner **Platform** stood unported, and five of them stood behind a stated trigger rather than
behind an argument:

- `core/Card` and `core/Badge` — "No consumer yet, in either repository".
- `navigation/GameCard` — "It waits for a second game to switch to".
- `forms/SettingsRow` — "It arrives with the first settings surface built as a component".
- `forms/Switch` — "extract on the same trigger as `SettingsRow`".
- `forms/SegmentedControl` — "no surface in either repository implements it as a component".

Not one of those triggers has fired. Poodl is still the only game, there is still no settings
surface, and Pawjong is still intended rather than built. This record acts anyway, and
[the decision index](README.md) is explicit about what that is called: a trigger is
**overruled on** a date when a later record acts without it, "which is not the same as the
trigger firing and must never be written as though it were."

**One of the five is not an overrule at all, and the ledger is simply behind.**
[Decision 0014](0014-the-hub-holds-the-design-system.md) already replaced the
wait-for-a-consumer rule with "a platform-shaped component, one a second game would render
unchanged, is built or ported here first, whether or not a second consumer exists yet", and
the porting guide records that change in its own opening paragraphs. The `GameCard` row was
never updated to match. For `GameCard` this record corrects an oversight; for the other four
it overrules.

**What changed is that the hub acquired the consumer it was waiting for, and it is the hub.**
The front door is one route that mounts `Wordmark` and nothing else — a hand-rolled `<ul>` of
games where a game switcher belongs, and an `<h2>` styled inline with the exact recipe the
design project ships as a component. `HeaderBar` has been ported since 0014 and mounted
nowhere. A platform whose own front page does not render the platform's components is the
arrangement [decision 0001](0001-biscuit-games-is-the-source-of-truth.md) exists to end,
one storey up from where 0014 found it.

**Two things the survey turned up decided the shape rather than the timing.** The brand mark
cannot be called `Mark`: `src/lib/domain/types.ts` already exports that name for a play
surface's mark, and renaming it is a Major version for every consumer. And the form controls
had nothing in `docs/specs/` governing them at all, which
the first of this repository's invariants does not permit — so the specification moved first.

## Decision

**Every Platform-owned row is ported, except the one refused on grounds that still hold.**
`Card`, `CardLabel`, `Badge`, `GameCard`, `Switch`, `SegmentedControl`, `SettingsRow`,
`Input` and `Select` land here, each with a test, a story and a ledger row that stops saying
it is waiting.

**`CardLabel` gains a row it never had.** It is a real exported component of the design
project that the ledger has never named, and the front door already draws its recipe inline.

**The brand mark is extracted as `Monogram`.** `Wordmark` composes it. The name is not the
design project's, because `Mark` is taken by the play-surface type and a component of that
name would collide with it in the barrel.

**`Wordmark` gains an optional `product`.** Without it the lockup reads "biscuit games", as it
always has. With it, "biscuit games / poodl". A game that installed the package could not
render its own lockup at all before this, and had to hand-build one while matching
`--font-display`, weight 600, `--track-display` and the `words` class `HeaderBar`'s collapse
reaches into — a cost recorded nowhere, and paid twice as soon as there are two games.

**`operation.allium` gains `surface Fields` and `config.minimum_field_text_size`.** The form
controls answer to five guarantees that were stated nowhere: that a field's name is bound to
it rather than beside it, that its own words are bound to it too, that a refusal is reported
and not only inked, that a group of exclusive choices is one stop with the arrows moving
inside it, and that a field's text is large enough that reaching it does not magnify the page.
The figure closes an inversion [decision 0015](0015-operation-and-play-are-specified-here.md)
exists to close: it was prose in this repository answering a guarantee that lived in Poodl's
specifications.

**The front door mounts `HeaderBar`, `CardLabel` and `GameCard`.** Poodl as ready, Pawjong as
planned. It stays one route.

## What was weighed and not taken

**A fourth Allium module for the controls.** `appearance.allium` excludes "the controls that
change these settings" and `operation.allium` excludes "where the switch is … and whether
there is one", and a first reading of those makes the controls homeless. They do not.
Both exclusions are about *which* controls a surface has and *where the panel lives* — product
decisions — and neither excludes what a control owes when it is worked, which is the whole
subject of the module the surface joined. A fourth root module would have restated
`DirectManipulation` to reach it.

**Wiring the controls to the settings they were designed for.** A `Switch` bound to
`high_contrast` would answer `appearance.allium`'s open question about the contrast escape
hatch by building it, and one bound to the bare-key claim would answer `operation.allium`'s.
Both questions say in terms that answering them in code would let whichever repository draws a
panel first decide them. The controls ship as primitives, and their stories drive them from
local state.

**`brand/MascotSlot`.** Refused, and not on consumer grounds — its trigger is the illustrated
poses, which do not exist. [The Biscuit character](../design/character.md) is stronger than
that: "there is no illustrated pose, no `MascotSlot`, and deliberately no placeholder where
one would go, because a reserved hollow slot is a second break." The design project's version
is exactly such a placeholder, a dashed box reading "biscuit". Porting it would spend the
brand's one break on a hole.

**An About route, a page shell and a footer.** The design project's platform kit has all
three, and none has a ledger row. An About screen is a second route, which
[decision 0011](0011-skeleton-not-a-second-application.md) names as its own reopener. They are
recorded in the ledger as discovered and not ported, which is the cheapest honest answer.

**`game/Board`, `game/StatFigure` and `game/Distribution`.** Still the game's, on
[decision 0016](0016-the-play-surface-is-the-platforms.md)'s argument: an arrangement encodes
a rule. `StatFigure`'s ledger reason is corrected rather than its answer — it says "Nothing
here has any figures", which `--fs-stat` and `--figures-tabular` contradict — because a row
refused for a reason that is not true is a row that will be reopened for the wrong reason.

## Consequences

**Ten more components are paid for over the coverage floor.** Each arrives with a test in
`tests/` and a story in `stories/`, and 90% over `src/lib/**` is measured across all of them
together. This is the same price 0014 and 0016 each named, at the largest scale it has been
paid: a variant nobody renders is a branch nothing covers, so the ported contracts are the
minimum each shape needs and the rest are recorded as unported rather than shipped.

**Chromatic's snapshot count rises again.** It was named as a growing concern at 0014 and
again at 0016, and neither answered it. Ten components with their dark and high-contrast pins
compound it a third time. TurboSnap is still not configured and this record does not configure
it; it notes that the third compounding is the one that should have forced the question.

**The package goes to a Minor version.** Ten components added, one optional prop added, five
guarantees and one config figure added — every one of those is Minor under
[Published artefacts](../reference/published-artefacts.md), and none of the Major triggers is
touched: no token is renamed, no component is removed, no required prop is added to anything
that existed, and no accessible name or role changes.

**Poodl inherits a specification surface it did not ask for.** The three modules ship in the
package, so `Fields` and `minimum_field_text_size` reach Poodl on its next bump and its own
fields answer to them. [The Poodl handover](../operations/poodl-handover.md) carries what
that costs, including the settings-row binding question it already flagged.

**The front door becomes a thing that can break.** One route that rendered a lockup and a list
could not fail a visual review. One that renders four components can, which is the point of
running it through Chromatic, and the cost of having a front page worth looking at.

## What would reopen this

A shape here needing a game-specific prop to express, which is 0014's reopener and 0016's, and
now has ten more components to bite on. `GameCard` is the likeliest: `status` admits exactly
`ready` and `planned`, and a third state that is a game's own would be the signal.

The settings surface actually being built, in either repository. `Fields` says what a control
owes and deliberately not where the panel lives; the first panel forces both open questions
this record declined to answer, and answering them is a specification change before it is a
component.

The illustrated poses arriving, which reopens `MascotSlot` on its own trigger rather than
this record.

A second route being wanted, which reopens decision 0011 rather than this one — but the About
screen, the page shell and the footer are the shapes waiting on it, and they are recorded in
the ledger so that whoever reopens it finds them.

Consumption stalling again. Twenty-three components nobody renders is a worse version of the
thirteen 0016 named, and the front door mounting four of them is the only part of this record
that proves anything.

## Related pages

- [Port a design system component](../how-to/port-a-design-system-component.md)
- [What the hub owns](../project/what-the-hub-owns.md)
- [Decision 0016: The play surface is the platform's](0016-the-play-surface-is-the-platforms.md)
- [Decision 0015: Operation and play are specified here](0015-operation-and-play-are-specified-here.md)
- [Decision 0014: The hub holds the design system](0014-the-hub-holds-the-design-system.md)
- [Decision 0011: A skeleton, not a second application](0011-skeleton-not-a-second-application.md)
- [The Biscuit character](../design/character.md)
- [Published artefacts](../reference/published-artefacts.md)
- [Poodl handover](../operations/poodl-handover.md)
