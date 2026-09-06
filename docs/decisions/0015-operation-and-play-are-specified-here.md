---
title: "Decision 0015: Operation and play are specified here"
kind: "decision"
audience: [contributor, maintainer, agent]
canonical_for: [decision_operation_and_play_specs]
requires: []
---

# Decision 0015: Operation and play are specified here

## Context

`appearance.allium` was lifted out of Poodl's `settings.allium` as the platform's first
shared surface, and it was deliberately narrow: how a surface *looks*. Three obligations
came across with the tokens and answered to no clause in it — that everything is keyboard
operable, that every control is 44px across in both directions down to a 320px viewport,
and that a tap does only what the control does.
[Accessibility](../explanation/accessibility.md) has carried them since as standing rules
in a stylesheet, a story fixture and a review skill, and has said in as many words that
where they are finally stated "is not yet decided, and it is the next specification
question this repository owes an answer to."

Two other things sharpened it. `stories/fixtures.ts` held 44 and 320 with a docblock
explaining that they were "the other kind" of figure — a rule every game's surface is held
to, which the platform had not lifted into a specification of its own. And
[the Poodl handover](../operations/poodl-handover.md) recorded the inversion in its
plainest form: `Modal` is decided here, and the only written contract for its keyboard
behaviour was `settings.allium`'s `FullyKeyboardOperable`, over in the game. That is
invariant 1 read backwards — the copy governing the original.

[Decision 0016](0016-the-play-surface-is-the-platforms.md) then made the question urgent
rather than merely owed. A keyboard held here, whose defining property is that an unmarked
key is distinguishable from a marked one, cannot be governed by a figure only Poodl states.
The choice was to state the obligations here or to refuse the components.

## Decision

Two modules join `appearance.allium` under `docs/specs/`.

**`operation.allium`** states how a Biscuit Games surface is *operated*, as against how it
looks. It carries `config.minimum_touch_target = 44` and
`config.narrowest_supported_width = 320`, the `DirectManipulation` contract Poodl states in
`game.allium`, and three surfaces: `Operation`, which every surface owes;
`Dialog`, which is the shell's contract finally written where the shell is decided; and
`TypedInput`, which is what a surface owes when it claims bare key presses for itself.

**`play-surfaces.allium`** states what a *play surface* owes: `enum PlayMark` with
`unmarked`, `exact`, `present` and `absent`; that a mark is never conveyed by colour alone
and never drawn without the game's words for it; and the two separations those marks sit at,
`config.minimum_state_separation = 3.0` and `config.minimum_mark_separation = 2.0`.

Both import nothing, for the reason `appearance.allium` imports nothing: a root module is
one a game inherits whole. The three are **peers rather than layers** — a dialog's focus
trap does not depend on what a mark means, and a mark does not depend on how a dialog
behaves, so an import between them would assert a dependency that is not there. Each names
the others once, in its `Dependencies` block, and cross-module references are made in prose.

**`unmarked` is named in the enum, and that is deliberate.** The platform now states
`minimum_state_separation`, which is a distance *involving* the unmarked state; a module
that states a ratio governing a state and then refuses to name it is stating a figure about
a null. Unmarked is also a rendered state rather than missing information —
`--key-untried-bg` and `--key-untried-rule` are its own ground and its own hairline, and a
null has no appearance.

**The marks are named after the tokens, not after a game.** `src/app.css` says
`--result-exact`, `--result-present` and `--result-absent`, and it deliberately does not say
`--result-correct`: *correct* is Poodl's word, sitting in Poodl's `LetterMark` today.
Whoever wrote those tokens generalised a step ahead of the specification, and this module
catches up rather than inventing a third vocabulary. `present` says only *this counts, not
here*; `absent` says only *this counts for nothing*; neither names a word, a guess or a
position.

**The separations move here, and that is the contested half.** `--n-65` and `--n-75` are
this repository's tokens, pinned by constraint windows that are exactly these two figures,
and [Design tokens](../design/tokens.md) has recorded them as inherited claims measured by
Poodl's gate and not by ours. A token pinned here by a figure stated there is the same
inversion in a second place. Stating them here closes it and grows `tests/contrast.test.ts`
by the block [decision 0014](0014-the-hub-holds-the-design-system.md) declined to port.

**No `@guarantee` in `appearance.allium` is amended, and that is a rule this record states
rather than a coincidence.** Its `EveryCombinationMeetsTheLegibilityFloor` says "A game that
puts two of its **own** states side by side owes a separation between them as well and
states that figure itself", and that stays literally true: the platform's marks are no
longer a game's own. Only the module header changes — the `Excludes` bullet gains a pointer
to `play-surfaces.allium`, and `Dependencies` stops calling this "the" root module. Amending
a guarantee would make the release Major under
[Published artefacts](../reference/published-artefacts.md) and would oblige every game to
re-prove a clause it already claims to satisfy, for no behavioural difference.

## What was weighed and not taken

**Rewriting that guarantee anyway.** The closing sentence could have been rewritten to name
both places a separation is stated, which reads more helpfully to someone holding only that
file. It would have been Major, and the `Excludes` pointer buys the same discoverability for
a comment's price. Recorded because the next reader will reach for it.

