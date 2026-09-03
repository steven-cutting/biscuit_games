---
title: "The Biscuit character"
kind: "explanation"
audience: [contributor, maintainer, agent]
canonical_for: [mascot_character, brand_voice]
requires: []
---

# The Biscuit character

She is a brown miniature poodle, drawn from a real dog, and she behaves as the platform's
host rather than its logo. The platform is named after her, and she is not a decoration
applied to a games site — she owns the place, and the dark room, the tight grid and the
instant response are her taste.

This page owns the character and the voice for the whole platform: the hub site here, and
every game that adopts it. [Design direction](direction.md) owns the aesthetic she lives
inside — the ground, the type, the density, the motion budget and the mark — and states
the rule this page serves: perfect, broken once, on purpose, and the break is always her.
A game does not redraw her, redefine her registers, or invent a voice of its own; it cites
this page, and anything it wants to change is changed here first.

## What exists today

Nothing of her ships. [Decision 0010](../decisions/0010-biscuit-games-design-system.md)
deferred the mascot when the design system landed: there is no illustrated pose, no
`MascotSlot`, and deliberately no placeholder where one would go, because a reserved hollow
slot is a second break. The reduced register exists only as the placeholder mark folded
into `src/lib/components/Wordmark.svelte` — the brand initial in a ruled square with one
soft corner, set in type until an illustrator draws the real one, and nothing there is yet
drawn from the dog. Everything below is the brief the first asset will be judged against,
not a description of code.
[Port a design system component](../how-to/port-a-design-system-component.md) records where
she eventually mounts.

## Two registers

A **reduced icon-mark** — favicon, tab, header, loading, and the motion-off state — and a
**fuller illustrated Biscuit** for the moments that deserve her. The reduced register does
most of the work by volume; the full one does all the work by weight.

## A fixed face, broken rarely

One face, learned by heart, and comedy that comes from what she is doing rather than from
her expression. The face breaks so seldom that the break is itself the payoff — something a
returning player notices and mentions to someone.

Rarely means rarely. A break that shows up often enough to be expected has already stopped
being one.

## Voice

Split by register, and the split is strict:

- **Anything functional is plain, warm interface copy.** In a game that is *The word was
  CRANE. Three guesses left. Copied.* On the hub it is the plainest sentence that gets
  someone to the game they came for. The interface never pretends to be a dog while
  telling a player something they need.
- **Rare moments are a dry third-person narrator, about her.** *Biscuit has stopped
  watching.* She is observed, not conversational.

She never speaks in the first person. The deadpan is the point: she behaves
disproportionately and the prose stays flat, and that contrast is what keeps the character
from reading as juvenile. Meme language, sarcasm and first-person mascot chatter are out,
and they are out everywhere the platform writes, not only where she appears.

## Where she is allowed to be

At the boundaries — opening, the end of a game, sign-off, and ambient states. She is absent
while a player is thinking and present once they have stopped, so she never competes with
the board for attention and never obscures state. The end of a game is a boundary a game
has and the hub does not; here the boundaries are the arrival, the sign-off and the ambient
states.

Per-guess reactions are a later purchase, made only once the character has proved it lands.

## When motion is off

**She reduces to the mark.** With animations disabled or reduced motion requested, only the
icon-mark and header remain.

This is a decision, not an oversight, and it has a cost worth naming: those players lose the
character reward entirely and are carried by craft alone. That is consistent with craft
being what carries a first visit anyway, and it is preferable to a half-animated compromise.
The obligations in [Accessibility](../explanation/accessibility.md) are unaffected — Biscuit
is decorative, carries no state, and never conveys a result. Nothing a player needs may
depend on her being drawn, and nothing she does may be the only announcement of an outcome.

## The first pose set

Commissioned from an illustrator. The first set is a budget as much as a wish list:

- **Outcomes** — win and loss. Two poses that have to be very good.
- **Bookends** — arrival and sign-off.
- **Ambient and stateful** — idle after a long pause, sleepier late at night, different
  after a long absence.

Explicitly excluded from the first set: per-guess reactions.

The ambient poses read a clock, and a clock is a side effect. There is no port for one in
this repository yet; when the poses arrive, the time is read through a port rather than
through a global, which is what [decision 0005](../decisions/0005-ports-and-fakes.md)
requires of any side effect that lands here.

## The character reference sheet

A character reference sheet defines her proportions, colouring, face, ears, tail and paws
before any pose is drawn, so the character cannot drift between illustrations. It is the
first thing commissioned and the thing every later pose is checked against.

She stays recognisably brown. Drifting toward cream or white is a defect, not a variation,
and it is the drift most likely to happen quietly across a set drawn over months.

## Where she does not go

Beside every button, on every game tile, inside every modal, behind the interface as
decoration, or anywhere she competes with play. The measure is whether her presence adds
personality, information or emotion. If a screen feels cute all over, the answer is fewer
character elements, not better ones.

She is also not the answer to a weak first impression. A stranger's first visit is carried
by visible craft, by the name and by the mark; a proposal that fixes a thin screen by adding
more dog is solving the wrong problem.

## Reference material

Photographs of the real dog are gathered in a separate `biscuit_pics` repository. They are
the source the reference sheet and the illustrator's brief will be drawn from, and they are
not in this repository today.

Bringing them under this handbook is open — what would come across, in what form, and under
what licensing, is not yet decided. Until it is, treat `biscuit_pics` as the reference and
this page as the rules.

## Related pages

- [Design direction](direction.md)
- [Accessibility](../explanation/accessibility.md)
- [Decision 0010: The Biscuit Games design system](../decisions/0010-biscuit-games-design-system.md)
- [Decision 0005: Side effects behind ports](../decisions/0005-ports-and-fakes.md)
