---
title: "Purpose and scope"
kind: "project"
audience: [user, contributor, maintainer, agent]
canonical_for: [project_purpose, project_non_goals]
requires: []
---

# Purpose and scope

Biscuit Games is a platform for small, exacting games that run in the browser. This
repository is two things at once: the platform's hub site — the front door, a page that
says what Biscuit Games is and links out to each game — and the authoritative source of
truth for everything those games share.

It runs entirely in the browser as a static site. There is no server, no account and no
database, and the hub needs one even less than a game does: it renders a page and points
away from itself. See [Decision 0003](../decisions/0003-static-site-no-backend.md).

Poodl, an unlimited-play word game, is the only game today. It lives in its own
repository, is published at its own address, and is linked from here. Pawjong, a tile
game, is intended and not yet built.

## What it does

- **The front door.** One route, one page: the wordmark, a sentence about what Biscuit
  Games is, and the list of games. The list has one entry.
- **The design system.** `src/app.css` carries the whole token vocabulary — colour, type,
  scale, spacing, motion — together with the two committed variable fonts. A game does
  not invent its own; it inherits this one.
- **The Biscuit character.** Her look, her registers and her voice are settled here, once,
  rather than drifting apart in each game that uses her.
- **Shared components.** One today: `Wordmark`, with its test and its story. A component
  earns a place here by being wanted in more than one game, not by being written well.
- **The shared specification.** `docs/specs/` holds one Allium module,
  `appearance.allium`, which decides how theme, contrast and motion behave across the
  platform.
- **The cross-cutting decisions.** Every choice a game inherits is written down in
  [Architecture decisions](../decisions/README.md), so that a game can cite one instead of
  arguing it again.

The behaviour the games share — today, appearance — is specified in `docs/specs/`, not
here. See [Specifications](../explanation/specifications.md). Where the boundary between
this repository and a game actually falls is drawn in
[What the hub owns](what-the-hub-owns.md).

## What it deliberately does not do

- **It is not a game.** Nothing here is playable. There are no word lists, no board, no
  scoring, no statistics, no sharing and no settings panel. The front end is a deliberate
  skeleton — one route, one component — because the design system it owns is the thing
  worth having.
  See [Decision 0011](../decisions/0011-skeleton-not-a-second-application.md).
- **It hosts no game code.** A game's rules, its state and its screens stay in the game's
  own repository. The hub links to a game; it never contains one, and the games do not
  become one application by sharing a home for their vocabulary.
- **It has no address.** Nothing in this repository is published. There is no deployment
  workflow, and the domain root the platform will eventually want still belongs to Poodl.
  The cost is plain: a visitor cannot reach the hub today, and the front door exists only
  on a developer's machine.
  See [Decision 0012](../decisions/0012-the-domain-root-stays-with-poodl.md).
- **It collects nothing.** No accounts, no analytics, no telemetry, nothing stored and
  nothing sent. See [Security model](../explanation/security-model.md).
- **It distributes nothing as a package.** There is no npm package to install and no
  shared runtime to import. Shared material travels by citation: a game copies what it
  needs and names the source, and this repository stays the copy that decides.
  See [Decision 0002](../decisions/0002-shared-material-travels-by-citation.md).

## Who it is for

Two readers, in this order. First, whoever is building or maintaining a Biscuit Games
game and needs to know what the platform has already decided for them. Second, a visitor
looking for the games, once there is somewhere to send them. Everything else follows from
that.

## Related pages

- [What the hub owns](what-the-hub-owns.md)
- [Repository map](repository-map.md)
- [Terminology](terminology.md)
- [Architecture](../explanation/architecture.md)
