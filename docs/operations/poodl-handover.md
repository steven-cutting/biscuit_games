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
URLs, because this handbook is published nowhere and there is no documentation site to link
to — the package carries files, never pages. That is
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
copy. Poodl's landing page wears this stylesheet, and the comments in the copy here describe
this repository's own gate — `tests/contrast.test.ts` measures here now — and name which of
Poodl's gates are Poodl's where a rule is still only stated over there. No declaration
moved: not a token name, not a value, not a selector, not a font path. So the two files
still agree about everything that renders, and they disagree about prose that is correct
on each side of the boundary. A copy taken raw from here would carry sentences that name
Poodl in the third person inside Poodl. The package makes the copy unnecessary; until Poodl
takes it, take the declarations and leave the comments.

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

## What the package lets Poodl delete

`@steven-cutting/biscuit-games` is published, which is
[decision 0013](../decisions/0013-shared-material-travels-as-a-package.md). It carries the
tokens stylesheet, the shared components, the two typefaces and `docs/specs/appearance.allium`.
Three of Poodl's copies can therefore stop being copies. None of this has happened either, and
none of it is urgent: a copy that is correct today stays correct until something moves here.

**The registry comes first, and it is not free.** GitHub Packages authenticates every npm
request, including a read of a public package, so before any item below Poodl needs a committed
`.npmrc` scoping `@steven-cutting` to `npm.pkg.github.com`, a token carrying `read:packages` on
every contributor's machine, and the same token in every continuous integration job that
installs. Poodl's own dependency page records that there is no `.npmrc` there today; there will
have to be one, and it holds no token. A contributor without a token cannot install at all,
which is a worse first run than the copy it replaces, and it is the honest price of the
mechanism. Whether Poodl's own workflow token can stand in for a stored one depends on the
package granting that repository read access — a setting on the package, testable only from
Poodl, and worth trying before a secret is created.

**`src/app.css`.** Poodl's copy is replaced by an import of
`@steven-cutting/biscuit-games/app.css` at the root layout, and the file is deleted. Two things
go with it: Poodl's `@font-face` blocks and its copies of the three woff2 files are no longer
needed, because the package's stylesheet names them by relative URL and they resolve beside it.
And `tests/contrast.test.ts` reads the stylesheet from disk, so it has to read it from
`node_modules` instead. Once it does, the thirteen cases this repository's copy of the test
also runs become redundant and may be retired; the block that measures Poodl's own state
separations — `AnUntriedKeyIsDistinguishableFromAScoredOne`, against
`minimum_state_separation` and `minimum_mark_separation` from Poodl's `game.allium` — stays,
because it is the only thing in the platform that measures those figures, and losing it to a
path change would be the worst possible outcome of this work. Move it before deleting the
file, not after — and have it assert that the path it resolved contains `node_modules`,
because a resolve that silently fell back to the old copy would stay green while proving
nothing.

**The `Appearance` surface in `docs/specs/settings.allium`.** This is the item to be careful
with, because the package does not settle it. Allium has no cross-repository import, and
shipping the module inside `node_modules` does not give it one: Poodl's surface still faces
`game/Player`, still reads a `device` entity and still quotes
`game/config.minimum_text_contrast`, while the module here is a root module with its own
`given` block. Neither can reference the other, and no checker compares them.

What the package changes is that the authoritative text is now on disk inside Poodl's own tree.
So the item is a test, not a deletion: a check in Poodl's gate that reads the shipped module and
asserts Poodl's copy still states the same six guarantee names —
`SystemFollowsTheDeviceAsItChanges`, `ReducedMotionOverridesTheAnimationSetting`,
`MoreContrastFromTheDeviceTurnsHighContrastOn`, `AppearanceNeverCarriesMeaningAlone`,
`EveryCombinationMeetsTheLegibilityFloor` and `AnUnavailableControlIsExempt` — and, where the
clauses are meant to agree, the same texts. That check would be the first thing in the
platform's history to compare the two files, and it closes the gap the section above names as
the one place this repository's authority can break with no gate seeing it. It is the single
most valuable item on this page.

**The shared components, the icons, the port and the derivations.** Since
[decision 0014](../decisions/0014-the-hub-holds-the-design-system.md) the package carries
Poodl's own platform primitives — `Icon` and the twenty-two icons, `IconButton`, `Button`,
`HeaderBar`, `Modal`, `Notice` and `Announcer` — with `createMediaPreferences`,
`createFakePreferences`, `darkActive`, `animationsActive` and `highContrastActive`, and every
type a consumer writes against. Each of Poodl's copies becomes an import, and the copy, its
test block and its story go: `src/lib/components/{Icon,IconButton,Button,HeaderBar,Modal,Notice,Announcer}.svelte`,
`src/lib/components/icons.ts`, `src/lib/assets/icons/`, `src/lib/ports/preferences.ts` and
`src/lib/domain/appearance.ts`, with `ThemeChoice` imported rather than declared in
`src/lib/domain/types.ts`. Poodl keeps `src/lib/config.ts`, which mirrors Poodl's own
specifications, and keeps every test that measures a figure those specifications state.

