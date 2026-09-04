---
title: "Decision 0002: Shared material travels by citation"
kind: "decision"
audience: [contributor, maintainer, agent]
canonical_for: [decision_shared_material_distribution]
requires: []
---

# Decision 0002: Shared material travels by citation

> **Superseded on 2026-09-03 by
> [Decision 0013](0013-shared-material-travels-as-a-package.md).** Shared material now travels
> as `@steven-cutting/biscuit-games`, a published package, and a game installs a version rather
> than holding a copy. Everything below stands as written: it is the account of why copying was
> right while there was one component, one specification module and one consumer, and of what it
> cost, which is what makes the successor legible. The topic slug
> `decision_shared_material_distribution` stays here, because a slug is what a cross-repository
> reference names. The documentary obligation this record describes is not superseded — no
> package carries a page path, and 0013 says so.

## Context

[Decision 0001](0001-biscuit-games-is-the-source-of-truth.md) settled ownership: the tokens,
the shared components and the shared surface belong to this repository. The next question is
mechanical rather than philosophical. A value lives in `src/app.css` here. How does it reach
a game's stylesheet?

Three answers were available.

- **Publish an npm package.** Each game installs a versioned dependency and the tokens
  arrive with the install. This is the answer that scales, and it brings a release process,
  a version range in every consumer, and a build-time coupling between repositories with it.
- **Use a git submodule.** No registry and no release, but a pinned commit, a checkout step
  in every clone and every continuous integration job, and the failure modes submodules are
  known for.
- **Copy and cite.** A game holds its own copy and records where the copy came from.

The scale of what is being distributed decided it. There is one shared component,
`src/lib/components/Wordmark.svelte`. There is one specification module,
`docs/specs/appearance.allium`. There is one consumer, Poodl, and the second game is
intended rather than built. A release process for one file and one reader costs more than it
returns.

## Decision

Copy and cite. Nothing in this repository is published, imported or vendored automatically.

A game copies a value and records where the copy came from — the token name and the page
that owns it — and then proves the copy with its own tests. Poodl's `tests/contrast.test.ts`
is already the pattern: it reads the stylesheet from disk and recomputes every ratio rather
than trusting a figure written in a comment. A citation says where a value should have come
from; the consumer's own gate says whether it still matches.

That makes this repository's obligation a documentary one. Its job is to be citable: stable
topic slugs, stable heading anchors, one owner per topic in `docs/manifest.yml`. A reference
arriving from another repository names a slug and an anchor, and neither is checked from
this side.

## Consequences

There is no versioning problem, because there are no versions. No release process, no
registry account, no changelog to maintain, and no build-time coupling in either direction.
A game can sit a release behind this repository indefinitely without breaking, and adopts a
change when it is ready to test one.

The cost is drift, and drift here is both possible and invisible. Rename a token in
`src/app.css` and a game's stylesheet resolves it to nothing: no error here, and no error
over there until a person looks at the rendered page or a test in that repository fails.
Only that game's gate can say so, and this repository cannot run it. The `consumer-impact`
skill exists because of this decision and is the only thing standing in that gap. It walks
what a change moved — token names and values, component props and accessible names,
`@guarantee` clauses, page paths, heading anchors and topic slugs — classifies each as
silent, loud or cosmetic, and writes the silent ones into
[Poodl handover](../operations/poodl-handover.md) as checklist items naming the file to
change and the value to change it to. That is a procedure, not a gate. It runs when somebody
runs it.

The asymmetry runs the other way too. `tests/contrast.test.ts` was not ported, so nothing in
this repository recomputes a contrast ratio; a figure quoted in these pages is an inherited
claim rather than a measurement. The hub states, the consumer proves — which is exactly why
the proof obligation sits with the copy rather than with the citation.

Citation also constrains this handbook. A topic slug is the stable identifier a
cross-repository reference names, so renaming one casually breaks a link nothing here can
see. The documentation gate resolves relative links within this repository and skips
external ones entirely; a reference pointing in from a game repository is outside its reach
altogether. Slugs and anchors are therefore public surface, and they are renamed
deliberately or not at all.

## What would reopen this

A second game. Pawjong is intended and not yet built, and two consumers of the same token
file is where copying by hand starts costing more than a package. It is also the point at
which "the same instrument with a different attachment" — the claim
[Design direction](../design/direction.md) makes — has to be true in code rather than in
prose. Two games each reimplementing the same shared surface from the same specification is
a claim about the code that only shared code can settle.

Or a token drift that reaches a published site. A wrong colour in front of a player is
evidence that documentary authority was not enough, and the honest response would be to buy
the release process rather than write a firmer rule.

## Related pages

- [What the hub owns](../project/what-the-hub-owns.md)
- [Decision 0001](0001-biscuit-games-is-the-source-of-truth.md)
- [Design tokens](../design/tokens.md)
- [Poodl handover](../operations/poodl-handover.md)
- [Agent contract](../reference/agent-contract.md)
