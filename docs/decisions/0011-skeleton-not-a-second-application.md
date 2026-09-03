---
title: "Decision 0011: A skeleton, not a second application"
kind: "decision"
audience: [contributor, maintainer, agent]
canonical_for: [decision_hub_skeleton]
requires: []
---

# Decision 0011: A skeleton, not a second application

## Context

The whole SvelteKit toolchain came over from Poodl. The gate runs in order and snapshots
the worktree; the component workshop builds and every story is rendered in real Chromium
with axe over it; Chromatic takes the snapshots; Vitest runs in jsdom behind a 90%
coverage floor; the two document validators check the frontmatter and the links; the
Allium checker and analyser read `docs/specs/`. All of it works, and all of it was
adopted before there was anything here to guard.

The application did not come over. `src/` holds `src/app.css`, `src/app.html`,
`src/app.d.ts`, one route — `+layout.svelte`, `+layout.ts` and a single `+page.svelte`
front door — and exactly one component, `src/lib/components/Wordmark.svelte`, with
`tests/wordmark.test.ts` beside it and `stories/Wordmark.stories.svelte` in the workshop.
There is no domain, there are no ports, and there is nothing to play.

That reads as unfinished work rather than as a choice, and unfinished work invites two
opposite repairs. Someone fills the skeleton in, porting board and keyboard components
the hub has no use for. Or someone looks at a gate guarding one component and starts
removing the machinery to make the ratio look sensible. Both are wrong, so the shape is
recorded here as a decision rather than left to be inferred from an empty directory.

## Decision

Ship the toolchain in full and the application as a skeleton.

`src/app.css` is the artefact that matters. It carries the whole token vocabulary — the
palette, the semantic names, the type, space, form and motion scales — and the two
committed typefaces with their provenance and their licence texts. That file is what the
games cite, and it is the reason this repository exists as code rather than as prose.
[Design tokens](../design/tokens.md) is its reference page.

`Wordmark` exists to prove the loop runs end to end. It is a component, with a test that
queries it by accessible text, a story that pins its states, axe over that render in
Chromium, and the coverage floor met by the jsdom suite alone. Every stage of the gate has
something real to hold, so a stage that has quietly stopped working fails now rather than
on the day the first component that matters arrives.

Components are added when the hub site itself needs one, or when a second consumer
appears and the shared shape has to live somewhere neither game owns. Never speculatively.
A component built here for a game that does not exist is a guess with a test around it,
and [Shared material travels by citation](0002-shared-material-travels-by-citation.md)
says where a shape belongs until a second consumer forces it out.

## Consequences

**The gate is heavier than the code it guards, and that is accepted.** The gate is the
thing being established. A gate adopted after the code exists is a gate that gets
negotiated with — every rule meets a file that predates it and an argument for an
exemption — whereas a gate that is already running when the first real component lands is
just the cost of landing it. [Quality gates](../reference/quality-gates.md) lists what
runs; the ratio of checks to source files here is the point rather than an embarrassment.

**The 90% coverage floor is trivially met today and kept anyway.** One component with one
test clears it without effort, which is exactly why it stays: the first component that
matters cannot land untested, because the floor was never lowered to suit the empty
period. The rule that follows from it is blunt. Nothing may land as a `.ts` or `.svelte`
file under `src/lib/` without a test in the same change — an untested file inside the
coverage glob is reported at zero, drags the whole figure below the threshold, and sinks
the run. That is a feature, and it is the reason the floor is not a formality.

**The suite table in [Testing](../reference/testing.md) is nearly empty, and says so.**
There is one unit test and one story. The conventions on that page — query by accessible
role and name, inject fakes rather than stub globals, a component lands with its test and
its story together — are inherited rules waiting for material, not descriptions of a body
of tests. The page states which it is, because a reference page that reads as a survey of
existing work when it is really a standing instruction misleads the next contributor about
what they will find.

**One route means nothing here exercises routing, layout or state.** The layout files
exist and render, but there is no navigation, no persisted preference, no store and no
side effect, so the ports rule in
[Side effects behind ports](0005-ports-and-fakes.md) governs a directory that does not
exist yet. The first real interaction in this repository will be the first test of several
conventions at once, and it should be expected to find something.

**The design system's only full implementation is in Poodl.** The hub owns a system it
cannot demonstrate: the tokens are here, the components that spend them are there, and
nothing in this repository recomputes the contrast figures the stylesheet's comments
quote — those are inherited from Poodl, where a test measured them, and no gate here
measures anything. The ledger in
[Port a design system component](../how-to/port-a-design-system-component.md) is the
honest record of that gap, naming what exists as a reference component and what has been
brought across. Read that page as the inventory this decision leaves outstanding.

## What would reopen this

The hub site growing past a single index page — a game list that filters, a page per game,
anything with a second route — at which point the skeleton is carrying an application and
should be described as one.

A second game, which is the real trigger. It forces the play-surface primitives out of
Poodl and into shared components here, because a shape two games render cannot keep living
in one of them; [The Biscuit Games design system](0010-biscuit-games-design-system.md)
already names that as the test its "same instrument, different attachment" claim has not
yet had.

Or the skeleton failing at its one job: the gate going green over a stage that no longer
holds anything, or a stage rotting unnoticed because `Wordmark` is too simple to exercise
it. The answer to that is a second component chosen to reach what the first does not — not
a smaller gate.

## Related pages

- [Repository map](../project/repository-map.md)
- [Testing](../reference/testing.md)
- [Quality gates](../reference/quality-gates.md)
- [Port a design system component](../how-to/port-a-design-system-component.md)
- [Decision 0008: A component workshop](0008-component-workshop.md)
- [Decision 0010: The Biscuit Games design system](0010-biscuit-games-design-system.md)
- [Decision 0012: The domain root stays with Poodl](0012-the-domain-root-stays-with-poodl.md)