Three of the contracts changed on the way, and Poodl's call sites change with them:

- `HeaderBar` takes `brand`, `chip` and `actions` rather than a mode, a status and five
  callbacks. Poodl passes its lockup as the `brand` snippet — the words in an element of
  class `words`, so the collapse below 26rem still reaches them — or accepts the heading
  reading "biscuit games" and edits the assertions in its `tests/primitives.test.ts` that
  expect "biscuit games / poodl". The chip's word and label — "No game under way — change
  game" and the rest — move to Poodl's route beside the state that chooses them, and the
  four actions become an array carrying their labels and `popup: 'dialog'`.
- `Notice` takes `message` and `tone` rather than Poodl's `Notice` union. The sentences move
  to the route beside the state that chooses them, with `tone: 'success'` for a completed
  copy and the default `alert` for the four rejections.
- `createMediaPreferences` takes a host object rather than a `matchMedia` function. The
  route's no-argument call is unaffected; the tests that pass `media.matchMedia` pass
  `{ matchMedia: media.matchMedia }` instead.

One behaviour changed too, and it is a repair rather than a contract, so no call site moves
with it. `Modal`'s focus trap now works out which of a panel's controls the keyboard really
stops on instead of trusting `querySelectorAll` to say. Poodl's `src/lib/components/Modal.svelte`
carries the enumeration this one came from, and a selector is not the sequential focus order:
it matches every radio of a group where the keyboard stops on one, it matches a control the
layout does not draw or a disabled `fieldset` has turned off, and it misses a disclosure's
`<summary>` altogether. Any of those standing last means the wrap never fires and Tab leaves a
panel that has declared `aria-modal="true"` over the page behind — where Escape no longer
closes it either, because the handler is on the panel. That is `settings.allium`'s
`@guarantee FullyKeyboardOperable` broken over the very panel it governs, latent rather than
absent: Poodl's `SettingsPanel` ends in checkboxes rather than in its theme radios, so the
last match there is a real stop today, and any panel ending in an exclusive choice wakes it.
Taking the package retires the copy and the defect together. Until then the repair is Poodl's
to make and this repository's only to record.

And notice where that guarantee lives. The shell is decided here and `FullyKeyboardOperable`
is stated there, so the only written contract for a shared component's keyboard behaviour
sits in a game's specification while `docs/specs/appearance.allium` says nothing about focus,
keyboards or dialogs at all. That is the inversion invariant 1 exists to prevent, and it is
why the defect was found by review rather than by a gate. Closing it is a specification
change and a product decision, not a repair to make in passing.

And five heading anchors this repository renamed with the port, each a link Poodl may hold:
`testing.md`'s "The contrast test is not ported" and "What a ported contrast test will hit"
are now one section, "The contrast test"; `tokens.md`'s "Nothing here recomputes a ratio"
and `accessibility.md`'s "Every figure here is inherited, not measured" are each now "How
the figures are measured"; and `port-a-design-system-component.md`'s "When to port, and
when to restyle in place" is now "What is ported, and what stays a game's".

**The version is the thing to record.** Whatever Poodl installs, it installs exactly — no
caret, no tilde, matching its own pinning rule — and the page Poodl gains says which version its
copies were retired at. A game sitting on an old release is behind rather than protected, and
the only thing that will ever say so is Poodl's own gate after a bump.

**And the thing that must not be done.** Poodl's `settings.allium` keeps its own `Appearance`
surface. Deleting it in favour of the packaged module is not possible, for the reasons above.
The package makes the two comparable, not merged. Anyone who reads this section as permission
to delete one of them has read it backwards.

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
somebody notices. That obligation is the half of distribution
[decision 0013](../decisions/0013-shared-material-travels-as-a-package.md) does not carry — a
package buys one authoritative *file*, at the price of links that no machine maintains.

## Related pages

- [Maintenance](maintenance.md)
- [What the hub owns](../project/what-the-hub-owns.md)
- [Decision 0001: Biscuit Games is the platform's source of truth](../decisions/0001-biscuit-games-is-the-source-of-truth.md)
- [Decision 0002: Shared material travels by citation](../decisions/0002-shared-material-travels-by-citation.md)
- [Decision 0013: Shared material travels as a package](../decisions/0013-shared-material-travels-as-a-package.md)
- [Published artefacts](../reference/published-artefacts.md)
- [Decision 0012: The domain root stays with Poodl](../decisions/0012-the-domain-root-stays-with-poodl.md)
