---
title: "Consume the hub from a game repository"
kind: "how-to"
audience: [contributor, maintainer, agent]
canonical_for: [package_consumption]
requires: []
---

# Consume the hub from a game repository

This page is for somebody standing in a game repository — Poodl today — who wants the
platform's tokens, components, typefaces and shared specification without copying them. What is
in the package and what a version number promises are in
[Published artefacts](../reference/published-artefacts.md); this is the procedure.

Everything below is a change to another repository, and nobody working here makes one. This
repository records what a game has to change and never changes it, which is why the items Poodl
actually owes are in [Poodl handover](../operations/poodl-handover.md) rather than here.

## 1. Authenticate to the registry

GitHub Packages authenticates every npm request, including a read of a public package. There is
no anonymous install, and the failure lies: an unauthenticated request for a package that
exists returns `404 not found` far more often than it returns anything about permissions.

Commit an `.npmrc` at the repository root holding one line and no token:

```text
@steven-cutting:registry=https://npm.pkg.github.com
```

The token goes somewhere the repository cannot see. On a laptop, in `~/.npmrc`:

```text
//npm.pkg.github.com/:_authToken=<a token carrying read:packages, and nothing else>
```

In continuous integration, `actions/setup-node` writes a temporary `.npmrc` outside the
checkout when given a registry and a scope, and reads the token from the environment:

give `actions/setup-node` a `registry-url` of `https://npm.pkg.github.com` and a `scope` of
`@steven-cutting`, then set `NODE_AUTH_TOKEN` on each step that runs npm from a repository
secret holding the same kind of token.

The environment variable belongs on every step that runs npm, not on the job: `setup-node`
cannot supply it retroactively. (The workflow expression that reads a secret is omitted here
because this handbook's own gate rejects template delimiters in a page; a game's workflow
writes it the ordinary way.) Whether a game's own `GITHUB_TOKEN` can stand in for that
secret depends on the package granting that repository read access, which is a setting on the
package rather than on either repository — try it, and keep the stored token as the answer if
it does not work.

## 2. Install a version

```console
npm install @steven-cutting/biscuit-games@1.0.0 --save-exact
```

`1.0.0` is the first release. [Published artefacts](../reference/published-artefacts.md) says
what the number promises, and the `CHANGELOG.md` the package carries says what is in it.

Exact, no range. That is this repository's fourth invariant and a game built from the same
toolchain holds the same one. The version is what makes drift visible; a caret gives it
straight back.

## 3. Import the tokens once

At the root layout, and nowhere below it:

```svelte
<script lang="ts">
  import '@steven-cutting/biscuit-games/app.css';
</script>
```

The game's own stylesheet sits after it and names tokens rather than restating values. If the
game holds a copied stylesheet today, this import replaces it and the copy is deleted in the
same change — two files declaring the same custom properties is a cascade question nobody wants
to answer twice.

The stylesheet is not only tokens. It also carries the global element rules — `body`,
`:focus-visible`, `::selection`, the radio and textarea rules and `.visually-hidden` — so a
consumer takes those too. That is deliberate and it is why the package has one stylesheet entry
point rather than two: the only consumer today wants all of it. Splitting the tokens out is
additive when a game asks for it.

## 4. Write the three attributes on `<html>`

Every palette is keyed on `:root`, so the attributes belong on the document element and nowhere
else. A wrapper `<div>` matches none of the selectors.

| Attribute | Values | Effect |
| --- | --- | --- |
| `data-theme` | `light`, `dark`, or absent | Absent means the device decides, through `prefers-color-scheme`. |
| `data-high-contrast` | `true`, or absent | Selects the high-contrast palette for whichever theme is showing. |
| `data-animations` | `on`, or absent | The only selector under which the motion durations are anything but `0ms`. |

Absent is a value in all three, and it is usually the right one:
`SystemFollowsTheDeviceAsItChanges` is a guarantee about what happens when nothing is written.
The device's reduced-motion preference wins over `data-animations` whatever the game sets, which
is `ReducedMotionOverridesTheAnimationSetting`.
[Accessibility](../explanation/accessibility.md) owns what those guarantees oblige.

## 5. Import a component

