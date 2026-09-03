---
title: "Decision 0003: A static site with no backend"
kind: "decision"
audience: [maintainer, agent]
canonical_for: [decision_no_backend]
requires: []
---

# Decision 0003: A static site with no backend

*Ported from Poodl's decision 0001 at `c26cc4642afa6b1349db70a0f497203db3986599`, and restated for the platform. Poodl's own record stands where it is.*

## Context

Biscuit Games is a hub site with no accounts, no leaderboard and no shared state. It
renders one page, says what the platform is, and links out to games that are themselves
single-player and keep whatever they keep in the browser they are played in. The
conventions here arrive by way of Poodl, and Poodl's came from a full-stack template with
a Python backend, a PostgreSQL database and a generated API client. A game had no use for
that half. The hub has less.

## Decision

Build a static site. SvelteKit with `@sveltejs/adapter-static`, every route prerendered.
Drop the backend half of the template entirely: no server, no database, no API, no
generated client, and no `frontend/` subdirectory to be a sibling of something that does
not exist.

This is a platform decision rather than a hub one. A Biscuit Games game is a static site
too, and cites this record instead of arguing the shape again — the mechanism is
[Decision 0002](0002-shared-material-travels-by-citation.md).

## Consequences

A build is a directory of files. There is nothing to operate, nothing to scale, nothing to
patch between releases, and no secret to rotate. Hosting, when there is any, is free.

There is none yet. `just frontend-build` produces the directory and nothing uploads it,
because the platform's address still belongs to Poodl — see
[Decision 0012](0012-the-domain-root-stays-with-poodl.md). So the cheap-deployment
argument above is currently an argument about a deployment nobody performs, and this
repository describes no procedure for one. What the decision buys today is the absence: no
host to configure, no runtime to keep patched, and nothing that must be running for the
next person to work on the site.

Whatever a visitor keeps belongs to one browser on one device. Clearing browser data
destroys it and nothing can restore it. That is a real cost, and it is borne in the games
rather than here: the hub stores nothing at all — no statistics, no settings, nothing in
device storage — so it has nothing to lose and nothing it could offer back.

Nothing is hidden, because there is nowhere to hide anything. A static site hands its
whole self to whoever asks for it, and the hub asks nothing of a visitor and holds nothing
about one, so the question of what a client may be trusted with does not arise on this
side of the boundary. [Security model](../explanation/security-model.md) states what
remains.

Prerendering has teeth. Module-scope work runs once, at build time, in Node — so anything
per-visitor must happen in the browser after hydration, and a route that cannot be
rendered at build time fails the build rather than shipping. With one route and no state,
nothing here tests that rule; the first contributor to add a preference or a device query
will meet it, and should expect to.

## What would reopen this

Anything requiring shared state between people: accounts, a leaderboard spanning games, a
synchronised daily anything, or statistics that follow a player between devices. Each of
those needs a server, and none is in scope — see
[Purpose and scope](../project/purpose-and-scope.md).

Publishing does not reopen it. Adopting an address is decision 0012's business, and a
static site served from a real host is the same static site.

## Related pages

- [Architecture](../explanation/architecture.md)
- [Security model](../explanation/security-model.md)
- [Purpose and scope](../project/purpose-and-scope.md)
- [Decision 0011: A skeleton, not a second application](0011-skeleton-not-a-second-application.md)
- [Decision 0012: The domain root stays with Poodl](0012-the-domain-root-stays-with-poodl.md)
