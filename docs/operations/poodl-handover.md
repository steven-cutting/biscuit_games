---
title: "Poodl handover"
kind: "operations"
audience: [maintainer, agent]
canonical_for: [poodl_handover]
requires: []
---

# Poodl handover

**None of this has happened.** Every item below is a change to the Poodl repository, and
not one of them has been made. This page is the ledger of what is owed now that this
repository is authoritative, not a record of work done. Read it as the current state of the
debt, and assume Poodl still looks exactly as it did before the split.

Editing another repository needs explicit authorization for each action, and approval for
one action is not approval for the next. This repository records what Poodl has to change;
it never changes it. An agent working here writes the item down and stops — including when
the fix is obvious, small, and one command away.

The items are grouped by shape rather than by urgency: what Poodl drops, the one page it
gains, the notes it adds, the pages it rewrites in place, and the standing cost every
cross-repository reference carries afterwards.

## What Poodl drops

Three pages moved here and are decided here now. Poodl removes each one from
`docs/manifest.yml` **and** deletes the file — both halves, because its contract is the
same as this one's: nothing under `docs/` may exist unregistered, and nothing registered
may be absent. Deleting a file while its entry stands fails the gate, and dropping the
entry while the file stands fails it just as loudly.

- `docs/design/direction.md`, which owns the topic `design_direction`.
- `docs/design/resource-index.md`, which owns `design_resource_index`.
- `docs/how-to/port-a-design-system-component.md`, which owns `design_system_porting`. Its
  two links into the design direction die with it and need no repointing.

The first two leave `docs/design/` empty, so the directory goes with them.

None of this lands on its own. Between the manifest edit and the deletion, and again
between the deletion and the new page below, Poodl's own `check-docs` fails — first on an
unregistered file or a missing one, then on dangling links from `docs/README.md`, then on a
page nothing reaches. Everything in this section and the next belongs in a single Poodl
change.

## The one page Poodl gains

Exactly one: `docs/project/platform.md`. It states that the aesthetic, the Biscuit
character, the design tokens, the shared components, the design research and the
cross-cutting decisions are decided in this repository and not in Poodl, and it carries the
outbound links. Nothing else in Poodl points outward.

The links are https URLs of the form
`https://github.com/steven-cutting/biscuit_games/blob/main/docs/<path>` — repository blob
URLs, because nothing here is published and there is no site to link to. That is
[decision 0012](../decisions/0012-the-domain-root-stays-with-poodl.md), and it also means
the URLs resolve only once this work reaches the default branch. Writing them before then
is fine; expecting them to resolve is not.

The page is registered like any other Poodl page, with a Poodl-scoped topic of its own —
`platform_upstream` reads correctly. It must not reuse a slug this repository already owns:
`platform_ownership` belongs to [What the hub owns](../project/what-the-hub-owns.md) and
`decision_platform_source_of_truth` to
[decision 0001](../decisions/0001-biscuit-games-is-the-source-of-truth.md). Topic
uniqueness is checked per repository, so a duplicate would pass both gates and still be
wrong.

`docs/README.md` links to it where the Design section used to be, which is what keeps
Poodl's reachability check green: every page there must be reachable from `docs/README.md`
by following links, and an unlinked page fails even when everything else about it is
correct. Every remaining inbound reference is then repointed at that local page rather than
at a URL, so Poodl's offline checker still verifies the hop.

Why one page rather than three stubs, one per departed topic:

- **A stub is a second claim of ownership.** The manifest is where ownership is asserted. A
  page that says "this is decided elsewhere" while still holding `design_direction` asserts
  the opposite of what it says, and the next reader — or the next agent running
  `consumer-impact` — has two answers to the same question. Dropping the topic is the point
  of the exercise; keeping it in order to host a redirect gives back exactly what was moved.
- **One page means one place to check when links rot.** Cross-repository URLs are verified
  by hand at best, and the section below explains how rarely. Three stubs are three times
  the surface for the same information, aging independently.

## Notes Poodl adds, never deletions

A superseded decision is still the record of what was decided, and why, on the day it was
decided. Poodl amends by dated blockquote in the form its own records already use, and
removes nothing.

**Decision 0010, The Biscuit Games design system.** A dated note saying design-system
ownership moved to this repository: the direction, the resource index and the porting guide
are decided here now. The port that decision describes still stands, and the deviations it
records — the recomputed dark absent letter, the dark light-theme absent borders, the
pinned warm pair — remain Poodl's own, made against Poodl's palette in Poodl's gate.

Ownership actually transfers in a pair of one-line edits, and only in that pair:
`canonical_for` changes from `decision_design_system` to a Poodl-scoped slug —
`decision_poodl_design_system_port` reads correctly — in **both** `docs/manifest.yml` and
the page's own frontmatter. The two values are compared character for character and
order-sensitively, so they must be identical. This repository's
[decision 0010](../decisions/0010-biscuit-games-design-system.md) keeps
`decision_design_system` and does not move.

**Decision 0009, Poodl lives at pnut.fans.** A dated note in its "What would reopen this"
section, saying that the second repository anticipated there now exists, and that the move
it would trigger is deferred by this repository's decision 0012.

```markdown
> Noted on 2026-09-02. The second repository now exists: Biscuit Games holds the platform's
> shared material and its own hub site. The domain root has not moved, and moving it is
> deferred by that repository's decision 0012 — until it is published, `pnut.fans` serves
> Poodl at the root exactly as this decision describes.
```