```svelte
<script lang="ts">
  import { Button, HeaderBar, Icon, Keyboard, QWERTY, Tile } from '@steven-cutting/biscuit-games';

  const openSettings = () => {};
  const play = () => {};
</script>

<HeaderBar actions={[{ icon: 'settings', label: 'Settings', onclick: openSettings }]} />
<Button variant="primary" onclick={play}>Play</Button>
<Icon name="check" />
```

Components are Svelte 5 and runes only, and they take callbacks as props rather than dispatching
events. Svelte is a peer dependency, so the game brings its own and two copies never land in one
bundle. `Icon` draws by name from the map the package ships, and that map imports each SVG with
Vite's `?raw`, so the game's build has to be Vite-class — every SvelteKit game's is.
`HeaderBar` draws the platform's wordmark unless the game passes its own lockup as the `brand`
snippet, and a lockup that wants to give up its words below 26rem the way the wordmark does puts
them in an element carrying the class `words` — that class is the whole of the contract. The
preferences port and the three appearance derivations come through the same root import:
`createMediaPreferences` reads the device, `createFakePreferences` is what a game's tests inject,
and `darkActive`, `animationsActive` and `highContrastActive` are the `Appearance` surface's
derivations as functions. [Published artefacts](../reference/published-artefacts.md) lists the
whole surface.

A component names tokens the stylesheet declares and ships no copy of their values, so a
component imported without step 3 renders — and renders wrong, in inherited type and inherited
colour, with no error anywhere. The two imports go together.

## 6. Take the specification as given, and keep proving it

All three modules ship, at
`@steven-cutting/biscuit-games/specs/appearance.allium`,
`@steven-cutting/biscuit-games/specs/operation.allium` and
`@steven-cutting/biscuit-games/specs/play-surfaces.allium`. Allium has no cross-repository
import, and putting a module inside `node_modules` does not give it one: a game's own module
still cannot reference any of them.

What the package does is put the authoritative text where the game's own gate can read it. That
is worth taking, and it is the only thing that would ever compare the two files. A test in the
game that reads the shipped module and asserts its own surface still states the same guarantee
names — and, where the texts are meant to agree, the same clauses — closes a gap that is
currently invisible from both sides. It will be over-sensitive, and a reworded comma will fail
it. That is the feature: a failure is the one moment a person is required to say whether the
platform's meaning moved.

## 7. Compose the workshop

A game's Storybook can show this repository's components beside its own without building them.
In `.storybook/main.ts`:

```ts
refs: {
  'biscuit-games': {
    title: 'Biscuit Games',
    url: 'https://main--6a99fd20afcb187c61d773f1.chromatic.com',
    expanded: false
  }
}
```

Set `title`, or Storybook derives one from the key and renders `Biscuit games` with a lowercase
g. `expanded: false` because a game's own components belong at the top of its own sidebar.

The URL is pasted here so the block runs as it stands, but it is not recorded here:
[Published artefacts](../reference/published-artefacts.md) is where the workshop's address
lives, and it is the page to read if this one has gone stale.

The cost is that Storybook checks a ref's reachability from Node while it builds, so a game's
Storybook build stops being offline. The story-test run is unaffected. If a game's gate being
offline matters more than composition does, skip this step: it is the only one here that buys
convenience rather than correctness.

## What still travels by citation

The package carries files. It carries no handbook page, and it cannot.

- A page path here is part of the interface. Link to whole pages, never to heading fragments: a
  fragment across repositories is checked by nothing on either side.
- A `canonical_for` topic slug is the stable name a cross-repository reference uses, and
  renaming one breaks a link no gate can see.
- The prose of a `@guarantee` is the obligation. A game that restates one holds a copy, and step
  6 is how that copy gets proved.

That residue is what
[decision 0013](../decisions/0013-shared-material-travels-as-a-package.md) says a package does
not repair, and it is why the `consumer-impact` skill still runs on every change to a shared
surface.

## Related pages

- [Published artefacts](../reference/published-artefacts.md)
- [What the hub owns](../project/what-the-hub-owns.md)
- [Poodl handover](../operations/poodl-handover.md)
- [Design tokens](../design/tokens.md)
- [Decision 0013: Shared material travels as a package](../decisions/0013-shared-material-travels-as-a-package.md)
