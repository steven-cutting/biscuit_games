# Biscuit Games

The hub for Biscuit Games: a small static site that says what the platform is and links to
the games, and the source of truth for everything the games share — the design system, the
shared components, the character, and every cross-cutting decision.

**Status: bootstrapped, packaged, and holding the design system.** The toolchain, the token
vocabulary, the icon set, the platform components, the preferences port and the contrast test
that measures the palette are all in place. What a game installs — the tokens, the
components, the icons, the typefaces, the port and the specification — is packaged as
`@steven-cutting/biscuit-games` for GitHub Packages; see
[decision 0013](docs/decisions/0013-shared-material-travels-as-a-package.md) and
[Published artefacts](docs/reference/published-artefacts.md), which says what a release carries
and whether one has been cut. The *site* still has no address of its own, because the
platform's front door belongs to Poodl; see
[decision 0012](docs/decisions/0012-the-domain-root-stays-with-poodl.md).

## The games

| Game | What it is | Where |
| --- | --- | --- |
| Poodl | An unlimited-play, Wordle-style word game. | <https://pnut.fans/poodl/> |
| Pawjong | A tile game. Intended, not yet built. | — |

## Quick start

```console
just initialize
just check
```

`just initialize` is the whole first run on macOS: both lockfiles, both toolchains, the
pinned `allium` binary and the Chromium build the story tests render in. Installing less
than that leaves `just check` failing on the piece you skipped — the browser especially,
which no lockfile accounts for.

On Linux that Chromium also needs system libraries. They are the one piece
`just initialize` names rather than installs, because installing them asks for sudo, so run
`just storybook-browsers-deps` once as well. See [Commands](docs/reference/commands.md).

`just --list` prints every recipe. Each one is described in
[Commands](docs/reference/commands.md).

Do not run `just install-hooks` from a secondary git worktree: `.git/hooks` is shared across
every worktree of this repository, and the installed hook names an absolute path into the
worktree that installed it.

## Check your work

```console
just fix      # the aggregate repair command
just check    # every gate, read-only, proving the worktree is unchanged
```

## Layout

```text
src/app.css          The platform's design tokens, measured by tests/contrast.test.ts
src/lib/components/  Shared Svelte 5 components, runes only, and the icon map
src/lib/assets/      The two committed typefaces and the icon set, with their licences
src/lib/ports/       The preferences port: interface, adapter, fake
src/lib/domain/      The appearance derivations the specification states
src/routes/          The prerendered front door
docs/                The handbook
docs/specs/          Allium specifications — the shared behaviour every game inherits
tests/               Vitest suites, never colocated
stories/             Svelte CSF stories, one per component, plus the token sheet
```

## Documentation

Start at [the documentation map](docs/README.md).

- [Purpose and scope](docs/project/purpose-and-scope.md) — what this repository is, and is not
- [What the hub owns](docs/project/what-the-hub-owns.md) — the boundary between here and a game
- [Design direction](docs/design/direction.md) — how Biscuit Games looks and feels, and why
- [Architecture decisions](docs/decisions/README.md) — what was chosen, and what it cost

Engineering conventions and the agent working agreement are in [AGENTS.md](AGENTS.md).

## Boundaries

A fact that every game shares is decided here, once. A fact about one game is decided in that
game's own repository. Files travel as a package — a game installs
`@steven-cutting/biscuit-games` at an exact version rather than copying — and the handbook
travels by citation, because no package carries a page path. See
[decision 0013](docs/decisions/0013-shared-material-travels-as-a-package.md) and
[Consume the hub from a game repository](docs/how-to/consume-the-hub.md).
