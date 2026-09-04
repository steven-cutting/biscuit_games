---
title: "Published artefacts"
kind: "reference"
audience: [contributor, maintainer, operator, agent]
canonical_for: [package_interface, published_addresses]
requires: []
---

# Published artefacts

Two things leave this repository, and this page is the only place either is *recorded*. A
procedure may paste an address to stay runnable, and a decision or a handover item may name one
where naming it is the point; nothing else states what these addresses are or what they promise,
because a URL written in two places is a URL that rots in one of them.

| Artefact | Address | Published by |
| --- | --- | --- |
| The package | `@steven-cutting/biscuit-games` on `npm.pkg.github.com` | A tag, through the release workflow |
| The workshop | `https://main--6a99fd20afcb187c61d773f1.chromatic.com/` | A push to `main`, through `just chromatic` |

The workshop is live. The package is not: no version has been released, and the work is still
under `[Unreleased]` in `CHANGELOG.md`. So the registry coordinate above is where a first
release lands rather than somewhere anything installs from today, and
`just publish-package-dry-run` is how you rehearse against it without creating a version. What
this page says about the package describes the artefact a release produces, and is true of it
the moment one is cut. **Delete this paragraph as part of cutting the first release** — nothing
else flips it, because this repository has no other release procedure to hang the step on.

The Chromatic application id is `6a99fd20afcb187c61d773f1`, and the permalink has the form
`https://<branch>--<appId>.chromatic.com/`, so a branch other than `main` has an address of the
same shape. It follows the branch rather than a build number, and it serves `index.json`
without authentication — which is the file, and the only file, a consuming Storybook's `refs`
entry fetches. The application id is part of that address, so recreating the Chromatic project
would move it and break every reference: it is renamed deliberately or not at all, in the same
class as a topic slug.

The hub site is published nowhere. `just frontend-build` produces a directory of files and
nothing uploads it, and the domain root stays with Poodl — that is
[decision 0012](../decisions/0012-the-domain-root-stays-with-poodl.md), unchanged.

## What the package contains

| Entry point | What it is |
| --- | --- |
| `@steven-cutting/biscuit-games` | The shared components, as Svelte 5 source with their generated types. |
| `@steven-cutting/biscuit-games/app.css` | The token vocabulary, the theme and contrast palettes, and the `@font-face` blocks. |
| `@steven-cutting/biscuit-games/assets/fonts/*` | The two typefaces and their OFL texts. |
| `@steven-cutting/biscuit-games/specs/appearance.allium` | The shared specification module, as text. |

Components ship as Svelte source rather than compiled output, which is what `svelte-package`
produces and what a consumer's own compiler expects. Svelte is a peer dependency, declared as
`>=5.56.8 <6`, so a game brings its own copy and two rune runtimes never meet in one bundle.

The stylesheet and the specification are published from where they already live rather than
from `dist/`, because neither needs compiling. That is why `src/app.css` is still at
`src/app.css` and why its `@font-face` rules still read `url('./lib/assets/fonts/…')`: the
tarball preserves the layout those relative URLs were written against, so the faces resolve
inside a consumer's `node_modules` exactly as they do here.

Nothing else ships. This handbook is not in the package, the stories are not in the package,
and the tests are not in the package. A game reads these pages by citation, which is the part
[decision 0013](../decisions/0013-shared-material-travels-as-a-package.md) leaves standing.

## Registry access

Reading needs a credential. GitHub Packages authenticates every npm request, so even a public
package needs a token carrying `read:packages` behind an `.npmrc` scoping `@steven-cutting` to
`npm.pkg.github.com`. The procedure is
[Consume the hub from a game repository](../how-to/consume-the-hub.md).

Publishing uses the release workflow's own `GITHUB_TOKEN` with `packages: write`. No personal
token is stored, and there is no registry credential to rotate.

## What a version means

Semantic versioning over the four things the package carries. The rule is what a consumer's
build sees, not how large the change felt to make.

| Change | Level |
| --- | --- |
| A token removed or renamed | Major |
| A component removed or renamed | Major |
| A required prop added, or a prop renamed | Major |
| A component's accessible name or role changed | Major |
| A `@guarantee` changed in meaning | Major |
| The Svelte peer range narrowed | Major |
| A token added | Minor |
| A component added, or an optional prop added | Minor |
| A `@guarantee` added | Minor |
| A token's value changed with its name kept | Minor |
| The Svelte peer range widened | Minor |
| A comment or a wording repair with no rendered difference | Patch |

Two of those look smaller than they are, and both deserve their reasoning written down.

**A token rename is major even though nothing fails.** The consumer's stylesheet still parses,
the build still succeeds, and the colour is simply absent. There is no smaller version a
consumer could take without reading, so there is no smaller version.

**A token's value moving is minor and never patch.** It changes what every palette spending
that token measures, and the figures in the stylesheet's comments are inherited claims rather
than measurements — nothing here recomputes a ratio, which is
[Design tokens](../design/tokens.md)'s standing warning. A minor bump tells a consumer to look.
A patch would tell them there is nothing to look at.

The version lives in `package.json` and in `CHANGELOG.md`, and either the two agree or the
release is wrong. The changelog entry names the token, the prop or the guarantee that moved, by
name, because it is what a consumer reads to decide whether to take the bump.

## What no version can describe

Page paths, heading anchors and `canonical_for` topic slugs. Each is consumer-visible, none is
in the package, and no number says anything about a change to one. They are renamed
deliberately or not at all, and a rename belongs in
[Poodl handover](../operations/poodl-handover.md) before it lands rather than after somebody
notices.

## Related pages

- [Consume the hub from a game repository](../how-to/consume-the-hub.md)
- [Commands](commands.md)
- [Configuration](configuration.md)
- [Design tokens](../design/tokens.md)
- [Decision 0013: Shared material travels as a package](../decisions/0013-shared-material-travels-as-a-package.md)
