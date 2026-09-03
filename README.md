# Biscuit Games

The hub for Biscuit Games: a small static site that says what the platform is and links to
the games, and the source of truth for everything the games share — the design system, the
shared components, the character, and every cross-cutting decision.

**Status: bootstrapped, and not yet published.** The toolchain, the token vocabulary and one
component are in place. The site has no address of its own yet, because the platform's front
door still belongs to Poodl; see
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
src/app.css          The platform's design tokens — the artefact that matters
src/lib/components/  Shared Svelte 5 components, runes only
src/lib/assets/      The two committed typefaces, with their licences
src/routes/          The prerendered front door
docs/                The handbook
docs/specs/          Allium specifications — the shared behaviour every game inherits
tests/               Vitest suites, never colocated
stories/             Svelte CSF stories, one per component
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
game's own repository. Nothing here is published as a package: a game copies a value and cites
the page it came from, and proves the copy with its own tests. See
[decision 0002](docs/decisions/0002-shared-material-travels-by-citation.md).
