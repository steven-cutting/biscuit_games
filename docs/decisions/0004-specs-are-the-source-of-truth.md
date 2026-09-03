---
title: "Decision 0004: Specifications decide shared behaviour"
kind: "decision"
audience: [contributor, maintainer, agent]
canonical_for: [decision_spec_first]
requires: []
---

# Decision 0004: Specifications decide shared behaviour

*Ported from Poodl's decision 0003 at `c26cc4642afa6b1349db70a0f497203db3986599`, and restated for the platform. Poodl's own record stands where it is.*

## Context

A guarantee that two repositories must both satisfy cannot live in prose in one of them.
The hub decides what a theme means; a game is what renders one. A paragraph in this
handbook describing how appearance behaves reads, from the far side, as a description of
how the hub happens to work — informative, and impossible to fail.

Shared behaviour is therefore written in Allium before any code depends on it. Today that
is one module, `docs/specs/appearance.allium`: theme, high contrast and animations, the
device preference each negotiates with, and the legibility the result has to reach. It
imports nothing and nothing imports it — a root module, self-contained on purpose, so a
game inherits the surface below rather than restating it. The question was whether it
remains authoritative once implementation starts, here or downstream, or becomes a design
document that quietly falls behind.

## Decision

The specifications are the source of truth for shared behaviour. `AGENTS.md` states the
split: when deciding *what* a shared surface should do, the specifications win; when
deciding *how* to build it, `AGENTS.md` wins.

In practice: behaviour changes in the specification first, then in the tests, then in the
code. No rule, guard or threshold the specifications state is re-decided in code — not
here, and not in a game that consumes it. A test is never weakened to make it pass; the
specification is corrected and the tests are re-derived.

Where a game restates one of these guarantees, the module here is the original and the
game's wording is the copy. The specification is the arbiter: when the two disagree, the
game is wrong rather than different.

## Consequences

Contracts become testable obligations rather than intentions. `surface Appearance` names
six of them, each with a name of its own — `ReducedMotionOverridesTheAnimationSetting`,
`EveryCombinationMeetsTheLegibilityFloor`, and the rest — and that name is what a test in
another repository cites and what a review here asks a change to point at. The
specification is quoted, never paraphrased, because paraphrase is where the meaning goes.

Unresolved product decisions stay visible. They are recorded as `open question` blocks and
answered by someone entitled to answer them rather than by whoever writes the code first.
One stands open: whether a reader may turn high contrast off while the device is asking
for more of it.

The costs are real. Every behaviour change is two edits, not one — and across the boundary
it is two pull requests in two repositories, with a gap between them during which both are
self-consistent and only one is correct.

The checking is uneven, and the weak half is the half that matters. `allium` is installed
and pinned here ([decision 0007](0007-project-managed-allium-cli.md)); `just check-specs`
and `just analyse-specs` are gates, and both report empty diagnostics and empty findings.
That proves the module parses and analyses clean. It proves nothing about whether anything
obeys it. Nothing in this repository recomputes a contrast ratio —
`tests/contrast.test.ts` was not ported — so `EveryCombinationMeetsTheLegibilityFloor` is
an obligation stated rather than an obligation measured, and the figures quoted around it
in this handbook are inherited claims, not measurements. No gate here can see a game
repository at all, so downstream conformance is enforced by attention alone.

## What would reopen this

If the specification stopped being maintained — if a shared behaviour changed in code,
here or downstream, without a matching edit and nobody noticed — the honest response would
be to distil it back from the implementation and restart, or to abandon the approach
outright rather than keep a document that lies.

## Related pages

- [Specifications](../explanation/specifications.md)
- [Work with the specifications](../how-to/work-with-the-specs.md)
- [Decision 0001: Biscuit Games is the platform's source of truth](0001-biscuit-games-is-the-source-of-truth.md)
- [Decision 0007: A project-managed Allium binary](0007-project-managed-allium-cli.md)
