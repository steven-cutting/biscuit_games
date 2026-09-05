---
title: "Decision 0001: Biscuit Games is the platform's source of truth"
kind: "decision"
audience: [contributor, maintainer, agent]
canonical_for: [decision_platform_source_of_truth]
requires: []
---

# Decision 0001: Biscuit Games is the platform's source of truth

## Context

Everything the platform holds in common — the aesthetic charter, the Biscuit character,
the token vocabulary, the design research behind it, the accessibility floors — was
written inside Poodl. Not by preference: Poodl was the only repository there was, so the
only place a platform-level decision could be recorded was a game's `docs/`.

Poodl's own decision 0009 named the shape of the problem while accepting it:

> The repository now owns an address larger than itself. Poodl is one game and
> `pnut.fans` is a platform's front door, so a change to the front door is a change to the
> game's repository, its gate and its review. That is the wrong shape the moment there is
> anything else behind the door.

The documentation drifted the same way the address did. Poodl's design direction page says
outright that it is "the owning page for the platform's aesthetic" — a claim about the
platform, made from inside one game, in a handbook whose neighbouring pages are about
scoring a guess against an answer.

The documentation contract cannot help with that. It enforces exactly one owner per topic
*within a repository*: `canonical_for` is checked across one tree, by one validator,
reading one worktree. Two repositories both claiming `design_direction` is not a state it
can observe, let alone reject.

## Decision

This repository is the platform's source of truth. What Biscuit Games games hold in common
is decided here, and a game cites it rather than restating it.

[What the hub owns](../project/what-the-hub-owns.md) is the boundary, and it is itself an
owned page. The ownership question has a canonical answer with a topic and a single home,
which is the only reason the boundary can be appealed to rather than argued about each
time it matters.

Shared behaviour is specified in Allium under `docs/specs/`, and `appearance.allium` is
the first such surface: theme, high contrast and animation, the device preferences they
answer to, and the contrast floors every combination has to meet.

A game decides its own rules, its own play surface and its own address — the domain root
is Poodl's for now, which is [decision 0012](0012-the-domain-root-stays-with-poodl.md). For
everything else — how it looks, how it sounds, what a token means, where the accessibility
floor sits, how a shared surface behaves — it answers to what is decided here.

Poodl's copies keep working until the handover is done. Nothing is deleted from Poodl by
this decision; the copies simply stop being authoritative. Where the two disagree during
that window, this repository is right, and the disagreement is a fault to be recorded
against Poodl rather than a question to be reopened.

## Consequences

**Two repositories now have to agree, and no gate can make them.** Every validator here
reads this worktree: `just check-docs` sees these pages, `just check-specs` and
`just analyse-specs` see this `docs/specs/`. None of them can see Poodl, and none of
Poodl's can see this. Authority asserted across a boundary that nothing mechanical crosses
is enforced by attention alone.

**The mechanism is documentary.** [Poodl handover](../operations/poodl-handover.md) is the
ledger of what has moved and what still has to; the `consumer-impact` skill is the question
a change here has to answer before it lands — what does this break in a repository that
consumes it. Both are procedures a person or an agent follows. Neither fails a build.

**The weakest joint is `appearance.allium`.** Poodl's `settings.allium` carries a
`surface Appearance` with the same six guarantees, and nothing anywhere compares the two
files. They can diverge silently, in either direction, and the first symptom would be two
games disagreeing about what turning high contrast on means. Naming that is not fixing it.

**A change to a shared surface becomes two pull requests** — one here, where it is decided,
and one in the game, where it takes effect — with an unbounded gap between them during
which both repositories are self-consistent and only one is correct.

**The hub owns a design system, and now holds it.** When this was decided `src/` was a
skeleton on purpose ([decision 0011](0011-skeleton-not-a-second-application.md)): one
route, one component, and a token vocabulary in `src/app.css` that this repository mostly
did not render, so ownership meant the vocabulary and the reasoning behind it.
[Decision 0013](0013-shared-material-travels-as-a-package.md) made it a library a game
installs, and [decision 0014](0014-the-hub-holds-the-design-system.md) put the
implementation here — the platform primitives, the icons, the contrast test and the port —
so the hub is authoritative over material it holds rather than material a game renders on
its behalf. The route still mounts almost none of it.

**The platform now has a record that outlives any one game.** A decision written here
survives Poodl being rewritten, retired or replaced. That is the return on every cost
above, and it is the only one.

## What would reopen this

The platform shrinking back to one game. If Pawjong is never built and Poodl is all there
ever is, this boundary has nobody on the other side of it and is machinery with nothing to
carry; folding the material back into the game it serves would be the honest response.

The drift becoming real. If a shared value changes here and no game follows — a token
renamed, a floor raised, a guarantee added, and nothing downstream moves — then the claim
of authority is decorative. The answer then is to build the distribution mechanism
[decision 0002](0002-shared-material-travels-by-citation.md) declined, not to keep
asserting an ownership that nothing acts on.

## Related pages

- [What the hub owns](../project/what-the-hub-owns.md)
- [Poodl handover](../operations/poodl-handover.md)
- [Specifications](../explanation/specifications.md)
- [Decision 0002: Shared material travels by citation](0002-shared-material-travels-by-citation.md)
- [Decision 0004: Specifications decide shared behaviour](0004-specs-are-the-source-of-truth.md)
- [Decision 0011: A skeleton, not a second application](0011-skeleton-not-a-second-application.md)
