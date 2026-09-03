---
title: "Decision 0012: The domain root stays with Poodl"
kind: "decision"
audience: [contributor, maintainer, operator, agent]
canonical_for: [decision_deferred_domain]
requires: []
---

# Decision 0012: The domain root stays with Poodl

## Context

Poodl's decision 0009 gave the platform a front door and put it inside a game's
repository. `pnut.fans` became the custom domain on the `poodl` repository, `site-root/`
became the landing page that sits at the root of it, and `scripts/stage_site.sh` became
the step that assembles a domain out of a build. That decision knew the shape was wrong
and named exactly what would undo it:

> A second Biscuit Games game. The domain root would belong to its own repository then, this one would go back to owning `/poodl/` alone, and the staging step would become somebody else's problem — which is the version of this that was rejected today only because there is one game and a second repository would have been machinery with nothing to carry.

The second repository now exists, and this is it. So the condition is half met, and only
half: there is a repository that should own the root, and there is still only one game
behind the door. Pawjong is intended and not built. Moving the domain today would hand
the front door to a repository with nothing more to point at than Poodl's landing page
already points at, and would spend the migration twice — once now, and once again when a
second game makes the move mean something.

## Decision

Defer the move.

`pnut.fans` stays a custom domain on the `poodl` repository. `site-root/` stays there and
keeps serving the landing page. `scripts/stage_site.sh` stays Poodl's, reached by Poodl's
`just stage`.

This repository ships no Pages workflow, no `site-root/` and no staging script, and it
sets `BASE_PATH` nowhere. The recipes `stage` and `stage-preview` do not exist here. It is
published nowhere: `just frontend-build` produces a directory of files, and nothing
uploads it.

## Consequences

**The hub is a website nobody can visit.** That is a strange thing to be, and it is the
price of not doing a migration twice. The front door is real, the door it should replace
is the one people use, and the two do not meet until the move happens.

**There is no deployment procedure here.** No how-to describes one, and
[Maintenance](../operations/maintenance.md) has no deploying section, because a procedure
written against an address this repository does not hold would be fiction that reads like
instructions. The procedure that exists is Poodl's.

**Poodl keeps carrying a front door larger than itself**, and keeps paying exactly what
its own 0009 wrote down: a landing page outside every gate that means anything, the
stylesheet and the fonts served twice across two addresses, and a staging script its own
aggregate gate cannot run. Those costs were accepted on the understanding that they end
when the root moves. Deferring the move defers the end of them.

**The move, when it comes, is a move and not an addition.** GitHub Pages allows one custom
domain per repository, so `pnut.fans` cannot be adopted here while `poodl` still holds it.
What that means in practice:

- The domain is removed from `poodl`'s Pages settings and added to this repository's.
- The DNS `A`, `AAAA` and `TXT` records are untouched: they point at GitHub and at the
  account, not at a repository. The `MX` and `SPF` records that carry mail must not be
  replaced. The failure mode is not a subtle one — it is writing a record set wholesale.
- `site-root/` and `scripts/stage_site.sh` move here, and the staging step becomes this
  repository's problem, along with the gate gap it has always had.
- Poodl's `BASE_PATH` becomes a cross-repository coupling. It would name where Poodl sits
  inside a domain served from somebody else's repository, and the two have to agree with
  no gate on either side able to check that they do.
- Old links redirect through GitHub's undocumented behaviour a second time. It held once
  and was measured; that it held is not a promise that it holds again.

**`svelte.config.js` keeps reading `BASE_PATH` with nothing setting it.** That is
deliberate rather than unfinished, and the file says so where a reader will find it.
Keeping the hook means adopting an address later is a workflow change rather than a config
change — one place to set a variable, not a build to re-reason about.

## What would reopen this

A second game reaching the point of being served. Pawjong is named as intended and not yet
built, and the moment it needs an address the door has two rooms behind it, which is the
condition Poodl's 0009 wrote down.

Sooner than that, either of two things.

The hub site growing into something worth visiting. A skeleton with one route and one
component has nothing to publish that the landing page does not already say; a hub that
says what Biscuit Games is and links to each game does, and at that point the strange
thing above stops being tolerable.

Or Poodl's landing page growing past the smallest honest thing its own decision says it
must remain. That page sits outside the gates only because there is almost nothing to get
wrong in it. A page that grows breaks that argument, and moving it here — where a
component earns a story, an axe pass and a Chromatic snapshot — becomes the cheaper
repair rather than the larger one.

## Related pages

- [What the hub owns](../project/what-the-hub-owns.md)
- [Poodl handover](../operations/poodl-handover.md)
- [Maintenance](../operations/maintenance.md)
- [Configuration](../reference/configuration.md)
- [Decision 0003: A static site with no backend](0003-static-site-no-backend.md)
- [Decision 0011: A skeleton, not a second application](0011-skeleton-not-a-second-application.md)
