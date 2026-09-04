---
title: "Decision 0013: Shared material travels as a package"
kind: "decision"
audience: [contributor, maintainer, agent]
canonical_for: [decision_shared_material_package]
requires: []
---

# Decision 0013: Shared material travels as a package

## Context

[Decision 0002](0002-shared-material-travels-by-citation.md) weighed three ways for a value to
leave this repository — an npm package, a git submodule, and copying by hand — and took the
third. It was the right answer for what was being distributed: one shared component, one
specification module, one consumer, and a release process for one file and one reader costs
more than it returns.

That record named two conditions that would reopen it, and strictly speaking neither has
happened. Pawjong is still intended and not built. No wrong colour has reached a player. What
happened instead is that the price of citation arrived early, with one consumer rather than
two, and it arrived as a page.

[Poodl handover](../operations/poodl-handover.md) is that page, and almost nothing on it can
be checked by a machine. The Appearance surface exists twice — `docs/specs/appearance.allium`
here, and the same six guarantee names inside Poodl's `settings.allium` — and nothing anywhere
compares the two: Allium cannot import across repositories, so both checkers report empty on
the module each can see while the clauses drift apart. The token vocabulary exists twice, and
Poodl's landing page wears its copy at the domain root. The three typefaces exist twice,
governed by a checksum in a comment. That is one consumer already paying most of what 0002
said two consumers would pay, and paying it in the one currency 0002 could not price: nothing
is wrong until somebody looks.

A package does not repair all of it, and the honest reason to buy one is that it repairs the
half that is a file. A stylesheet, a component, a typeface and a specification module can be
installed at a version, recorded in a lockfile, and compared by a test in the repository that
consumes them. A page path, a heading anchor, a topic slug and the prose of a guarantee cannot
be. They cross a boundary no package spans, and they stay exactly as uncheckable as 0002
described.

## Decision

Publish `@steven-cutting/biscuit-games` to GitHub Packages, and supersede
[decision 0002](0002-shared-material-travels-by-citation.md) in full.

The package carries four things: the design tokens stylesheet, the shared components, the two
committed typefaces, and `docs/specs/appearance.allium`. It carries no handbook page. The
pages stay where they are and are still cited rather than installed, which is why 0002's
documentary obligation survives its own supersession.

**`src/app.css` does not move.** `svelte-package` emits `src/lib/` and nothing else, so the
obvious reading is that the stylesheet has to move there to be shippable. It does not:
`svelte-package` compiles Svelte and TypeScript, and CSS needs no compilation, so `files` and
`exports` publish the stylesheet from where it already lives. The payoff is that the three
`@font-face` rules need no edit — they read `url('./lib/assets/fonts/…')` relative to `src/`,
the tarball preserves that layout, and the faces resolve inside a consumer's `node_modules`
exactly as they do here. The alternative was eighty edits to prose that is currently true, in
a change that already rewrites two dozen pages, to a file this repository calls frozen. The
smallest coherent change was the one that left it alone.

What a version means is stated rather than inferred, and
[Published artefacts](../reference/published-artefacts.md) owns it: the export map, the entry
points, the addresses, and which of a token rename, a token value and a component prop is
major, minor or patch. That page is the interface. This record is only the reason it exists.

## Consequences

**Reading the package needs a credential, and copying a file did not.** GitHub Packages
authenticates every npm request, including an anonymous read of a public package — measured,
not assumed: an existing package returns `401` to an unauthenticated request where a
non-existent one returns `404`. So a game repository needs an `.npmrc` naming
`npm.pkg.github.com` for the `@steven-cutting` scope and a token carrying `read:packages`
behind it, on every contributor's machine and in every continuous integration job that
installs. Every fresh clone of Poodl now needs a GitHub credential before `just sync` will
finish, where today it needs none. That is a real barrier, it is the cost of the registry
rather than of the package, and it is the first thing to revisit if it is what stops adoption.

**There is a release process, and `CHANGELOG.md` is load-bearing for the first time.** A
version, a changelog entry, a tag, and a workflow holding `packages: write`. A change that
moves a shared surface is not finished when the gate is green; it is finished when it is
released, or deliberately not released and said so.

**A published artefact exists, and it can be tampered with.**
[The security model](../explanation/security-model.md) said there was no distributed artefact
for anyone to interfere with. That sentence is gone. What replaces it is narrower and true:
the artefact is built by a workflow here from a tagged commit, every dependency is pinned
exactly, and the token that publishes it is the workflow's own rather than a stored one — so
the repository still holds exactly one secret, and it is still Chromatic's.

**A game's build can now fail because of this repository.** That was impossible before and it
is the point. A wrong version, a yanked release, a registry outage or an expired read token
each stop a game building, where previously nothing here could stop anything there. The
independence 0002 bought is spent, knowingly.

**Two copies become one, and somebody else deletes the second.** Poodl does not stop holding a
copied stylesheet and a copied Appearance surface because a package exists; it stops when a
change in that repository removes them. Until then the platform runs both mechanisms at once,
which is worse than either. The items are in [Poodl handover](../operations/poodl-handover.md),
and nobody working here makes them.

**The uncheckable half is unchanged.** Page paths, heading anchors, topic slugs and the prose
of a `@guarantee` still cross the boundary as citations nothing resolves. The
`consumer-impact` skill is not retired by this decision; its framing changes, because a token
rename is now a major version somebody can see, while a renamed page is still a link that rots
silently for a month.

**Nothing here still recomputes a contrast ratio.** `tests/contrast.test.ts` was not ported,
so the figures in the stylesheet remain inherited claims — and they are now inherited claims
that ship. Publishing raises the price of that gap rather than changing its shape.

**The typefaces leave the repository as a redistributable for the first time.** Both are
OFL-1.1 and their licence texts ship beside them in `src/lib/assets/fonts/`, which is what the
licence asks for. The package itself is `UNLICENSED`: this repository intentionally generates
no licence file, a public repository without one reserves all rights, and stating that is
honest where leaving it implied is not.

## What would reopen this

The registry's authentication cost turning out to be what stops adoption. If handing every
contributor a token is what makes a game keep its copy, the package has bought nothing, and a
public registry is the cheaper honest answer.

A consumer that is not a Biscuit Games game. The package is scoped and its version policy is
written for repositories this account owns; anything outside that wants a licence file and a
deprecation policy this repository does not have.

Or the release process going unrun. A package nobody cuts a version of is a copy with extra
steps, and the evidence would be a shared surface changed here and released nowhere.

## Related pages

- [Published artefacts](../reference/published-artefacts.md)
- [Consume the hub from a game repository](../how-to/consume-the-hub.md)
- [What the hub owns](../project/what-the-hub-owns.md)
- [Poodl handover](../operations/poodl-handover.md)
- [Decision 0002: Shared material travels by citation](0002-shared-material-travels-by-citation.md)