**Typed input in the play module.** It generalises Poodl's `PhysicalKeyboardInput`, which is
typing into a play surface, so that is where it first went. But the claim clauses qualify
`FullyKeyboardOperable` and the dialog clauses directly — a surface that claims Enter breaks
activation of the focused control — and putting a qualifier in a different module from the
clause it qualifies, with no import between them, reproduces inside this repository the
inversion the handover page complains about across the boundary. So the claim is
`operation.allium`'s and only the on-screen keyboard's completeness is
`play-surfaces.allium`'s.

**A motion clause on the play surface.** A tile's reveal is motion, so a
`MotionOnAPlaySurfaceDefersToTheReader` was drafted and dropped: it restates
`ReducedMotionOverridesTheAnimationSetting`, and two authoritative texts in one repository,
both green, is worse than the copy it would have justified.

**An enumeration for the shape that earns the touch-target exemption.** A
`ControlPlacement { standalone | in_a_row }` would have made the exemption formal rather
than prose. `appearance.allium`'s deliberate shape is that obligation lives entirely in
prose with no formal predicate, `analyse`'s findings cannot be waived and a value with no
producer is the shape they land on, and the generalisation was reachable in prose — a row
with more controls in it than the figure divides into the narrowest width. Worth trying once
the binary is in hand and the shape can be measured.

## Consequences

`src/lib/config.ts` stops mirroring one module and starts mirroring three, gaining
`MINIMUM_TOUCH_TARGET`, `NARROWEST_SUPPORTED_WIDTH`, `MINIMUM_STATE_SEPARATION` and
`MINIMUM_MARK_SEPARATION`. Its docblock said a game's own figures include "its touch target,
its narrowest width, the separations between its own states"; all three examples are now
wrong and it names a word length and an attempt count instead.

**`stories/fixtures.ts` is deleted rather than trimmed.** It held those two constants and
nothing else, and its own header stated the condition of its existence — "Until it closes
they live here". The gap closed, and keeping the file as a re-export would leave a second
name for one fact.

**`tests/operation.test.ts` is the largest single return.** It ports Poodl's
`directManipulation.test.ts`, reads `src/app.css` and `src/app.html` from disk and measures
the resolved cascade — and it went green on arrival for twelve of its fourteen cases,
because every rule it measures was already in this repository's stylesheet and nothing here
had ever asserted one. Roughly two hundred lines the hub ships became rules a gate can fail
on, with no component code at all.

`tests/contrast.test.ts` measures a separation for the first time. The pairs behind `--n-65`
and `--n-75` are held at both ends here rather than one. They passed on arrival — the
palette has cleared 3.69 and 3.28 against floors of 3.0 and 2.0 since decision 0010 — so
this is characterisation rather than a defect found, and the value is that the figures can
no longer move here unnoticed.

The package's `exports` map grows by two. `files` already carries `docs/specs`, so the text
would have shipped either way and the omission would have been silent: `publint --strict`
does not read the map against the directory, and `package-smoke` sits outside the gate.

**Poodl now holds three copies rather than one, and no gate compares any of them.**
`settings.allium`'s `Appearance` was already the worked example; `game.allium`'s
`DirectManipulation` contract and its `GameBoard` separations join it, and four config
*values* now exist in both repositories. Poodl cannot simply delete its entries either — its
own clauses cite them, and deleting them while the clauses stand draws
`allium.config.undefinedReference` and fails Poodl's `check-specs`.
[Poodl handover](../operations/poodl-handover.md) carries the item, and it is the same shape
as the existing one: a check in Poodl's gate that reads the shipped modules and asserts its
copies still state the same guarantee names and the same texts.

One open question is inherited rather than settled. Poodl's `EveryControlIsAComfortableTarget`
grants its exemption on a ten-across row; the generalised clause earns it by arithmetic
instead — a row with more controls than the figure divides into the narrowest width — but
what a nine- or thirteen-across row is owed beyond that is not claimed.

## What would reopen this

A game that genuinely cannot meet the touch target in either direction on a layout the
exemption does not describe. The exemption is written for one shape; a second shape is a
change to the clause, not a reading of it.

A fourth mark. The separations are two figures because four marks three to one apart would
need a range of 27 to one, which no palette has. A game needing a fifth colour-carried state
forces the arithmetic to be redone in this module rather than in that game.

A module here ever needing to import a game's. It cannot today and should not become able
to; if one is ever wanted, the shape rather than the checker is what has to give.

## Related pages

- [Specifications](../explanation/specifications.md)
- [Work with the specifications](../how-to/work-with-the-specs.md)
- [Accessibility](../explanation/accessibility.md)
- [Design tokens](../design/tokens.md)
- [Decision 0004: Specifications decide shared behaviour](0004-specs-are-the-source-of-truth.md)
- [Decision 0014: The hub holds the design system](0014-the-hub-holds-the-design-system.md)
- [Decision 0016: The play surface is the platform's](0016-the-play-surface-is-the-platforms.md)
- [Poodl handover](../operations/poodl-handover.md)
