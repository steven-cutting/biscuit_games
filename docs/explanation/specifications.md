---
title: "Specifications"
kind: "explanation"
audience: [contributor, maintainer, agent]
canonical_for: [specification_model]
requires: []
---

# Specifications

Shared behaviour is written down, in a formal language, before it is built. The Allium
module under `docs/specs/` is the source of truth for what every Biscuit Games surface
owes the reader, whichever game is in front of them. This handbook, `src/app.css` and
every game wearing the design system all answer to it.

The procedure is in [Work with the specifications](../how-to/work-with-the-specs.md).
This page is why.

## What a specification is for

A rule this repository owns is a rule two repositories have to agree about. The hub
decides what a theme means; a game is what renders one. Neither half is complete on its
own, and neither can read the other's mind.

Prose cannot hold that. A paragraph in this handbook describing how appearance behaves
reads, from the far side, as a description of how the hub happens to work — informative,
and impossible to fail. Because Allium has no cross-repository import — and shipping the
module inside the package
([decision 0013](../decisions/0013-shared-material-travels-as-a-package.md)) does not give it
one — the consumer is the only party that can prove its copy, and a proof needs an obligation stated
precisely enough to be false. A named guarantee is that statement:

> Animations run only when the animations setting is on and the device expresses no
> reduced-motion preference. The device preference wins: a reader who asked their system
> for less motion gets none from Biscuit Games, whatever the setting says.

That names the winner, so a game resolving it the other way is wrong rather than
different. It also has a name of its own —
`ReducedMotionOverridesTheAnimationSetting` — which is what a test in another repository
cites, and what a review here asks a change to point at. The specification is quoted, not
paraphrased, because paraphrase is where the meaning goes.

That the specifications win on *what*, and `AGENTS.md` wins on *how*, is
[decision 0004](../decisions/0004-specs-are-the-source-of-truth.md).

## What the modules are

Three, and they are peers rather than layers. Each covers one aspect of the same surfaces,
none imports another, and a game inherits all three whole rather than entering a hierarchy
at the top.

### `appearance.allium` — how a surface looks

Theme, high contrast and animations, how each negotiates with a preference the operating
system has already expressed, and the legibility the result has to reach.

- A `given` block naming the three device preferences as booleans —
  `prefers_dark_colour_scheme`, `prefers_reduced_motion` and `prefers_more_contrast`.
  Biscuit Games reads them and never writes them. They are named one at a time rather
  than gathered behind an external entity because a root module has no governing
  specification for such an entity to have come from, and the checker says so.
- `enum ThemeChoice`, holding `system`, `light` and `dark`.
- `entity AppearanceSettings`: `theme`, `high_contrast`, `animations`, and the derived
  `high_contrast_active`, which keeps what the reader answered apart from what actually
  applies.
- A `config` block stating `minimum_text_contrast = 4.5` and
  `minimum_boundary_contrast = 3.0` — the two WCAG 2.2 AA bars, as ratios naming no
  colour.
- One `default AppearanceSettings appearance_settings`, existing from the first visit,
  with theme starting at dark rather than at system.
- `surface Appearance`, exposing `dark_active`, `animations_active` and
  `high_contrast_active`, with six guarantees:
  `SystemFollowsTheDeviceAsItChanges`, `ReducedMotionOverridesTheAnimationSetting`,
  `MoreContrastFromTheDeviceTurnsHighContrastOn`, `AppearanceNeverCarriesMeaningAlone`,
  `EveryCombinationMeetsTheLegibilityFloor` and `AnUnavailableControlIsExempt`.

### `operation.allium` — how a surface is worked

Keyboard operability of every operation a surface provides, focus and what a surface owes
when it replaces the control a reader is standing on, what a dialog owes, what a field owes,
the comfortable touch target, the narrowest supported width and the floor under a field's own
text, the `DirectManipulation` contract a finger is owed, and what a surface owes when it
claims bare key presses for itself.

