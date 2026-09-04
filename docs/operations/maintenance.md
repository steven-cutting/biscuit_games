---
title: "Maintenance"
kind: "operations"
audience: [maintainer, operator, agent]
canonical_for: [maintenance_routine]
requires: []
---

# Maintenance

There is no service to operate. Nothing runs, nothing accumulates, and there is no
on-call. There is no site deployment to watch either: the hub site is published nowhere,
which is [decision 0012](../decisions/0012-the-domain-root-stays-with-poodl.md). What leaves this
repository is a package and a component workshop, and neither runs — one is installed and one
is read. What follows is upkeep of the repository, of the releases it cuts, and of the links
that cross between it and Poodl.

## Routine

**Weekly.** Read any failing scheduled run. Nothing is scheduled yet — neither workflow
carries a `schedule:` trigger — so this is currently just the state of `main`.

**Monthly.** Run `just check-links-online`. It is the most consequential recurring task on
this page and it has its own section below.

**Monthly.** Review dependency versions. Every pin is exact, so nothing moves on its own
and nothing is picked up by accident either. Nothing opens a bump for you: there is no
Dependabot or Renovate configuration here. Follow
[Maintain dependencies](../how-to/maintain-dependencies.md), and check compatibility
before choosing a version — the repository already holds TypeScript back a major version
because the linter does not support the newer one.

**Per change to a shared surface.** Not a calendar item; a step in the change itself. See
below.

## Checking the links to Poodl

```console
just check-links-online
```

This is the only thing in the repository that resolves a cross-repository link, and it is
run by hand. Three facts stack up behind that sentence:

- **The documentation contract skips external links entirely.**
  `scripts/validate_docs.py` ignores any target beginning `http://`, `https://` or
  `mailto:`, so the exact-case, must-resolve rule that governs every internal link does
  not apply to a link that leaves the repository.
- **The offline link checker skips them too.** The lychee run inside `just check-docs`,
  and the identical one in the commit hook, pass `--offline`.
- **This recipe is the same lychee run with the network.** It is registered as a manual
  hook stage, so it is not part of `just check` — a check that can fail because a third
  party is down is not a gate. [Quality gates](../reference/quality-gates.md) says the
  same thing from the other direction.

Poodl's references to this repository are GitHub blob URLs, because this handbook is
published nowhere and there is no site to link to. Nothing on either side goes red when a page
here is renamed or moved. The rot is silent, and it lasts until somebody remembers this
recipe — a month at best. That is the standing price of
[decision 0002](../decisions/0002-shared-material-travels-by-citation.md): one
authoritative copy, bought with links no machine maintains.

When the recipe reports a failure, fix the link at whichever end owns it. If the end that
owns it is Poodl's, write the item into [Poodl handover](poodl-handover.md) rather than
editing Poodl.

## Per change to a shared surface

A token name or value, a component prop or accessible name, a `@guarantee` clause, a page
path, a heading anchor, a `canonical_for` slug: each of those is something a game holds a
copy of or points at. Changing one is a change to an interface, even though no build
anywhere depends on this repository. Before it lands:

1. Run the `consumer-impact` skill. It asks what the change breaks over there and sorts
   each answer into silent, loud or cosmetic. Silent is the one worth writing down,
   because loud fails a gate in Poodl and silent fails nothing anywhere.
2. Record each consequence in [Poodl handover](poodl-handover.md) as a checklist item
   naming the file to change and the value to change it to. That page is the ledger of
   what is owed, not a record of work done.
3. Change nothing in Poodl. Editing another repository needs explicit authorization for
   each action, and approval for one action is not approval for the next. This repository
   records; it does not act.

Prefer whole-page links over heading fragments when writing anything that crosses the
boundary. A fragment is checked by nothing at all: the offline checker will not fetch the
page to look for the anchor, and the online one verifies the page rather than the anchor
in it.

## Secrets

There is one, and it belongs to the toolchain rather than to the site.
`CHROMATIC_PROJECT_TOKEN` lives as a GitHub Actions secret and is read from the
environment; it is written into no file here. It is set, and builds publish. The workflow
still reports the token's absence and skips the publish rather than going red, which is what
a fresh fork or a revoked secret would meet.

There is no deployment credential to rotate, and none to create: the release workflow
publishes with the run's own `GITHUB_TOKEN` under `packages: write`, and no workflow here holds
`pages: write` or `id-token: write`, because there is no Pages workflow to hold them. See
[Security model](../explanation/security-model.md).

## Related pages

- [Poodl handover](poodl-handover.md)
- [Troubleshooting](troubleshooting.md)
- [Maintain dependencies](../how-to/maintain-dependencies.md)
- [Security model](../explanation/security-model.md)
- [Decision 0012: The domain root stays with Poodl](../decisions/0012-the-domain-root-stays-with-poodl.md)
