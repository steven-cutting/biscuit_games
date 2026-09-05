---
title: "Architecture"
kind: "explanation"
audience: [contributor, maintainer, operator, agent]
canonical_for: [system_architecture]
requires: []
---

# Architecture

Biscuit Games is a static site. The build produces a directory of files; a host serves them
unchanged; everything after that happens in the browser. There is no request the
application can make to itself, no session, and no origin it trusts.

That constraint is not a limitation working around a missing backend — it is the
architecture, and the hub needs it even less than a game does: it renders one page and
points away from itself. See
[Decision 0003](../decisions/0003-static-site-no-backend.md).

Today there is no host either. `just frontend-build` produces the directory and nothing
uploads it, because the domain root still belongs to Poodl. Everything below describes a
build rather than a deployment, and this repository has no deployment procedure to
describe; see [Decision 0012](../decisions/0012-the-domain-root-stays-with-poodl.md).

## Build

SvelteKit with `@sveltejs/adapter-static`, prerendering every route. `+layout.ts` sets
`prerender = true` for the whole tree, so a route that could not be rendered at build time
fails the build rather than shipping broken. `ssr` is on and `trailingSlash` is `always`,
so each route becomes a directory with an `index.html` inside it — the shape a plain file
host serves without being configured.

Prerendering has one consequence worth stating plainly: **module-scope work runs once, at
build time, in Node.** Anything that must differ per visitor — reading a stored preference,
asking the device a question, looking at the clock — has to happen in the browser after
hydration, not while the page is being generated. The one thing here that asks the device
a question is the preferences port, and it answers for the device's absence at build time
itself — the side-effects section below.

The build is portable across base paths. SvelteKit emits relative asset URLs, and
`paths.base` is read from `BASE_PATH` at build time. Nothing sets `BASE_PATH` in this
repository, and the hook is kept deliberately rather than left unfinished: adopting an
address later is then a workflow change rather than a config change. `svelte.config.js`
says so where a reader will find it, and [Configuration](../reference/configuration.md)
records it.

## Runtime shape

```text
routes/           assembles the page, and is the only place a store would be built
  ├── components/ renders and handles interaction
  ├── domain/     derives appearance from settings and device; pure
  └── ports/      reads the device's preferences, behind an interface with a fake
```

Four layers, and on the route one file in each of the top two that matters.
`+layout.svelte` imports `src/app.css`, which is what puts every route inside the same
palette — see [Design tokens](../design/tokens.md) — and renders its children.
`+page.svelte` composes `Wordmark` with a sentence about the platform and the list of games,
and that is the whole page. The six platform primitives, the icon set, the derivations and
the port are held for the games and shown in the workshop; the route calls none of them
yet.

There is no `src/lib/app/`. The hub holds no rules to reduce and no state that outlives a
render, so that directory has nothing to hold. `src/lib/domain/` and `src/lib/ports/` do
exist — the three appearance derivations, and the port that reads the device — and nothing
on the route calls either yet; the direction of the full stack governs all of it, and it is
described in [Layering and dependency direction](layering.md). One route is the intended
shape of the site rather than an unfinished one, for the reasons in
[Decision 0011](../decisions/0011-skeleton-not-a-second-application.md) that
[Decision 0014](../decisions/0014-the-hub-holds-the-design-system.md) left standing.

## State

There is none. The hub keeps nothing about a visitor: no statistics, no settings, no game
in progress, nothing in device storage and nothing carried in a URL. Clearing browser data
loses nothing, because there was nothing there to lose.

The one piece of state the site has is stated rather than held. `src/app.html` carries
`data-theme="dark"` and `data-animations="on"` on the root element — the default record
from `appearance.allium`, written into the markup so the prerendered page paints the
platform default with no store to hydrate first. It never changes afterwards: the hub ships
no settings control, so the `system` branch of the Appearance surface's `dark_active` is
unreachable on the page today — `darkActive` in `src/lib/domain/appearance.ts` implements
it, and its test reaches it, but nothing on the route calls it. See
[Specifications](specifications.md).

## Side effects

One thing reaches outside the page: `src/lib/ports/preferences.ts` reads the device's
colour-scheme, reduced-motion and more-contrast preferences through `matchMedia`, and
watches them. No storage, no clock, no randomness, no clipboard and no network call, so
that is the whole of `src/lib/ports/`.

The rule that governs the first effect to arrive is in force regardless. It sits behind a
port: an interface in the application's vocabulary, a real adapter taking its platform
object as a defaulted argument rather than reading a global, and an in-memory fake that
tests inject. The reasoning is in
[Decision 0005](../decisions/0005-ports-and-fakes.md). The preferences port is that shape
exactly, with one refinement the record carries a mark for: the adapter takes the host
object rather than the `matchMedia` function, so a test reaches the absent-`matchMedia` arm
by passing `{}` and stubs nothing. The route does not call it yet; it will the moment the
hub honours the `system` theme instead of stating a default.

## What is not here

No API, no database, no authentication, no background jobs, no telemetry. Those are not
deferred; they are out of scope, as
[Purpose and scope](../project/purpose-and-scope.md) records.

No game either. Rules, boards, word lists and scores belong to the repository that plays
them; the hub links to a game and never contains one. Where that boundary falls is drawn in
[What the hub owns](../project/what-the-hub-owns.md).

And no site deployment. There is no Pages workflow, no `site-root/` and no staging script
here, and the recipes `stage` and `stage-preview` do not exist. What is served at the
platform's address is Poodl's, and stays Poodl's until decision 0012 is reopened. What does
leave is the package and the workshop, and neither is the site — see
[Published artefacts](../reference/published-artefacts.md).

## Related pages

- [Layering and dependency direction](layering.md)
- [Security model](security-model.md)
- [Repository map](../project/repository-map.md)
- [Decision 0011: A skeleton, not a second application](../decisions/0011-skeleton-not-a-second-application.md)
- [Decision 0012: The domain root stays with Poodl](../decisions/0012-the-domain-root-stays-with-poodl.md)