The `Fields` surface is the newest of the four and
[decision 0017](../decisions/0017-the-rest-of-the-design-system-is-ported.md) is why: a name
bound to the control rather than beside it, the control's own words bound to it too, a
refusal reported and not only inked, a group of exclusive choices that is one stop with the
arrows moving inside it, and text large enough that reaching the field does not magnify the
page. It says what a control owes to being worked and never which controls a surface has —
that stays excluded, here and in `appearance.allium`, because a settings panel belongs to the
product that owns it.

### `play-surfaces.allium` — what a surface played on owes

The four marks a play cell wears, the non-colour indication each carries, the game's words
for each, and the two separations the marks sit at. It owns one cell and says nothing about
how cells are arranged: a board, a grid and a rack are a game's.

None of the three imports anything, and that is the point rather than an accident of being
first. A root module is one a game can inherit whole instead of restating, so the dependency
runs one way: a game's own modules may import one of these, and nothing here will ever
import a
game's.

`just check-specs` and `just analyse-specs` both report an empty `diagnostics` array and
an empty `findings` array, and no waiver stands in the module. Both recipes read
structure. Neither renders anything; `tests/contrast.test.ts` does, and measures 4.5 and
3.0 over every pair the stylesheet declares in all four combinations, so the floors are
figures the hub states and the hub's own gate proves. A game's own pairs are proved in the
game.

## Open questions are a feature

An `open question` block records a product decision nobody has made yet. They are
recorded rather than resolved on purpose: an unwritten gap gets filled in by whoever
writes the code first, silently and invisibly, while a written one has to be answered by
someone entitled to answer it.

Four are outstanding, across all three modules. `appearance.allium` asks whether a reader
may turn high contrast off while the device asks for more; `operation.allium` asks whether
the platform owes a way to stop a surface claiming bare keys, or only that dropping the claim
costs nothing; and `play-surfaces.allium` asks what a game owes whose play needs a fourth
mark, and whether a game may state a separation of its own in place of one stated here.

The contrast one is the worked example. That the device wins is settled, and matches how
reduced motion already behaves; what is not settled is whether it is the last word. A reader
who asked their system for more contrast but wants this palette left alone has nowhere to say
so, because the setting they would reach for is the one the device is already overriding.
Nobody has decided that, so the module says nobody has decided it — rather than letting
whichever repository draws a settings panel first decide it by building one.

That is not hypothetical any more. Decision 0017 ported `Switch`, `SegmentedControl` and
`SettingsRow`, which are the controls such a panel would be built from, and deliberately
wired none of them to a setting: the components exist and the panel does not, precisely so
that shipping the shapes did not answer the question. Four outstanding questions across three
young modules is a normal state, not a defect, and an empty count would not be a reason to
stop using the construct. A change that reaches a decision nobody has taken should add
another rather than guess.

## What a specification is not

It is not a design document, and it does not choose a language, a framework, a storage
mechanism or a layout. `appearance.allium` states how far apart two things must be and
never what either one is; `src/app.css` is what answers that. It states what the three
settings mean and never where the switches live, how they are guarded or how they are
stored — a settings panel belongs to the product that owns it, and there is no settings
panel here. How is this repository's business; `AGENTS.md` decides that.

Nor is it a claim about what exists. The hub's route carries no settings and mounts none of
the components it holds, so some of what the module states has nothing on the page to
implement; its three derivations and the port that feeds them are in `src/lib/`, which is
[decision 0014](../decisions/0014-the-hub-holds-the-design-system.md). A guarantee is an
obligation on anything that renders a Biscuit Games surface, whenever and wherever it comes
to be rendered.

## Related pages

- [Work with the specifications](../how-to/work-with-the-specs.md)
- [What the hub owns](../project/what-the-hub-owns.md)
- [Accessibility](accessibility.md)
- [Terminology](../project/terminology.md)
- [Decision 0004](../decisions/0004-specs-are-the-source-of-truth.md)
