---
title: "Terminology"
kind: "project"
audience: [contributor, maintainer, operator, agent]
canonical_for: [project_terminology]
requires: []
---

# Terminology

These words mean one thing here. Some come from the specification, some from the design
direction, and the rest name the arrangement between this repository and the games it
serves. Using them loosely is how a review ends up arguing about vocabulary instead of
behaviour.

## The platform

| Term | Meaning |
| --- | --- |
| Platform | Biscuit Games: the games, the design system they share, and the decisions they hold in common. A family, not something you play. |
| Game | One playable thing on the platform. Poodl, the word game, is the only one today; Pawjong, the tile game, is intended and not yet built. |
| Game repository | Where a game's code, specifications, word lists and handbook live. Each game keeps its own. This repository is not one of them and holds no gameplay at all. |
| Hub | The static site this repository builds: one route that says what Biscuit Games is and links out to each game. It is the front door, and nothing of it is published yet. |
| Shared surface | Material this repository is authoritative for on every game's behalf — a token, a shared component, a specification surface, a decision record. Changing one changes every game, which is why what counts is enumerated in [What the hub owns](what-the-hub-owns.md) rather than assumed. Narrower than it sounds: the Allium `surface` below is one boundary in one module. |
| Token | A named value in `src/app.css`: a colour, a space, a type step, a duration, a font face. Components name tokens. They do not write the values. |
| Primitive | A shared component with no game in it. `Wordmark` is the only one that exists here; the rest are ported one at a time, and only once a second consumer asks for the same shape. |
| Consumer | Whatever takes a shared surface and uses it — a game repository, the hub's own route, a story, a test. A shape with one consumer is not shared material yet. |
| Break | The single deliberate warm exception the operating rule allows: perfect, broken once, on purpose, and the break is always Biscuit. A decision with none is cold; a decision with two is noise. See [Design direction](../design/direction.md). |

## The repository

| Term | Meaning |
| --- | --- |
| Specification | An `.allium` file under `docs/specs/`. Decides behaviour. There is exactly one today, `appearance.allium`, and it decides how everything here looks. |
| Surface | A boundary in a specification: what is exposed, what operations are provided, and what is guaranteed. |
| Guarantee | A named prose assertion on a surface. Acceptance criteria, not aspiration. |
| Port | The interface a side effect sits behind, with a real adapter and an in-memory fake beside it. A standing rule rather than a directory: nothing here reaches for a browser global yet, so `src/lib/ports/` does not exist. |
| Fake | The in-memory implementation of a port, used by tests. Not a mock: it behaves, rather than recording calls. |
| Gate | A check that can fail the build. Listed in [Quality gates](../reference/quality-gates.md). |
| Recipe | A `Justfile` target. The only supported way to run anything. |

## Related pages

- [What the hub owns](what-the-hub-owns.md)
- [Repository map](repository-map.md)
- [Specifications](../explanation/specifications.md)
