---
title: "What the hub owns"
kind: "project"
audience: [contributor, maintainer, agent]
canonical_for: [platform_ownership, repository_boundaries]
requires: []
---

# What the hub owns

Two repositories that share a look, a mascot and a set of rules will drift unless exactly
one of them decides. This one decides. Biscuit Games is the source of truth for everything
every Biscuit Games repository shares — [decision 0001](../decisions/0001-biscuit-games-is-the-source-of-truth.md)
— and this page is the boundary: what is settled here, what a game settles for itself, and
the question to ask when a new fact does not obviously belong to either.

Poodl is the only game today; Pawjong is intended and not yet built. The boundary is drawn
now, while there is one consumer, because drawing it before a second game exists is far
cheaper than negotiating it afterwards with two games already disagreeing.

## What lives here

An owning page is the single place a subject is decided. Every other page — here or in a
game — cites it rather than restating it, and a page that restates it is the bug.

| Subject | Owning page |
| --- | --- |
| The platform's aesthetic | [Design direction](../design/direction.md) |
| Biscuit, and how she is used | [The Biscuit character](../design/character.md) |
| The token vocabulary | [Design tokens](../design/tokens.md), carried by `src/app.css` |
| Shared components | [Port a design system component](../how-to/port-a-design-system-component.md) |
| Shared behaviour | [`appearance.allium`](../specs/appearance.allium) |
| The naming of the platform and its games | [Design direction](../design/direction.md) |
| Platform decisions | [Architecture decisions](../decisions/README.md) |
| The design research | [Design resource index](../design/resource-index.md) and [Mobile and game design research](../design/research-report.md) |

The site itself is deliberately small. `src/` is a skeleton — one route, one component,
one stylesheet — because this repository is the source of truth first and a hub site
second; that is [decision 0011](../decisions/0011-skeleton-not-a-second-application.md).
Owning a subject is not the same as implementing it, and most of what this repository owns
it owns as prose, tokens and a specification rather than as code.

## What lives in a game repository

- **Its own rules, and the specifications that decide them.** Guessing, marking and hard
  mode are Poodl's; tiles and matches will be Pawjong's. `docs/specs/` here holds one
  module, and it imports nothing precisely so that a game can take appearance as given
  rather than restate it.
- **Its play-surface primitives.** A board, a tile, a rack, an on-screen keyboard, a
  result mark. Anything whose shape only means something inside one game is that game's,
  however carefully it is built.
- **Its data.** Word lists, tile sets, puzzle sources — whatever the game draws from. None
  of it is shared material, and none of it belongs here.
- **Its address and its deployment.** Where a game is served from, the workflow that
  publishes it, and the base path it is built against. Today that includes the domain
  root: it stays with Poodl, per
  [decision 0012](../decisions/0012-the-domain-root-stays-with-poodl.md). This repository
  has a package and a workshop, not a site, and it has no site deployment procedure to
  describe.

## The test

> **Would a second game need this, unchanged?**

Yes, and it belongs here. No, and it belongs in the game that has it. The word *unchanged*
carries the weight: if a second game would need the fact only after bending it, that is two
facts with a family resemblance, not one shared fact, and moving the first one here buys a
false agreement that the second will have to break.

The corollary matters more, because it is the one that gets ignored. A game-specific fact
does not become a platform fact by being written down here. **The hub is not where things
go when nobody knows where they go.** An unplaced fact stays in the repository that has it
until a second game actually asks for it; at that point it moves, with a decision record if
it changes what the platform promises.

That direction of travel is not free either. A fact kept here has to survive being read by
a repository nobody has written yet, which makes it slower and more expensive to change
than the same fact kept in one game. Promoting something early costs exactly that, and buys
nothing until the second consumer exists.

## How a fact reaches a game

Two ways, and the split is the point. A file travels as a package; a page travels as a
citation. That is
[decision 0013](../decisions/0013-shared-material-travels-as-a-package.md).

The tokens stylesheet, the shared components, the typefaces and `appearance.allium` travel in
`@steven-cutting/biscuit-games`. A game installs an exact version, and a change here reaches
it as a version bump it can see, take or refuse.
[Published artefacts](../reference/published-artefacts.md) says what is in the package and
what a major, a minor and a patch each mean.

Everything else is still a citation. A page path, a heading anchor, a `canonical_for` topic
slug and the prose of a `@guarantee` cross the boundary as text a reader follows, and no
package carries them. This handbook is published to no registry and vendored into no game.

The costs are real and worth stating plainly. The registry authenticates every read, so a
contributor without a token cannot install at all. A game's build can now fail because of
something that happened here, which it could not before. And a figure quoted in this
handbook is an inherited claim rather than a measurement — `tests/contrast.test.ts` has not
been ported, so nothing in this repository recomputes a contrast ratio. A game that renders
a colour proves it where the test actually runs.

What the arrangement buys is a name for drift. A stylesheet that has moved on is a version
number in a lockfile rather than a difference nobody can see.

## What is not settled

- **Whether the handbook ever travels with the package.** The files ship; the pages do not.
  A page path is still a citation nothing resolves, and shipping Markdown into
  `node_modules` would trade a rotting link for a stale copy. Not yet decided, and the
  answer probably depends on whether a second game reads these pages as often as Poodl
  does.
- **Who serves the domain root.** Decision 0012 leaves it with Poodl and leaves this
  repository's site unpublished. When the hub does become the front door, the address, the
  redirects and the order of the two changes all have to be settled — see
  [Poodl handover](../operations/poodl-handover.md).
- **Whether a game may ever fork a token.** Deliberately open. Today a game copies a token
  or does without one, and there is no sanctioned way to say "the platform's value, except
  here". The first game that needs one will force the answer.

## Related pages

- [Purpose and scope](purpose-and-scope.md)
- [Repository map](repository-map.md)
- [Architecture decisions](../decisions/README.md)
- [Specifications](../explanation/specifications.md)
- [Design direction](../design/direction.md)