Decision 0009 is **not** marked superseded, in whole or in part, and its `decision_own_domain`
topic is untouched. The domain has not moved. Marking it superseded would say a change had
happened that has not, which is the failure mode this whole page is written against.

## Pages Poodl rewrites in place

- `docs/README.md` — the Design section and its three links go; the platform page is linked
  in their place.
- `docs/decisions/0010-biscuit-games-design-system.md` — five links into the departed pages,
  three to the design direction and two to the porting guide, one of the latter buried in a
  bullet about the warm pair. Each is repointed at `docs/project/platform.md`.
- `docs/decisions/0009-poodl-lives-at-pnut-fans.md` — one link to the design direction in
  Related pages, repointed the same way, alongside the note above.
- `docs/specs/settings.allium` — a comment under Defaults cites `docs/design/direction.md`
  for "Dark is home". Allium is not Markdown, so no link checker reads it and no gate will
  report it. It is corrected by hand or it stays wrong indefinitely.

Nothing is owed on `src/app.css`, but one thing about it is worth knowing before the next
copy. Poodl's landing page wears this stylesheet, and the comments in the copy here have
been rewritten to say which of the tests and gates they describe are Poodl's — because none
of them exist in this repository, and read plainly they claimed a gate was watching values
that nothing here reads. No declaration moved: not a token name, not a value, not a
selector, not a font path. So the two files still agree about everything that renders, and
they now disagree about prose that is correct on each side of the boundary. A copy taken
raw from here would carry sentences that name Poodl in the third person inside Poodl. Take
the declarations and leave the comments, or re-point them on arrival.

And the sharpest item, which is a rewrite only in the sense that someone has to decide what
it should say.

`docs/specs/settings.allium` carries an `Appearance` surface that is now a copy of a surface
owned here. `docs/specs/appearance.allium` states the same six guarantees by the same names
— `SystemFollowsTheDeviceAsItChanges`, `ReducedMotionOverridesTheAnimationSetting`,
`MoreContrastFromTheDeviceTurnsHighContrastOn`, `AppearanceNeverCarriesMeaningAlone`,
`EveryCombinationMeetsTheLegibilityFloor` and `AnUnavailableControlIsExempt` — over
different scaffolding. Poodl's surface faces `game/Player`, reads a `device` entity and
quotes `game/config.minimum_text_contrast`; the module here is a root module, so it declares
the device preferences as named booleans in a `given` block and carries its own `config`.

Allium cannot import across repositories, so neither module can reference the other, and
**nothing anywhere compares the two**. `just check-specs` and `just analyse-specs` read this
repository's module alone and report empty diagnostics and empty findings; Poodl's recipes
read Poodl's and report the same; both stay green while the clauses drift apart. Only a
person diffing the six texts side by side would notice.

That is the one place this repository's authority can break with no gate seeing it. Amend a
guarantee here and not there and the platform holds two specifications with identical names
and different meanings, with the game behaving as its own copy says rather than as the
platform's does — and the first symptom is a bug report about behaviour, months later, from
someone with no reason to suspect a second file exists. It is why the `consumer-impact`
skill exists, and why a change to `docs/specs/` here is not finished until its consequence
for Poodl is written into this ledger.

## What a cross-repository link costs

Once a reference crosses a repository boundary it stops being a path and becomes an
`https://` URL, and almost nothing checks it.

- The documentation contract skips them entirely. `scripts/validate_docs.py` ignores any
  target beginning `http://`, `https://` or `mailto:`, so the exact-case, must-resolve rule
  that governs every internal link does not apply.
- The offline link checker skips them too. The lychee run inside `just check-docs`, and the
  identical one in the commit hook, pass `--offline`.
- Only `just check-links-online` resolves them. It needs the network, so it sits outside
  `just check` deliberately, and it is run by hand — monthly, per
  [Maintenance](maintenance.md).

The consequence is worth stating plainly, because it is permanent rather than a gap someone
will close: a page renamed or moved here rots silently over there, for a month at best and
in practice for however long it is until someone remembers to run the manual recipe. Nothing
in Poodl's gate fails when it happens. Nothing in this repository's gate fails either.

Two habits follow. **Prefer whole-page links**, because heading fragments across
repositories are checked by nothing at all — the offline checker will not resolve the page
to look for the anchor, and the online one verifies the page rather than the fragment, so a
renamed heading here is invisible from both sides. And **treat a page path here as part of
the interface**: renaming one is a consumer-visible change in the same class as renaming a
token or a topic slug, and it belongs in this ledger before the rename lands, not after
somebody notices. That obligation is
[decision 0002](../decisions/0002-shared-material-travels-by-citation.md) working as
intended — citation buys one authoritative copy at the price of links that no machine
maintains.

## Related pages

- [Maintenance](maintenance.md)
- [What the hub owns](../project/what-the-hub-owns.md)
- [Decision 0001: Biscuit Games is the platform's source of truth](../decisions/0001-biscuit-games-is-the-source-of-truth.md)
- [Decision 0002: Shared material travels by citation](../decisions/0002-shared-material-travels-by-citation.md)
- [Decision 0012: The domain root stays with Poodl](../decisions/0012-the-domain-root-stays-with-poodl.md)
